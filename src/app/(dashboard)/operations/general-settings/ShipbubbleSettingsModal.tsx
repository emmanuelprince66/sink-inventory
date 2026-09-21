"use client";

import AddressAutocomplete from "@/components/app/AddressAutocomplete";
import { CustomModal } from "@/components/app/CustomModal";
import { PhoneInput } from "@/components/app/PhoneInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/toast/useToast";
import { useShipbubbleHook } from "@/hooks/useShipbubbleHook";
import { cn } from "@/lib/utils";
import {
  fetchAddressFromCoordinates,
  geocodeAddress,
  type AddressSuggestion,
} from "@/utils/address";
import { City, State } from "country-state-city";
import {
  CheckCircle2,
  ChevronRight,
  Landmark,
  Layers,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  Package,
  Pencil,
  Save,
  Search,
  Settings as SettingsIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import BoxSizePickerModal from "./BoxSizePickerModal";

// A GPS fix carries an accuracy radius in metres. A real satellite fix lands
// under ~50m; a phone using wifi/cell triangulation lands in the hundreds. When
// the browser has neither it falls back to IP geolocation, which resolves to
// the ISP's egress node and can be hundreds of kilometres out — that is what
// puts a merchant in Akure on Third Mainland Bridge in Lagos.
//
// Anything beyond this radius is rejected outright rather than warned about:
// a pin that wrong would misroute every rider, and the address it reverse
// geocodes to looks entirely plausible, so a warning alone gets clicked past.
const MAX_USABLE_ACCURACY_M = 1_000;
// Above this we still accept the fix but say plainly that it is approximate.
// Also the early-exit bar: once a reading is this tight, stop watching.
const GOOD_ACCURACY_M = 100;
// How long to keep listening for a better fix before taking the best so far.
// Long enough for a phone to move from a cell-tower estimate to a satellite
// lock, short enough that nobody thinks the button is broken.
const GPS_WATCH_WINDOW_MS = 8_000;

/** "12m" / "1.4km" / "604km" — metres are unreadable past a few thousand. */
const formatAccuracy = (metres: number) =>
  metres < 1_000
    ? `${Math.round(metres)}m`
    : `${(metres / 1_000).toFixed(metres < 10_000 ? 1 : 0)}km`;

interface ShipbubbleSettingsModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional callback fired after a successful save (e.g. to flip a parent toggle). */
  onSaved?: () => void;
}

const ShipbubbleSettingsModal = ({
  open,
  onClose,
  onSaved,
}: ShipbubbleSettingsModalProps) => {
  const {
    boxSizes,
    boxSizesLoading,
    categories,
    categoriesLoading,
    settings,
    companies,
    updateSetting,
    save,
    validateSettings,
    isSaving,
    resetFromBusiness,
    applyAddressSuggestion,
    clearCoordinates,
    setCoordinates,
    hasCoordinates,
  } = useShipbubbleHook();

  // The pickup point can be pinned two ways, and each is the fallback for the
  // other:
  //   - "search": geocode the address the merchant picks from the
  //     autocomplete. Works on any device, including desktop, where GPS is
  //     usually unavailable and the browser guesses from the IP.
  //   - "gps": the device's own fix. More precise than any geocoder when the
  //     merchant is actually standing at the pickup point, but it depends on
  //     permissions and signal, so it fails often.
  // The order form only offers search: there GPS would pin the customer's
  // delivery to the merchant's shop.
  //
  // Behind both sits a third, automatic source: when the merchant fills
  // street/city/state by hand, that address is geocoded quietly so the save
  // still carries coordinates that agree with the text.
  const [pinMethod, setPinMethod] = useState<"search" | "gps">("search");
  // Which method produced the coordinates currently held. Null means they
  // came from a previous save, or there are none.
  const [pinSource, setPinSource] = useState<
    "search" | "gps" | "typed" | null
  >(null);
  // The merchant pressed "Change" on a locked state/city. The pin stays until
  // they actually edit something, then it is re-derived from the new address.
  const [regionUnlocked, setRegionUnlocked] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<
    "idle" | "loading" | "failed"
  >("idle");
  const geocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped by every new lookup and by every pin from elsewhere, so a slow
  // answer can never overwrite something the merchant did after asking.
  const geocodeRequestRef = useRef(0);
  // A suggestion was picked, but the provider returned no coordinates for it.
  const [searchPinFailed, setSearchPinFailed] = useState(false);
  // Which of state/city the pin itself supplied. Those are locked while the
  // pin stands: a city edited away from its coordinates sends Shipbubble an
  // address that contradicts itself, which misquotes rates and misroutes
  // riders. Whatever the pin did not supply stays editable, so an incomplete
  // lookup never leaves the merchant unable to save. Captured at pin time
  // rather than derived from the current values, or a city being typed into
  // an empty field would lock after its first keystroke.
  const [pinLock, setPinLock] = useState({ state: false, city: false });
  // Set on open; the snapshot is taken on the next render, once
  // resetFromBusiness has landed the saved values.
  const [snapshotPending, setSnapshotPending] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [gpsError, setGpsError] = useState<string | null>(null);
  // Metres of uncertainty reported by the device — surfaced so a merchant can
  // tell a rooftop-accurate fix from a cell-tower guess before saving.
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  // The human-readable address the captured point resolves to. Null means the
  // lookup found nothing or failed — the pin is still valid either way, so
  // this never blocks saving.
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  // Best accuracy seen so far in the current capture, shown live so the
  // merchant can watch the fix tighten instead of staring at a spinner.
  const [liveAccuracy, setLiveAccuracy] = useState<number | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const watchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bestFixRef = useRef<GeolocationCoordinates | null>(null);

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (watchTimerRef.current) {
      clearTimeout(watchTimerRef.current);
      watchTimerRef.current = null;
    }
  };

  // A device rarely returns its best fix first: phones typically answer from
  // the cell network within a second, then tighten to a satellite lock a few
  // seconds later. Watching for a short window and keeping the tightest
  // reading is the difference between pinning 800m and pinning 15m.
  const applyBestFix = () => {
    stopWatching();

    const coords = bestFixRef.current;
    if (!coords) {
      setGpsStatus("error");
      setGpsError("Couldn't get your location. Please try again.");
      return;
    }

    const { latitude, longitude, accuracy } = coords;

    // Reject an unusable fix rather than pinning it. This also skips the
    // reverse geocode: resolving 604km-wide coordinates returns a real,
    // confident-looking address for somewhere the merchant has never been,
    // which misleads far more than showing nothing.
    if (Number.isFinite(accuracy) && accuracy > MAX_USABLE_ACCURACY_M) {
      setGpsStatus("error");
      setGpsAccuracy(null);
      setResolvedAddress(null);
      setGpsError(
        `Your browser could only place you within ${formatAccuracy(
          accuracy,
        )}, so this location was not saved. That usually means no GPS is available — common on desktop, where the position is guessed from your internet connection. Open this page on a phone at your pickup point, or fill in the address below by hand.`,
      );
      return;
    }

    // The pin is what riders navigate to, so commit it before the lookup — a
    // slow or failed reverse geocode must never cost the merchant their fix.
    cancelGeocode();
    setRegionUnlocked(false);
    setCoordinates(latitude, longitude);
    setPinSource("gps");
    setSearchPinFailed(false);
    // Nothing is vouched for until the reverse lookup answers.
    setPinLock({ state: false, city: false });
    setGpsAccuracy(Number.isFinite(accuracy) ? Math.round(accuracy) : null);
    setGpsStatus("success");

    // Then fill the address in behind it, purely as confirmation and to save
    // typing. Failure is silent by design.
    setResolvingAddress(true);
    fetchAddressFromCoordinates(latitude, longitude)
      .then((suggestion) => {
        if (!suggestion) return;
        setResolvedAddress(suggestion.label || suggestion.address || null);
        applyAddressSuggestion({
          ...suggestion,
          // Keep the device's own fix rather than the provider's snapped
          // centroid for the matched building.
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        });
        setPinLock(regionLockFor(suggestion));
        if (suggestion.city) setCustomCityMode(true);
      })
      .finally(() => setResolvingAddress(false));
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      setGpsError("This browser doesn't support location access.");
      return;
    }

    stopWatching();
    bestFixRef.current = null;
    setLiveAccuracy(null);
    setGpsStatus("loading");
    setGpsError(null);
    setResolvedAddress(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const best = bestFixRef.current;
        if (!best || position.coords.accuracy < best.accuracy) {
          bestFixRef.current = position.coords;
          setLiveAccuracy(Math.round(position.coords.accuracy));
        }

        // Already precise enough that more waiting buys nothing.
        if (position.coords.accuracy <= GOOD_ACCURACY_M) applyBestFix();
      },
      (err) => {
        stopWatching();
        setGpsStatus("error");
        setGpsAccuracy(null);
        setLiveAccuracy(null);
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied. Allow it in your browser settings, then try again."
            : err.code === err.TIMEOUT
              ? "Timed out finding your location. Move somewhere with a clearer view of the sky and try again."
              : "Couldn't get your location. Please try again.",
        );
      },
      { enableHighAccuracy: true, timeout: GPS_WATCH_WINDOW_MS, maximumAge: 0 },
    );

    // Hard stop: take whatever the best reading was by the end of the window.
    watchTimerRef.current = setTimeout(applyBestFix, GPS_WATCH_WINDOW_MS);
  };

  // A provider state only counts if it is one the dropdown knows — anything
  // else ("Lagos State", a typo) is left editable for the merchant to fix.
  const regionLockFor = (suggestion: AddressSuggestion) => {
    const state = NG_STATES.some((s) => s.name === suggestion.state);
    return { state, city: state && Boolean(suggestion.city?.trim()) };
  };

  // "Change" on a locked state/city. The pin is kept for now, since the
  // merchant may only be checking. The first real edit replaces it.
  const unlockRegion = () => {
    setPinLock({ state: false, city: false });
    setRegionUnlocked(true);
  };

  const cancelGeocode = () => {
    if (geocodeTimerRef.current) {
      clearTimeout(geocodeTimerRef.current);
      geocodeTimerRef.current = null;
    }
    geocodeRequestRef.current += 1;
    setGeocodeStatus("idle");
  };

  const scheduleGeocode = (
    street: string,
    city: string,
    state: string,
    delayMs: number,
  ) => {
    cancelGeocode();
    const stateIso = NG_STATES.find((s) => s.name === state)?.isoCode;
    if (!stateIso || !city.trim() || street.trim().length < 3) return;

    const request = geocodeRequestRef.current;
    geocodeTimerRef.current = setTimeout(async () => {
      geocodeTimerRef.current = null;
      setGeocodeStatus("loading");
      const match = await geocodeAddress(street, city, state, stateIso);
      if (request !== geocodeRequestRef.current) return;
      if (!match) {
        setGeocodeStatus("failed");
        return;
      }
      // Coordinates only: the merchant's own city/state wording stands.
      setCoordinates(Number(match.latitude), Number(match.longitude));
      setPinSource("typed");
      setRegionUnlocked(false);
      setResolvedAddress(match.label || match.address || null);
      setGeocodeStatus("idle");
    }, delayMs);
  };

  // State or city was edited. Coordinates that no longer describe the address
  // are dropped and looked up again from the new text. The exception is a
  // search/GPS pin that simply didn't resolve this field: filling the gap
  // mustn't throw away a good fix.
  const handleRegionEdited = (state: string, city: string, delayMs = 300) => {
    const replacesPin = !hasCoordinates || pinSource === "typed" || regionUnlocked;
    if (!replacesPin) return;
    if (hasCoordinates) {
      clearCoordinates();
      setPinSource(null);
      setResolvedAddress(null);
      setGpsAccuracy(null);
    }
    scheduleGeocode(settings.street, city, state, delayMs);
  };

  const handleAddressPicked = (suggestion: AddressSuggestion) => {
    cancelGeocode();
    setRegionUnlocked(false);
    // Overwrites the coordinates too, so a pick with no coordinates clears
    // an older pin instead of leaving it attached to a different address.
    applyAddressSuggestion(suggestion);
    const pinned = Boolean(suggestion.latitude && suggestion.longitude);
    setPinLock(pinned ? regionLockFor(suggestion) : { state: false, city: false });
    setPinSource(pinned ? "search" : null);
    setSearchPinFailed(!pinned);
    setResolvedAddress(pinned ? suggestion.address || suggestion.label : null);
    setGpsStatus("idle");
    setGpsAccuracy(null);
    setGpsError(null);
  };

  const handleStreetTyped = (value: string) => {
    updateSetting("street", value);
    setSearchPinFailed(false);
    // Coordinates taken from address text stop matching once it is edited. A
    // GPS pin stays: there the street field is only a note for the rider.
    const derivedFromText = pinSource === "search" || pinSource === "typed";
    if (derivedFromText) {
      clearCoordinates();
      setPinSource(null);
      setResolvedAddress(null);
    }
    // In search mode the autocomplete dropdown is already looking the text
    // up; a second, silent lookup would race it. The plain street field
    // under GPS has no dropdown, so it geocodes on a pause in typing.
    if (pinMethod === "gps" && (derivedFromText || !hasCoordinates)) {
      scheduleGeocode(value, settings.city, settings.state, 900);
    } else {
      cancelGeocode();
    }
  };

  const switchPinMethod = (method: "search" | "gps") => {
    if (method === "search") {
      stopWatching();
      if (gpsStatus === "loading" || gpsStatus === "error") setGpsStatus("idle");
      setGpsError(null);
    }
    setPinMethod(method);
  };

  // Never leave a watch running — it keeps the GPS radio active and drains a
  // phone battery long after the modal is gone.
  useEffect(
    () => () => {
      stopWatching();
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    },
    [],
  );
  useEffect(() => {
    if (!open) {
      stopWatching();
      cancelGeocode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const { showToast } = useToast();

  const [openBoxPicker, setOpenBoxPicker] = useState(false);

  // Shipbubble operates in Nigeria only — country is locked. State + city use
  // canonical names from country-state-city so the backend's address validator
  // (geocoder) doesn't reject the address.
  const NG_STATES = useMemo(() => State.getStatesOfCountry("NG"), []);
  const selectedStateIso = useMemo(
    () => NG_STATES.find((s) => s.name === settings.state)?.isoCode || "",
    [NG_STATES, settings.state],
  );
  const cityOptions = useMemo(
    () =>
      selectedStateIso ? City.getCitiesOfState("NG", selectedStateIso) : [],
    [selectedStateIso],
  );
  // True when the saved city isn't in the dropdown list — drop into free-text
  // mode automatically so the merchant can see/edit their saved value.
  const cityIsCustom =
    settings.city.length > 0 &&
    cityOptions.length > 0 &&
    !cityOptions.some((c) => c.name === settings.city);
  const [customCityMode, setCustomCityMode] = useState(false);
  const useCustomCityInput =
    customCityMode ||
    cityIsCustom ||
    (selectedStateIso && cityOptions.length === 0);

  const handleStateChange = (iso: string) => {
    const name = NG_STATES.find((s) => s.isoCode === iso)?.name || "";
    updateSetting("state", name);
    updateSetting("city", "");
    setCustomCityMode(false);
    handleRegionEdited(name, "");
  };

  const handleCityChange = (city: string, delayMs?: number) => {
    updateSetting("city", city);
    handleRegionEdited(settings.state, city, delayMs);
  };

  const stateLocked = hasCoordinates && pinLock.state && Boolean(selectedStateIso);
  const cityLocked = stateLocked && pinLock.city && Boolean(settings.city.trim());

  // Snapshot the lock for coordinates that were already saved, once the
  // hydrated values are in.
  useEffect(() => {
    if (!snapshotPending) return;
    setSnapshotPending(false);
    setPinLock({
      state: hasCoordinates && Boolean(selectedStateIso),
      city: hasCoordinates && Boolean(selectedStateIso) && Boolean(settings.city.trim()),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotPending]);

  // Re-hydrate from the live business object every time the modal re-opens.
  useEffect(() => {
    if (open) {
      resetFromBusiness();
      setCustomCityMode(false);
      setPinMethod("search");
      setPinSource(null);
      setSearchPinFailed(false);
      setGpsStatus("idle");
      setGpsAccuracy(null);
      setGpsError(null);
      setResolvedAddress(null);
      setPinLock({ state: false, city: false });
      setSnapshotPending(true);
      setRegionUnlocked(false);
      cancelGeocode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSave = () => {
    const err = validateSettings();
    if (err) {
      showToast(err, "error");
      return;
    }
    // Saving the Shipbubble Configure form is, by definition, enabling and
    // activating Shipbubble — always include it in shipping_companies AND
    // flip is_active on, so the AutomatedShipping toggle reflects "on"
    // immediately once this save succeeds, without a separate manual toggle.
    const nextCompanies = Array.from(
      new Set([...companies, "SHIPBUBBLE" as const]),
    );
    save(
      { shippingCompanies: nextCompanies, settingsPatch: { isActive: true } },
      {
        onSuccess: () => {
          onSaved?.();
          onClose();
        },
      },
    );
  };

  return (
    <>
      <CustomModal
        isOpen={open}
        onClose={onClose}
        title="Shipbubble Settings"
        description="Tell Shipbubble where to collect parcels and what a default shipment looks like."
        size="lg"
        headerIcon={
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <SettingsIcon className="w-4 h-4" />
          </div>
        }
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-500">
              Changes apply to new shipments only.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-slate-200 flex-1 sm:flex-none"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Step 1 — Pickup Address */}
          <SettingsTile
            step={1}
            icon={<MapPin className="w-4 h-4" />}
            title="Pickup Address"
            description="Where Shipbubble riders should collect every shipment."
          >
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Field label="Pin your pickup point">
                  {/* Two ways to pin the point. Neither works every time, so
                      each one links to the other when it fails. */}
                  <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <PinMethodButton
                      active={pinMethod === "search"}
                      onClick={() => switchPinMethod("search")}
                      icon={<Search className="h-3.5 w-3.5" />}
                      title="Search address"
                      hint="Works on any device"
                    />
                    <PinMethodButton
                      active={pinMethod === "gps"}
                      onClick={() => switchPinMethod("gps")}
                      icon={<LocateFixed className="h-3.5 w-3.5" />}
                      title="Current location"
                      hint="Best on a phone, at the shop"
                    />
                  </div>

                  <div className="mt-3 space-y-3">
                    {pinMethod === "search" ? (
                      <div>
                        <AddressAutocomplete
                          value={settings.street}
                          onChange={handleStreetTyped}
                          onSelect={handleAddressPicked}
                          placeholder="Search your pickup address, e.g. 14 Allen Avenue, Ikeja"
                          hasCoordinates={hasCoordinates && pinSource === "search"}
                          hideHint
                          renderNoResults={() => (
                            <p className="mt-1.5 text-[11px] text-grey-3">
                              No match for that address.{" "}
                              <button
                                type="button"
                                onClick={() => switchPinMethod("gps")}
                                className="font-semibold text-emerald-700 hover:text-emerald-800"
                              >
                                Use your current location instead
                              </button>
                            </p>
                          )}
                        />
                        {searchPinFailed ? (
                          <p className="mt-1.5 text-[11px] font-medium text-amber-700">
                            We found this address but couldn&apos;t pin its exact
                            location. Pick another suggestion, or{" "}
                            <button
                              type="button"
                              onClick={() => switchPinMethod("gps")}
                              className="font-semibold underline underline-offset-2"
                            >
                              use your current location
                            </button>
                            .
                          </p>
                        ) : (
                          !hasCoordinates && (
                            <p className="mt-1.5 text-[11px] text-grey-3">
                              Pick a suggestion from the list so riders get the
                              exact point.
                            </p>
                          )
                        )}
                      </div>
                    ) : (
                      !hasCoordinates && (
                        <div className="rounded-lg border border-dashed border-grey-5 bg-grey-6/40 p-4 text-center">
                          <MapPin className="mx-auto h-5 w-5 text-grey-4" />
                          <p className="mt-2 text-xs leading-relaxed text-grey-3">
                            Stand at your pickup location and capture its
                            coordinates. Riders are routed to this exact point.
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleCaptureGps}
                            disabled={gpsStatus === "loading"}
                            className="mt-3 text-xs font-semibold"
                          >
                            {gpsStatus === "loading" ? (
                              <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                {liveAccuracy != null
                                  ? `Improving fix… ±${formatAccuracy(liveAccuracy)}`
                                  : "Getting location…"}
                              </>
                            ) : (
                              <>
                                <LocateFixed className="mr-2 h-3.5 w-3.5" />
                                Use my current location
                              </>
                            )}
                          </Button>
                        </div>
                      )
                    )}

                    {hasCoordinates && (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2 min-w-0">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-emerald-900">
                                Pickup point pinned
                              </p>
                              {/* The address leads: it is the only part a
                                  merchant can actually check. A lat/long pair
                                  reads as noise, so coordinates appear only
                                  when there is no address to show. */}
                              {resolvingAddress ? (
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Looking up the address…
                                </p>
                              ) : resolvedAddress ? (
                                <p className="mt-1 text-[13px] font-semibold leading-snug text-emerald-900">
                                  {resolvedAddress}
                                </p>
                              ) : (
                                <p className="mt-1 font-mono text-[11px] text-emerald-800 break-all">
                                  {settings.latitude}, {settings.longitude}
                                </p>
                              )}
                              <p className="mt-1 text-[11px] text-emerald-700">
                                {pinSource === "gps"
                                  ? gpsAccuracy != null
                                    ? `From your device's location, accurate to about ${formatAccuracy(gpsAccuracy)}`
                                    : "From your device's location"
                                  : pinSource === "search"
                                    ? "From the address you picked"
                                    : pinSource === "typed"
                                      ? "Found from the address you entered"
                                      : "Saved from a previous setup"}
                              </p>
                            </div>
                          </div>
                          {pinMethod === "gps" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={handleCaptureGps}
                              disabled={gpsStatus === "loading"}
                              className="shrink-0 border-emerald-400 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold"
                            >
                              {gpsStatus === "loading" ? (
                                <>
                                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  {liveAccuracy != null
                                    ? `±${formatAccuracy(liveAccuracy)}`
                                    : "Updating"}
                                </>
                              ) : (
                                <>
                                  <LocateFixed className="mr-1.5 h-3.5 w-3.5" />
                                  {pinSource === "gps" ? "Recapture" : "Use my location"}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        {/* Accepted, but wide enough to be worth flagging — a
                            few hundred metres is wifi/cell triangulation rather
                            than a satellite fix. */}
                        {pinSource === "gps" &&
                          gpsAccuracy != null &&
                          gpsAccuracy > GOOD_ACCURACY_M && (
                            <p className="mt-2 text-[11px] font-medium text-amber-700">
                              This pin is approximate. Step outside and recapture
                              for a tighter fix, or search your address instead.
                            </p>
                          )}
                      </div>
                    )}

                    {pinMethod === "gps" && gpsStatus === "error" && gpsError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-xs font-medium text-red-700">
                          {gpsError}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => switchPinMethod("search")}
                          className="mt-2 border-red-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Search className="mr-1.5 h-3.5 w-3.5" />
                          Search your address instead
                        </Button>
                      </div>
                    )}
                  </div>
                </Field>
              </div>

              {/* In search mode the autocomplete above is the street field. */}
              {pinMethod === "gps" && (
                <div className="sm:col-span-2">
                  <Field label="Street">
                    <Input
                      value={settings.street}
                      onChange={(e) => handleStreetTyped(e.target.value)}
                      placeholder="e.g. 14 Allen Avenue, Ikeja"
                    />
                    <p className="mt-1.5 text-[11px] text-grey-3">
                      Written for the rider to read. The pinned point above is
                      what they navigate to.
                    </p>
                  </Field>
                </div>
              )}
              {/* State and city come from the pin when it resolved them, and
                  are locked to it — see pinLock. */}
              {cityLocked ? (
                <div className="sm:col-span-2">
                  <Field label="City & State">
                    <LockedValue
                      value={`${settings.city}, ${settings.state}`}
                      onChange={unlockRegion}
                    />
                  </Field>
                </div>
              ) : (
                <>
                  <Field label="State">
                    {stateLocked ? (
                      <LockedValue
                        value={settings.state}
                        onChange={unlockRegion}
                      />
                    ) : (
                      <Select
                        value={selectedStateIso}
                        onValueChange={handleStateChange}
                      >
                        <SelectTrigger className="bg-white w-full">
                          <SelectValue placeholder="Pick a state" />
                        </SelectTrigger>
                        <SelectContent>
                          {NG_STATES.map((s) => (
                            <SelectItem key={s.isoCode} value={s.isoCode}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                  <Field label="City">
                    {useCustomCityInput ? (
                      <div className="space-y-1.5">
                        <Input
                          value={settings.city}
                          // Longer pause than the dropdown: this fires on
                          // every keystroke, and "Ib" is not a city yet.
                          onChange={(e) => handleCityChange(e.target.value, 900)}
                          placeholder={
                            selectedStateIso
                              ? "Enter your city"
                              : "Pick a state first"
                          }
                          disabled={!selectedStateIso}
                        />
                        {cityOptions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomCityMode(false);
                              handleCityChange("");
                            }}
                            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3" />
                            Back to city list
                          </button>
                        )}
                      </div>
                    ) : (
                      <Select
                        value={settings.city}
                        onValueChange={(v) => {
                          if (v === "__other__") {
                            setCustomCityMode(true);
                            handleCityChange("");
                          } else {
                            handleCityChange(v);
                          }
                        }}
                        disabled={!selectedStateIso}
                      >
                        <SelectTrigger className="bg-white w-full">
                          <SelectValue
                            placeholder={
                              selectedStateIso
                                ? "Pick a city"
                                : "Pick a state first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {cityOptions.map((c) => (
                            <SelectItem key={c.name} value={c.name}>
                              {c.name}
                            </SelectItem>
                          ))}
                          <SelectItem
                            value="__other__"
                            className="text-emerald-700 font-semibold"
                          >
                            Other (type your own)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                </>
              )}
              {geocodeStatus !== "idle" && (
                <div className="sm:col-span-2 -mt-1">
                  {geocodeStatus === "loading" ? (
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Finding this address on the map…
                    </p>
                  ) : (
                    <p className="text-[11px] font-medium text-amber-700">
                      We couldn&apos;t find this address on the map, so it
                      isn&apos;t pinned. You can still save, and riders will
                      use the written address. For an exact pin,{" "}
                      <button
                        type="button"
                        onClick={() =>
                          switchPinMethod(pinMethod === "gps" ? "search" : "gps")
                        }
                        className="font-semibold underline underline-offset-2"
                      >
                        {pinMethod === "gps"
                          ? "search for it"
                          : "use your current location"}
                      </button>
                      .
                    </p>
                  )}
                </div>
              )}
              {/* Full width — the country-code selector plus a Nigerian
                  number crowds a half-width column on smaller screens. */}
              <div className="sm:col-span-2">
                <Field label="Phone">
                  <PhoneInput
                    value={settings.phone || undefined}
                    onChange={(value) => updateSetting("phone", value || "")}
                    defaultCountry="NG"
                    placeholder="Phone number"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Landmark">
                  <div className="relative">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <Input
                      value={settings.landmark}
                      onChange={(e) =>
                        updateSetting("landmark", e.target.value)
                      }
                      placeholder="e.g. Behind Shoprite"
                      className="pl-9"
                    />
                  </div>
                </Field>
              </div>
            </div>
          </SettingsTile>

          {/* Step 2 — Shipping Category */}
          <SettingsTile
            step={2}
            icon={<Layers className="w-4 h-4" />}
            title="Shipping Category"
            description="Helps Shipbubble pick carriers and rate cards that match your products."
          >
            {categoriesLoading ? (
              <Skeleton className="mt-3 h-10 w-full bg-slate-100" />
            ) : (
              <Select
                value={
                  settings.category ? String(settings.category.category_id) : ""
                }
                onValueChange={(v) => {
                  const picked = categories.find(
                    (c) => String(c.category_id) === v,
                  );
                  if (picked) updateSetting("category", picked);
                }}
              >
                <SelectTrigger className="mt-3 bg-white w-full">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem
                      key={c.category_id}
                      value={String(c.category_id)}
                    >
                      {c.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </SettingsTile>

          {/* Step 3 — Default Package Size */}
          <SettingsTile
            step={3}
            icon={<Package className="w-4 h-4" />}
            title="Default Package Size"
            description="Used when a product hasn't set its own dimensions. Tap to pick from the Shipbubble catalogue."
          >
            <button
              type="button"
              onClick={() => setOpenBoxPicker(true)}
              className="mt-3 w-full flex items-center gap-3 sm:gap-4 p-3 rounded-lg border-2 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-white border border-emerald-100 flex items-center justify-center shrink-0 overflow-hidden">
                {settings.packageSize?.description_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.packageSize.description_image_url}
                    alt={settings.packageSize.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Package className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">
                  {settings.packageSize?.name || "Pick a box size"}
                </p>
                {settings.packageSize ? (
                  <>
                    <p className="text-xs text-slate-700 mt-0.5">
                      Max Weight: {settings.packageSize.max_weight} Kg
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      H:{settings.packageSize.height}cm · L:
                      {settings.packageSize.length}cm · W:
                      {settings.packageSize.width}cm
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Envelope, Flyer, Small Box, etc.
                  </p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-700 shrink-0" />
            </button>
          </SettingsTile>
        </div>
      </CustomModal>

      <BoxSizePickerModal
        isOpen={openBoxPicker}
        onClose={() => setOpenBoxPicker(false)}
        value={settings.packageSize}
        onChange={(size) => updateSetting("packageSize", size)}
        options={boxSizes}
        loading={boxSizesLoading}
      />
    </>
  );
};

// ─── Layout helpers ─────────────────────────────────────────────────────────

/** A state/city value supplied by the pin. "Change" drops the pin. */
const LockedValue = ({
  value,
  onChange,
}: {
  value: string;
  onChange: () => void;
}) => (
  <div>
    <div className="flex h-10 items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
      <span className="flex min-w-0 items-center gap-2 text-sm text-slate-800">
        <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="truncate">{value}</span>
      </span>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Change
      </button>
    </div>
    <p className="mt-1.5 text-[11px] text-grey-3">
      Set from your pinned location. If you change it, we&apos;ll re-pin
      from the new address.
    </p>
  </div>
);

const PinMethodButton = ({
  active,
  onClick,
  icon,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  hint: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "rounded-md px-2.5 py-2 text-left transition-colors",
      active
        ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200"
        : "text-slate-600 hover:bg-white/60",
    )}
  >
    <span className="flex items-center gap-1.5 text-xs font-semibold">
      {icon}
      {title}
    </span>
    <span className="mt-0.5 block text-[10px] text-slate-500">{hint}</span>
  </button>
);

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1.5">
      {label}
    </Label>
    {children}
  </div>
);

interface SettingsTileProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}
const SettingsTile = ({
  step,
  icon,
  title,
  description,
  children,
}: SettingsTileProps) => (
  <div className="relative bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
    <span className="absolute left-0 top-4 bottom-4 w-1 rounded-r bg-slate-200" />
    <div className="pl-4 pr-3 sm:pl-5 sm:pr-4 py-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-lg flex flex-col items-center justify-center border bg-slate-50 border-slate-200 text-slate-600">
          <span className="text-[8px] font-semibold uppercase tracking-wider opacity-80">
            Step
          </span>
          <span className="text-[10px] font-bold leading-none">
            {String(step).padStart(2, "0")}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="text-slate-500 mt-0.5">{icon}</span>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900">{title}</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  </div>
);

export default ShipbubbleSettingsModal;

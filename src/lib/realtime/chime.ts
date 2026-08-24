/**
 * The new-order chime.
 *
 * Two things the browser makes awkward. Autoplay is blocked until the page has
 * seen a user gesture, so the first order of a session would fail silently
 * unless we unlock ahead of time — we prime a muted play on the first pointer
 * or key event and then rewind. And constructing a fresh Audio per event leaks
 * elements on a till that runs all day, so one instance is reused.
 *
 * Every failure path is swallowed: a missing file or a denied autoplay policy
 * must never take out the notification it was announcing.
 */
// WAV rather than MP3: it is generated from a script that lives in the repo
// history, so the asset can be regenerated instead of being an opaque binary
// nobody can reproduce. Short enough that the size difference is irrelevant.
const CHIME_SRC = "/sounds/order-chime.wav";

let element: HTMLAudioElement | null = null;
let unlocked = false;
let listening = false;

const get = (): HTMLAudioElement | null => {
  if (typeof window === "undefined") return null;
  if (!element) {
    element = new Audio(CHIME_SRC);
    element.preload = "auto";
    element.volume = 0.6;
  }
  return element;
};

/**
 * Called once from the provider. Registers a one-shot listener that satisfies
 * the autoplay gesture requirement the first time the user touches the page.
 */
export const primeChime = (): (() => void) => {
  if (typeof window === "undefined" || listening) return () => {};
  listening = true;

  const unlock = () => {
    const audio = get();
    if (!audio) return;
    const previousVolume = audio.volume;
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = previousVolume;
        unlocked = true;
      })
      .catch(() => {
        audio.volume = previousVolume;
      });
    detach();
  };

  const detach = () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    listening = false;
  };

  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });

  return detach;
};

export const playChime = () => {
  const audio = get();
  if (!audio) return;
  try {
    // Rewind rather than overlap: two orders a second apart should chime twice,
    // not layer on top of each other.
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  } catch {
    // Ignore — see the note above.
  }
};

/** Exposed for a settings toggle later; true once a gesture has unlocked audio. */
export const chimeIsUnlocked = () => unlocked;

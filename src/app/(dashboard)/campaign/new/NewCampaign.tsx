"use client";

import { useState } from "react";
import ChannelPicker from "./ChannelPicker";
import ComposeCampaign from "./ComposeCampaign";
import { CampaignChannel } from "./channel";

/**
 * Two steps on one route: pick a channel, then compose for it.
 *
 * Kept as local state rather than a query param because the composer holds an
 * unsaved draft — a browser Back that swapped the channel out from under a
 * half-written message would lose it silently. The in-page Back button is the
 * only way out, and it is the one the merchant sees.
 */
const NewCampaign = () => {
  const [channel, setChannel] = useState<CampaignChannel | null>(null);

  if (!channel) return <ChannelPicker onSelect={setChannel} />;

  return (
    <ComposeCampaign channel={channel} onBack={() => setChannel(null)} />
  );
};

export default NewCampaign;

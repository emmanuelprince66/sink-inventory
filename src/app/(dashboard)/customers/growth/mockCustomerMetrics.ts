// Deterministic placeholder metrics for the real customer list's new
// Tier/Points/Risk/Score columns — the backend doesn't return these fields
// yet. Seeded off the customer's id so the same customer always shows the
// same mock values across renders/refetches instead of jumping around.

export type CustomerTier = "VIP" | "Gold" | "Silver" | "Bronze";
export type CustomerRisk = "Low" | "Medium" | "High" | "Critical";

export interface MockCustomerMetrics {
  tier: CustomerTier;
  points: number;
  risk: CustomerRisk;
  score: number;
}

const seedFromId = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const getMockCustomerMetrics = (id: string): MockCustomerMetrics => {
  const seed = seedFromId(id || "0");
  const score = seed % 100;

  const tier: CustomerTier =
    score >= 85 ? "VIP" : score >= 65 ? "Gold" : score >= 35 ? "Silver" : "Bronze";

  const risk: CustomerRisk =
    score >= 70 ? "Low" : score >= 45 ? "Medium" : score >= 20 ? "High" : "Critical";

  const points = (seed % 50) * 100 + 100;

  return { tier, points, risk, score };
};

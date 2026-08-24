/**
 * KYC tiers, the transaction limits they unlock, and the document checklists
 * each tier asks for.
 *
 * One source of truth on purpose: these figures were previously written out by
 * hand in three places and had drifted badly — the individual tiers were being
 * advertised at ₦5M / ₦10M / ₦50M when the real limits are ₦50K / ₦200K / ₦5M,
 * overstating Tier 1 by a hundredfold. A merchant reading that would plan
 * around money the account cannot move.
 */

export interface KycTier {
  tier: number;
  title: string;
  /** What has to be supplied to reach this tier. */
  requirement: string;
  /** Daily / single transaction limit, formatted for display. */
  limit: string;
  description: string;
}

export const INDIVIDUAL_TIERS: KycTier[] = [
  {
    tier: 1,
    title: "Basic Verification",
    requirement: "NIN or BVN",
    limit: "₦50,000",
    description: "Either identity number is enough to start.",
  },
  {
    tier: 2,
    title: "Enhanced Verification",
    requirement: "NIN and BVN",
    limit: "₦200,000",
    description: "Both identity numbers on file.",
  },
  {
    tier: 3,
    title: "Full Verification",
    requirement: "NIN, BVN and proof of address",
    limit: "₦5,000,000",
    description: "Adds a verified residential address.",
  },
];

export const CORPORATE_TIERS: KycTier[] = [
  {
    tier: 1,
    title: "Business Information",
    requirement: "Director & business details",
    limit: "₦100,000",
    description: "Who runs the business and where it is registered.",
  },
  {
    tier: 2,
    title: "Full Legal & Director Verification",
    requirement: "CAC documents, TIN & director records",
    limit: "₦5,000,000",
    description: "Company filings plus a record for every director.",
  },
];

/** "₦50,000 daily" — the limits are per day as well as per transaction. */
export const dailyLimit = (tier: KycTier) => `${tier.limit} daily`;

/**
 * Individual Tier 3 accepts either of these as proof of address. The value is
 * what gets sent; the label is what the merchant sees.
 */
export const PROOF_OF_ADDRESS_TYPES = [
  { value: "UTILITY_BILL", label: "Utility Bill" },
  { value: "BANK_STATEMENT", label: "Bank Statement" },
] as const;

export interface DocumentSpec {
  key: string;
  label: string;
  hint: string;
  /** File types the picker offers. Spelled out on every entry so the derived
   *  union always carries the property. */
  accept: string;
}

/** Scans and photos of paperwork. */
const PAPER = ".pdf,.jpg,.jpeg,.png";

/** Company filings required at corporate Tier 2. */
export const CORPORATE_DOCUMENTS = [
  {
    key: "cacCertificate",
    label: "CAC Certificate of Incorporation",
    hint: "The certificate issued by the Corporate Affairs Commission.",
    accept: PAPER,
  },
  {
    key: "proofOfBusinessAddress",
    label: "Proof of Business / Office Address",
    hint: "Utility bill or tenancy agreement, not older than 3 months.",
    accept: PAPER,
  },
  {
    key: "memart",
    label: "MEMART",
    hint: "Memorandum and Articles of Association.",
    accept: PAPER,
  },
  {
    key: "statusReport",
    label: "CAC Status Report / CAC Extract",
    hint: "The current status report or extract from CAC.",
    accept: PAPER,
  },
] as const satisfies readonly DocumentSpec[];

/** Every director submits this same set of four documents. */
export const DIRECTOR_DOCUMENTS = [
  {
    key: "govId",
    label: "Government-issued ID",
    hint: "NIN slip, voter's card, driver's licence or passport data page.",
    accept: PAPER,
  },
  {
    key: "proofOfAddress",
    label: "Proof of Address",
    hint: "Utility bill or bank statement, not older than 3 months.",
    accept: PAPER,
  },
  {
    key: "passport",
    label: "Passport Photograph",
    hint: "Recent passport-size photo on a plain background.",
    accept: "image/*",
  },
  {
    key: "signature",
    label: "Signature",
    hint: "A clear photo or scan of the signature on white paper.",
    accept: "image/*",
  },
] as const satisfies readonly DocumentSpec[];

export type CorporateDocKey = (typeof CORPORATE_DOCUMENTS)[number]["key"];
export type DirectorDocKey = (typeof DIRECTOR_DOCUMENTS)[number]["key"];

/** The 36 states plus the FCT — used by the corporate business-address field. */
export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

/** Registration classes CAC issues — drives the corporate Tier 2 selector. */
export const BUSINESS_TYPES = [
  { value: "BUSINESS", label: "Business Name (BN)" },
  { value: "LIMITED_LIABILITY", label: "Limited Liability (RC)" },
] as const;

import { CartItem } from "./type";

/**
 * Turning a loyalty reward into something the cashier can hand over.
 *
 * A reward from GET /loyalty/progress/{code}/ is a wallet entry, not an
 * inventory row. When it gives away a product or a service, that item goes into
 * the cart as its own line — so a redemption is rung up like any other sale
 * instead of being a number that only shows up at the total.
 *
 * The line is priced normally. The backend is what zeroes it once
 * loyalty_reward_id is on the sale, and it reports what it took off as
 * loyalty_discount; the receipt reads that back. Pricing the line at zero here
 * as well would take the reward off twice.
 */

/** Marks a cart line as belonging to a reward rather than to a product tap. */
export const REWARD_LINE_PREFIX = "reward:";

/**
 * "6784/50000 Spend" or "3/5 Visits" → [3, 5]. The wallet pre-formats progress
 * as a sentence, so the two numbers have to be read back out to draw a bar.
 */
export const parseProgress = (display?: string | null): [number, number] => {
  const match = String(display ?? "").match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (!match) return [0, 0];
  return [Number(match[1]), Number(match[2])];
};

/** The product or service a reward gives away, once resolved to inventory. */
export interface RewardItem {
  /** Inventory id — what the sale payload sends as the product id. */
  id: string;
  name: string;
  /** Which of the two the sale payload calls it. */
  type: "PRODUCT" | "SERVICE";
  price: number;
  image?: string | null;
}

const asNumber = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/**
 * The reward's own id, which is what redeems it.
 *
 * Null when the wallet gave no id. Nothing can be redeemed in that case — the
 * sale endpoint wants a UUID — so callers must not offer the reward rather than
 * inventing a stand-in, which would only fail at checkout.
 */
export const rewardIdOf = (reward: any): string | null => {
  const id = reward?.id ?? reward?.reward_id ?? reward?.uuid;
  return id ? String(id) : null;
};

/** "FREE_ITEM" → "Free item", so a raw enum never reaches the screen. */
const humanise = (value: string): string =>
  value.toLowerCase().replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

/**
 * What to call this reward on screen.
 *
 * The wallet's rewards carry no description of their own, so a caller that has
 * the enrollment should pass its reward_description — "Free juice pack3-emma"
 * — which is the only place the giveaway is named in words.
 */
export const rewardLabelOf = (reward: any, fallback?: string | null): string => {
  const named =
    reward?.reward_description ??
    reward?.description ??
    reward?.reward_summary ??
    reward?.name ??
    fallback;
  if (named) return String(named);
  return reward?.reward_type
    ? humanise(String(reward.reward_type))
    : "Loyalty reward";
};

/** True for a reward that hands over stock rather than points or credit. */
const givesAnItem = (reward: any): boolean => {
  const type = String(reward?.reward_type ?? "").toUpperCase();
  return type === "FREE_ITEM" || type === "FREE_SERVICE";
};

/** Reads a product/service detail object into a cart-ready item. */
const toRewardItem = (
  detail: any,
  type: RewardItem["type"],
  fallbackName: string,
): RewardItem | null => {
  const id = detail?.id;
  if (!id) return null;
  return {
    id: String(id),
    name: detail?.name ?? fallbackName,
    type,
    price: asNumber(
      detail?.selling_price ?? detail?.amount ?? detail?.price ?? 0,
    ),
    image: detail?.image ?? null,
  };
};

/**
 * Looks for the giveaway item on the reward itself.
 *
 * The wallet does not currently put it there — a FREE_ITEM reward comes back as
 * little more than its id, reward_type and programme name — so this returns
 * null against today's API and the programme is what actually resolves the
 * item. It is kept because the shape is documented only as an object, and the
 * moment the backend expands reward_product on it, this is what picks it up
 * without another request.
 */
const rewardItemFromReward = (reward: any): RewardItem | null => {
  if (!reward) return null;

  // A service is the exception; anything else the till sells is a product.
  const isService =
    String(reward.reward_type ?? "").toUpperCase() === "FREE_SERVICE" ||
    Boolean(reward.reward_service ?? reward.reward_service_detail);
  const type: RewardItem["type"] = isService ? "SERVICE" : "PRODUCT";

  const detail =
    reward.reward_product_detail ??
    reward.reward_service_detail ??
    reward.product_detail ??
    reward.service_detail ??
    // reward_product/reward_service are uuids on write and may come back
    // expanded on read, so they are only usable here when they are objects.
    (typeof reward.product === "object" ? reward.product : null) ??
    (typeof reward.service === "object" ? reward.service : null) ??
    (typeof reward.reward_product === "object" ? reward.reward_product : null) ??
    (typeof reward.reward_service === "object" ? reward.reward_service : null) ??
    null;

  return toRewardItem(detail, type, rewardLabelOf(reward));
};

/** Every giveaway a programme can issue: its own, plus each milestone's. */
const giveawaysOf = (program: any): Array<{ item: RewardItem; note: string }> => {
  const sources = [program, ...((program?.milestones as any[]) ?? [])];

  return sources.flatMap((source) => {
    if (!givesAnItem(source)) return [];
    const isService =
      String(source.reward_type).toUpperCase() === "FREE_SERVICE";
    const item = toRewardItem(
      isService ? source.reward_service_detail : source.reward_product_detail,
      isService ? "SERVICE" : "PRODUCT",
      source.reward_description ?? program?.name ?? "Reward",
    );
    if (!item) return [];
    return [{ item, note: String(source.reward_description ?? "") }];
  });
};

/**
 * Resolves a reward to the product or service it gives away.
 *
 * The wallet answers what someone has earned, not what to hand them: a
 * FREE_ITEM reward names its programme and nothing about the item. The
 * programme is where reward_product_detail lives, so the two are joined here on
 * programme name — the only link the wallet gives — and then on the reward
 * description, which separates a programme's own reward from its milestones'
 * when they give away different things.
 *
 * Returns null for POINTS, WALLET_CREDIT and PERCENTAGE rewards, which have
 * nothing to put in a cart: those ride on the sale as a reward id alone and the
 * backend applies them.
 */
export const resolveRewardItem = (
  reward: any,
  context?: {
    programs?: any[];
    /** The wallet's enrollment, whose reward_description names the giveaway. */
    enrollment?: any;
  },
): RewardItem | null => {
  if (!reward) return null;

  const embedded = rewardItemFromReward(reward);
  if (embedded) return embedded;

  if (!givesAnItem(reward)) return null;

  const programName =
    reward.program_name ?? context?.enrollment?.program_name ?? null;
  // Guarded rather than trusted: this runs at the till, and a paginated
  // envelope that unwrapped to something other than a list must not take the
  // whole POS down over a reward label.
  const programs = Array.isArray(context?.programs) ? context.programs : [];
  const program = programs.find(
    (candidate) => candidate?.name && candidate.name === programName,
  );
  if (!program) return null;

  const giveaways = giveawaysOf(program);
  if (giveaways.length === 0) return null;

  // "Free juice pack3-emma" on the enrollment is the reward the member is on,
  // so it picks the right one when a programme and its milestones each give
  // away something different. With nothing to match, a single giveaway is
  // unambiguous; more than one and there is no way to tell them apart.
  const description = String(context?.enrollment?.reward_description ?? "")
    .trim()
    .toLowerCase();
  const described = description
    ? giveaways.find(
        (candidate) =>
          candidate.note.trim().toLowerCase() === description ||
          candidate.item.name.trim().toLowerCase() === description,
      )
    : null;

  return described?.item ?? (giveaways.length === 1 ? giveaways[0].item : null);
};

/**
 * Builds the cart line for a reward.
 *
 * Its id is synthetic so that a customer who buys a coffee and also redeems one
 * ends up with two lines rather than a single line of two — the cart merges on
 * id, and only one of those coffees is free. `productId` carries the real
 * inventory id for the sale payload.
 *
 * Discount fields are deliberately not copied over from the product: a
 * quantity-threshold discount on a single free item is meaningless, and letting
 * one through would take money off a line the backend is about to zero anyway.
 */
export const buildRewardCartLine = (
  reward: any,
  item: RewardItem,
  rewardId: string,
  label?: string | null,
): CartItem => ({
  id: `${REWARD_LINE_PREFIX}${rewardId}`,
  productId: item.id,
  name: item.name,
  sku: "",
  status: "IN-STOCK",
  selling_price: item.price,
  amount: item.price,
  cartQuantity: 1,
  type: item.type,
  image: item.image ?? undefined,
  isReward: true,
  rewardId,
  rewardLabel: rewardLabelOf(reward, label),
});

/** True for a line a reward put in the cart. */
export const isRewardLine = (item: any): boolean =>
  Boolean(item?.isReward) || String(item?.id ?? "").startsWith(REWARD_LINE_PREFIX);

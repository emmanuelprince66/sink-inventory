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
 * reward_summary leads because the backend composes it to be read as-is —
 * "Free Ultra HD 32-Inch Smart TV", "20% Off", "₦5,000 Wallet Credit" — and it
 * is the same string the receipt prints, so the till and the paper agree.
 * Where it is absent the programme's own wording stands in, and a caller that
 * has the enrollment should pass its reward_description — "Free juice
 * pack3-emma" — as the last resort naming the giveaway in words.
 */
export const rewardLabelOf = (reward: any, fallback?: string | null): string => {
  const named =
    reward?.reward_summary ??
    reward?.reward_description ??
    reward?.description ??
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
 * The inventory id and name a reward states outright, where it does.
 *
 * reward_product_id/reward_product_name — and the service pair — are the
 * backend saying which item this is, rather than leaving it to be inferred.
 * There is no price among them, which is why this returns an id and a name and
 * not a RewardItem: the price has to come from somewhere that has it.
 */
const namedGiveawayOf = (
  reward: any,
): { id: string; name: string } | null => {
  if (!reward) return null;

  const productId = reward.reward_product_id ?? null;
  if (productId) {
    return {
      id: String(productId),
      name: String(reward.reward_product_name ?? rewardLabelOf(reward)),
    };
  }

  const serviceId = reward.reward_service_id ?? null;
  if (serviceId) {
    return {
      id: String(serviceId),
      name: String(reward.reward_service_name ?? rewardLabelOf(reward)),
    };
  }

  return null;
};

/**
 * Resolves a reward to the product or service it gives away.
 *
 * The wallet answers what someone has earned; what to hand over has to be
 * joined to the programme, which is where the priced reward_product_detail
 * lives. That join is made on reward_product_id where the reward states one —
 * an exact match on the inventory id — and otherwise on programme name and
 * reward description, which is all a reward carried before those fields
 * existed and is still what older ones carry.
 *
 * A resolved item is always priced from the programme rather than zeroed here:
 * the backend is what comps the line and reports what it took off as
 * loyalty_discount, so an item priced at zero on this side would come off the
 * receipt twice. An unpriceable item is therefore no item — the reward still
 * goes up on the sale, the cashier just hands it over without a line.
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

  // Guarded rather than trusted: this runs at the till, and a paginated
  // envelope that unwrapped to something other than a list must not take the
  // whole POS down over a reward label.
  const programs = Array.isArray(context?.programs) ? context.programs : [];
  const named = namedGiveawayOf(reward);

  // With an id in hand the programme it belongs to is irrelevant — the item is
  // looked up across all of them, which also covers a reward whose programme
  // was renamed since it was earned.
  if (named) {
    const priced = programs
      .flatMap((program) => giveawaysOf(program))
      .find((candidate) => candidate.item.id === named.id);
    // The backend's name wins over the programme's: it is the one that will
    // appear on the receipt, so the till should show the same words.
    if (priced) return { ...priced.item, name: named.name };
  }

  const programName =
    reward.program_name ?? context?.enrollment?.program_name ?? null;
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

export interface RewardEffect {
  reward_type: string;
  /** What to call it on screen — "10% Off", "₦500 Wallet Credit". */
  label: string;
  /** Money off this bill. Zero for a reward that takes nothing off. */
  discount: number;
  /** How that figure was arrived at, for the cashier. Null when obvious. */
  note: string | null;
  /**
   * Money paid into the customer's wallet instead of off this bill, so the
   * cashier can tell them what they now hold. Not a discount.
   */
  credited?: number;
  /** True when the reward is a line in the cart rather than a deduction. */
  isItem: boolean;
}

/**
 * What a redeemed reward actually does to this sale.
 *
 * A FREE_ITEM announces itself — it sits in the cart as its own line, priced at
 * zero against a struck-through price. Every other type is invisible: it puts
 * nothing in the cart, so without this the cashier saw an unchanged basket and
 * no sign that a reward was riding on the sale at all, and the customer was
 * asked for the full amount.
 *
 * `eligibleTotal` is the bill the reward applies against — the items rung up,
 * excluding anything a reward already comped, since a percentage should not
 * discount a giveaway.
 *
 * NOTE: the backend computes its own loyalty_discount and that figure is what
 * the receipt prints. This works out the same deduction so the till can show
 * what to collect before the sale is sent; if the two ever disagree it will be
 * because the backend takes its percentage off a different base (VAT included,
 * say), which is worth confirming rather than guessing at.
 */
/**
 * The reward's own wording, where it has any.
 *
 * Deliberately not `rewardLabelOf`, which falls back to humanising the enum —
 * that turns a 10% reward into the word "Percentage", which tells the cashier
 * nothing. Here an absent name has to read as absent so the caller can compose
 * something with the value in it.
 */
const namedLabelOf = (reward: any): string | null => {
  const named =
    reward?.reward_summary ??
    reward?.reward_description ??
    reward?.description ??
    reward?.name;
  return named ? String(named) : null;
};

/** "10.00" → "10", but "12.50" → "12.5". */
const trimNumber = (value: number): string => String(Number(value.toFixed(2)));

export const rewardEffectOf = (
  reward: any,
  {
    eligibleTotal,
    itemValue = 0,
    fallbackLabel,
  }: {
    eligibleTotal: number;
    itemValue?: number;
    /** The enrollment's reward_description, where the caller has it. */
    fallbackLabel?: string | null;
  },
): RewardEffect | null => {
  if (!reward) return null;

  const type = String(reward.reward_type ?? "").toUpperCase();
  // `value` and not applied_value: the latter is only written onto the
  // redemption record after the sale goes through, so at the till it is
  // always null and reading it would zero every reward.
  const value = asNumber(reward.value);
  const named = namedLabelOf(reward) ?? fallbackLabel ?? null;

  if (givesAnItem(reward)) {
    return {
      reward_type: type,
      label: rewardLabelOf(reward, fallbackLabel),
      discount: itemValue,
      note: null,
      isItem: true,
    };
  }

  if (type === "PERCENTAGE") {
    // Rounded to the kobo. An unrounded 10% of 2,000.05 leaves a fraction the
    // drawer cannot make change for.
    const discount = Math.round(eligibleTotal * (value / 100) * 100) / 100;
    return {
      reward_type: type,
      label: named ?? `${trimNumber(value)}% Off`,
      discount,
      note: `${trimNumber(value)}% of ${eligibleTotal.toLocaleString()}`,
      isItem: false,
    };
  }

  if (type === "WALLET_CREDIT") {
    // Not a discount. Redeeming this deposits the full amount into the
    // customer's store wallet; it does not come off this bill at all. They
    // can then pay from that wallet (ADVANCE), but that is a payment method,
    // not a reduction — anything left over stays on their balance.
    //
    // Treating it as money off was wrong and undercharged: the cashier would
    // have handed over a discount AND credited the wallet with the same sum.
    return {
      reward_type: type,
      label: named ?? "Wallet Credit",
      discount: 0,
      note: "Added to their wallet, not off this bill",
      credited: value,
      isItem: false,
    };
  }

  if (type === "POINTS") {
    return {
      reward_type: type,
      label: named ?? `${trimNumber(value)} Points`,
      discount: 0,
      note: "Points, not money off this bill",
      isItem: false,
    };
  }

  // Anything added later that this build has not been taught: the reward still
  // rides on the sale by id, but nothing here knows what it takes off, so it
  // takes off nothing. Shown all the same — a cashier seeing the reward named
  // and no discount can question it, where a silent omission looks like the
  // customer simply had nothing waiting.
  return {
    reward_type: type || "REWARD",
    label: named ?? rewardLabelOf(reward, fallbackLabel),
    discount: 0,
    note: null,
    isItem: false,
  };
};

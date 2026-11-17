export interface Owner {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

export interface BusinessType {
  id: string;
  name: string;
  owner: Owner;
  type: string;
  country: string;
  state: string;
  city: string;
  street: string;
  logo: string;
  currency: string;
  /** The owner's first business — covered by the account-level plan. */
  is_founding?: boolean;
  /** Non-founding branches only: has its own active plan. */
  is_subscribed?: boolean;
  subscription?: string | null;
  subscription_date?: string | null;
  subscription_end_date?: string | null;
}

export interface BusinessResponse {
  links: {
    next: string | null;
    previous: string | null;
  };
  total: number;
  limit: number;
  pages: number;
  results: BusinessType[];
}

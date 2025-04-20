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

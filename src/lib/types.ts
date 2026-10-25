export type Tenant = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  phone: string | null;
  logo_url: string | null;
  description: string | null;
  active: boolean;
  cnpj: string | null;
  email: string | null;
  address: string | null;
  pickup_notes: string | null;
  primary_color: string;
  subscription_status: "pending" | "active" | "suspended";
  notes: string | null;
  created_at: string;
  owner_name: string | null;
  owner_phone: string | null;
  instagram: string | null;
};

export type QuoteItem = {
  name: string;
  quantity: number;
  unit_price: number;
  components?: ItemComponent[];
};

export type Quote = {
  id: string;
  number: number;
  tenant_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_cpf: string | null;
  rental_start: string | null;
  rental_end: string | null;
  theme: string | null;
  items: QuoteItem[];
  items_note: string | null;
  discount: number;
  paid_amount: number;
  notes: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type ItemComponent = {
  name: string;
  quantity: number;
  photo_url?: string;
  unit_price?: number;
  replacement_value?: number;
};

export type KitComponentCatalogEntry = {
  name: string;
  photo_url: string | null;
  unit_price: number | null;
  replacement_value: number | null;
};

export type Item = {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  piece_count: number | null;
  images: string[];
  components: ItemComponent[];
  active: boolean;
  is_kit: boolean;
};

export type Booking = {
  id: string;
  tenant_id: string;
  item_id: string;
  event_date: string;
  customer_name: string;
  customer_phone: string;
  notes: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
};

export type BlockedDate = {
  id: string;
  item_id: string;
  date: string;
  reason: "manual" | "booking";
};

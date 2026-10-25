import { createClient } from "@/lib/supabase/server";
import type { BlockedDate, Category, Item, Tenant } from "@/lib/types";

// Only the columns the public storefront actually needs — anonymous
// visitors no longer have SELECT on business-private columns like cnpj,
// owner contact info or internal notes (see the tenants RLS/grants).
const PUBLIC_TENANT_COLUMNS =
  "id, slug, name, city, phone, logo_url, description, active, primary_color, instagram, pickup_notes, created_at";

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tenants")
    .select(PUBLIC_TENANT_COLUMNS)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (!data) return null;
  return {
    ...data,
    cnpj: null,
    email: null,
    address: null,
    owner_name: null,
    owner_phone: null,
    notes: null,
    subscription_status: "active",
  } as Tenant;
}

export async function getCategories(tenantId: string): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order");
  return data ?? [];
}

export async function getItems(
  tenantId: string,
  categorySlug?: string,
  search?: string,
  tipo?: "kit" | "avulso"
): Promise<Item[]> {
  const supabase = await createClient();
  let query = supabase
    .from("items")
    .select("*, categories!inner(slug)")
    .eq("tenant_id", tenantId)
    .eq("active", true);

  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug);
  }
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data } = await query.order("name");
  const items = data ?? [];

  if (tipo === "kit") return items.filter((i) => i.is_kit);
  if (tipo === "avulso") return items.filter((i) => !i.is_kit);
  return items;
}

export async function getCategoryItemCounts(
  tenantId: string
): Promise<{ total: number; byCategory: Record<string, number> }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("category_id")
    .eq("tenant_id", tenantId)
    .eq("active", true);

  const byCategory: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.category_id) {
      byCategory[row.category_id] = (byCategory[row.category_id] ?? 0) + 1;
    }
  }
  return { total: data?.length ?? 0, byCategory };
}

export async function getItemBySlug(
  tenantId: string,
  itemSlug: string
): Promise<Item | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("slug", itemSlug)
    .eq("active", true)
    .maybeSingle();
  return data;
}

export async function getBlockedDates(itemId: string): Promise<BlockedDate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocked_dates")
    .select("*")
    .eq("item_id", itemId)
    .gte("date", new Date().toISOString().slice(0, 10));
  return data ?? [];
}

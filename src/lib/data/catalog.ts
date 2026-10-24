import { createClient } from "@/lib/supabase/server";
import type { BlockedDate, Category, Item, Tenant } from "@/lib/types";

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  return data;
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
  search?: string
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
  return data ?? [];
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

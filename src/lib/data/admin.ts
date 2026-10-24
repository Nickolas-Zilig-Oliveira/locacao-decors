import { createClient } from "@/lib/supabase/server";
import type { Booking, Category, Item, KitComponentCatalogEntry, Tenant } from "@/lib/types";

/** The tenant the signed-in admin user manages (first membership). */
export async function getCurrentTenant(): Promise<Tenant | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: membership } = await supabase
    .from("tenant_users")
    .select("tenant_id")
    .eq("user_id", auth.user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", membership.tenant_id)
    .maybeSingle();

  return tenant;
}

export async function getAdminCategories(tenantId: string): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order");
  return data ?? [];
}

export async function getAdminItems(tenantId: string): Promise<Item[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("name");
  return data ?? [];
}

export async function getAdminItemById(tenantId: string, id: string): Promise<Item | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getKitComponentsCatalog(
  tenantId: string
): Promise<KitComponentCatalogEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("item_kit_components")
    .select("name, photo_url")
    .eq("tenant_id", tenantId)
    .order("name");
  return data ?? [];
}

export async function getAdminBookings(
  tenantId: string
): Promise<(Booking & { item_name: string })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, items(name)")
    .eq("tenant_id", tenantId)
    .order("event_date");

  return (data ?? []).map((b) => ({
    ...b,
    item_name: (b as unknown as { items: { name: string } | null }).items?.name ?? "—",
  }));
}

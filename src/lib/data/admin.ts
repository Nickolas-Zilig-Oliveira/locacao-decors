import { createClient } from "@/lib/supabase/server";
import type { Booking, Category, Item, KitComponentCatalogEntry, Tenant } from "@/lib/types";

export type UpcomingEvent = {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string | null;
  label: string;
  source: "booking" | "quote";
  status?: string;
};

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

/** True when the currently signed-in user is an admin of the given tenant. */
export async function isCurrentUserTenantAdmin(tenantId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;

  const { data } = await supabase
    .from("tenant_users")
    .select("tenant_id")
    .eq("tenant_id", tenantId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  return !!data;
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
    .select("name, photo_url, unit_price, replacement_value")
    .eq("tenant_id", tenantId)
    .order("name");
  return data ?? [];
}

/** Future bookings + contracts, merged into one chronological timeline. */
export async function getUpcomingEvents(tenantId: string): Promise<UpcomingEvent[]> {
  const supabase = await createClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString().slice(0, 10);

  const [{ data: bookings }, { data: quotes }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, event_date, customer_name, customer_phone, status, items(name)")
      .eq("tenant_id", tenantId)
      .gte("event_date", todayIso)
      .neq("status", "cancelled")
      .order("event_date"),
    supabase
      .from("quotes")
      .select("id, number, rental_start, customer_name, customer_phone, theme, items")
      .eq("tenant_id", tenantId)
      .gte("rental_start", todayStart.toISOString())
      .order("rental_start"),
  ]);

  const bookingEvents: UpcomingEvent[] = (bookings ?? []).map((b) => ({
    id: b.id,
    date: b.event_date,
    customerName: b.customer_name,
    customerPhone: b.customer_phone,
    label: (b as unknown as { items: { name: string } | null }).items?.name ?? "—",
    source: "booking",
    status: b.status,
  }));

  const quoteEvents: UpcomingEvent[] = (quotes ?? []).map((q) => ({
    id: q.id,
    date: q.rental_start as string,
    customerName: q.customer_name,
    customerPhone: q.customer_phone,
    label: q.theme || (q.items as { name: string }[])?.[0]?.name || `Contrato #${q.number}`,
    source: "quote",
  }));

  return [...bookingEvents, ...quoteEvents]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 12);
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

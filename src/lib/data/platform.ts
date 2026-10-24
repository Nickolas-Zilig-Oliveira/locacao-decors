import { createClient } from "@/lib/supabase/server";
import type { Tenant } from "@/lib/types";

export async function isPlatformAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;

  const { data } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  return !!data;
}

export async function getAllTenants(): Promise<Tenant[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tenants").select("*").order("name");
  return data ?? [];
}

export async function getTenantAdminEmails(
  tenantId: string
): Promise<{ user_id: string; email: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_tenant_admin_emails", {
    p_tenant_id: tenantId,
  });
  return data ?? [];
}

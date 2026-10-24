import { createClient } from "@/lib/supabase/server";
import type { Quote } from "@/lib/types";

export async function getQuotes(tenantId: string): Promise<Quote[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quotes")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getQuoteById(tenantId: string, id: string): Promise<Quote | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quotes")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  return data;
}

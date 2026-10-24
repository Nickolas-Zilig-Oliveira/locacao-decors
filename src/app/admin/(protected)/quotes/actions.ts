"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/data/admin";
import { parseMoneyTyping } from "@/lib/masks";
import type { QuoteItem } from "@/lib/types";

export type SaveQuoteResult = { ok: true; id: string } | { ok: false; error: string };

export async function createQuote(formData: FormData): Promise<SaveQuoteResult> {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/admin/login");

  const customerName = String(formData.get("customer_name") ?? "").trim();
  if (!customerName) {
    return { ok: false, error: "Informe o nome do cliente." };
  }

  const itemsRaw = String(formData.get("items_json") ?? "[]");
  let items: QuoteItem[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { ok: false, error: "Itens inválidos." };
  }
  items = items.filter((i) => i.name?.trim() && i.quantity > 0);
  if (items.length === 0) {
    return { ok: false, error: "Adicione pelo menos um item." };
  }

  const rentalStart = String(formData.get("rental_start") ?? "") || null;
  const rentalEnd = String(formData.get("rental_end") ?? "") || null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      tenant_id: tenant!.id,
      customer_name: customerName,
      customer_phone: String(formData.get("customer_phone") ?? "").trim() || null,
      customer_cpf: String(formData.get("customer_cpf") ?? "").trim() || null,
      rental_start: rentalStart,
      rental_end: rentalEnd,
      theme: String(formData.get("theme") ?? "").trim() || null,
      items,
      items_note: String(formData.get("items_note") ?? "").trim() || null,
      discount: parseMoneyTyping(String(formData.get("discount") ?? "0")),
      paid_amount: parseMoneyTyping(String(formData.get("paid_amount") ?? "0")),
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "Não foi possível criar o contrato." };
  }

  return { ok: true, id: data.id };
}

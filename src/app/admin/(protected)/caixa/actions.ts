"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/data/admin";
import { getQuoteById } from "@/lib/data/quotes";
import { parseMoneyTyping } from "@/lib/masks";

export async function registerPayment(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const amount = parseMoneyTyping(String(formData.get("amount") ?? "0"));
  if (!id || !Number.isFinite(amount) || amount <= 0) return;

  const quote = await getQuoteById(tenant!.id, id);
  if (!quote) return;

  const supabase = await createClient();
  await supabase
    .from("quotes")
    .update({ paid_amount: quote.paid_amount + amount })
    .eq("id", id)
    .eq("tenant_id", tenant!.id);

  revalidatePath("/admin/caixa");
}

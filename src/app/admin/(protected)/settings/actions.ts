"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/data/admin";

export async function updateTenantSettings(
  formData: FormData
): Promise<{ error: string } | { ok: true }> {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/admin/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "O nome da loja é obrigatório." };
  }
  if (name.length > 15) {
    return { error: "O nome da loja deve ter no máximo 15 caracteres." };
  }

  const primaryColor = String(formData.get("primary_color") ?? "").trim() || "#111111";
  const logoUrl = String(formData.get("logo_url") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("tenants")
    .update({
      name,
      city: String(formData.get("city") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      cnpj: String(formData.get("cnpj") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      pickup_notes: String(formData.get("pickup_notes") ?? "").trim() || null,
      primary_color: primaryColor,
      logo_url: logoUrl || null,
      owner_name: String(formData.get("owner_name") ?? "").trim() || null,
      owner_phone: String(formData.get("owner_phone") ?? "").trim() || null,
    })
    .eq("id", tenant!.id);

  if (error) {
    return { error: "Não foi possível salvar as configurações." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin", "layout");
  revalidatePath(`/c/${tenant!.slug}`);
  return { ok: true };
}

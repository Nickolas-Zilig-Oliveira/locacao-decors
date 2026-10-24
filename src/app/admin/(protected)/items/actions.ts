"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/data/admin";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function syncKitComponents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string,
  components: { name: string; photo_url?: string; unit_price?: number; replacement_value?: number }[]
) {
  for (const c of components) {
    const name = c.name.trim();
    if (!name) continue;

    const { data: existing } = await supabase
      .from("item_kit_components")
      .select("id, photo_url, unit_price, replacement_value")
      .eq("tenant_id", tenantId)
      .ilike("name", name)
      .maybeSingle();

    if (existing) {
      const patch: Record<string, unknown> = {};
      if (c.photo_url && c.photo_url !== existing.photo_url) patch.photo_url = c.photo_url;
      if (c.unit_price != null && c.unit_price !== existing.unit_price) patch.unit_price = c.unit_price;
      if (c.replacement_value != null && c.replacement_value !== existing.replacement_value) {
        patch.replacement_value = c.replacement_value;
      }
      if (Object.keys(patch).length > 0) {
        await supabase.from("item_kit_components").update(patch).eq("id", existing.id);
      }
    } else {
      await supabase.from("item_kit_components").insert({
        tenant_id: tenantId,
        name,
        photo_url: c.photo_url ?? null,
        unit_price: c.unit_price ?? null,
        replacement_value: c.replacement_value ?? null,
      });
    }
  }
}

export async function saveItem(formData: FormData): Promise<{ error: string } | void> {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const pieceCount = formData.get("piece_count")
    ? Number(formData.get("piece_count"))
    : null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const componentsRaw = String(formData.get("components_json") ?? "[]");
  let components: { name: string; quantity: number; photo_url?: string }[] = [];
  try {
    components = JSON.parse(componentsRaw).filter(
      (c: { name?: string; quantity?: number }) => c.name?.trim() && (c.quantity ?? 0) > 0
    );
  } catch {
    components = [];
  }

  if (!name || !Number.isFinite(price) || price < 0) {
    return { error: "Preencha nome e preço corretamente." };
  }

  const supabase = await createClient();
  const payload = {
    tenant_id: tenant!.id,
    name,
    slug: slugify(name),
    price,
    piece_count: pieceCount,
    description,
    category_id: categoryId,
    images: imageUrl ? [imageUrl] : [],
    components,
  };

  const { error } = id
    ? await supabase.from("items").update(payload).eq("id", id).eq("tenant_id", tenant!.id)
    : await supabase.from("items").insert(payload);

  if (error) {
    return { error: "Não foi possível salvar o item." };
  }

  await syncKitComponents(supabase, tenant!.id, components);

  revalidatePath("/admin/items");
  redirect("/admin/items");
}

export async function deleteItem(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("items").delete().eq("id", id).eq("tenant_id", tenant!.id);

  revalidatePath("/admin/items");
}

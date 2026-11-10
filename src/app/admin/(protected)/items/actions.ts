"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/data/admin";
import type { ItemComponent } from "@/lib/types";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type ItemInput = {
  id: string | null;
  name: string;
  price: number;
  pieceCount: number | null;
  description: string;
  categoryId: string | null;
  imageUrl: string;
  isKit: boolean;
  active: boolean;
  components: ItemComponent[];
  /** Also refresh the shared sub-item catalog (slower; only when sub-items changed). */
  syncComponents: boolean;
};

export type AutosaveResult =
  | { ok: true; id: string }
  | { ok: true; skipped: true }
  | { ok: false; error: string };

const DRAFT_NAME = "Novo item (rascunho)";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function storagePrefix() {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/item-photos/`;
}

function safePhotoUrl(url: unknown): string | undefined {
  return typeof url === "string" && url.startsWith(storagePrefix()) ? url : undefined;
}

function toMoney(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n < 10_000_000 ? Math.round(n * 100) / 100 : undefined;
}

function cleanComponents(raw: unknown): ItemComponent[] {
  if (!Array.isArray(raw)) return [];
  const out: ItemComponent[] = [];
  for (const c of raw.slice(0, 200)) {
    const name = typeof c?.name === "string" ? c.name.trim().slice(0, 120) : "";
    const quantity = Math.floor(Number(c?.quantity));
    if (!name || !(quantity > 0)) continue;
    out.push({
      name,
      quantity: Math.min(quantity, 9999),
      photo_url: safePhotoUrl(c.photo_url),
      unit_price: toMoney(c.unit_price),
      replacement_value: toMoney(c.replacement_value),
    });
  }
  return out;
}

async function uniqueSlug(supabase: Supabase, tenantId: string, base: string, excludeId: string | null) {
  const root = base || "item";
  const { data } = await supabase
    .from("items")
    .select("id, slug")
    .eq("tenant_id", tenantId)
    .ilike("slug", `${root}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== excludeId).map((r) => r.slug));
  if (!taken.has(root)) return root;
  for (let n = 2; n < 500; n++) {
    if (!taken.has(`${root}-${n}`)) return `${root}-${n}`;
  }
  return `${root}-${Date.now()}`;
}

async function syncKitComponents(supabase: Supabase, tenantId: string, components: ItemComponent[]) {
  for (const c of components) {
    const { data: existing } = await supabase
      .from("item_kit_components")
      .select("id, photo_url, unit_price, replacement_value")
      .eq("tenant_id", tenantId)
      .ilike("name", c.name)
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
        name: c.name,
        photo_url: c.photo_url ?? null,
        unit_price: c.unit_price ?? null,
        replacement_value: c.replacement_value ?? null,
      });
    }
  }
}

async function persistItem(
  input: ItemInput,
  opts: { draft: boolean }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const tenant = await getCurrentTenant();
  if (!tenant) return { ok: false, error: "Sua sessão expirou. Entre de novo." };

  const supabase = await createClient();
  const typedName = input.name.trim().slice(0, 120);
  if (!typedName && !opts.draft) return { ok: false, error: "Dê um nome ao item." };

  const price = toMoney(input.price);
  if (price === undefined) return { ok: false, error: "Confira o preço do item." };

  const components = cleanComponents(input.components);
  const imageUrl = safePhotoUrl(input.imageUrl);
  if (input.imageUrl && !imageUrl) return { ok: false, error: "Foto inválida. Envie a foto de novo." };

  let categoryId: string | null = null;
  if (input.categoryId) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("id", input.categoryId)
      .eq("tenant_id", tenant.id)
      .maybeSingle();
    categoryId = cat?.id ?? null;
  }

  const pieceCount =
    input.pieceCount != null && Number.isFinite(input.pieceCount) && input.pieceCount >= 0
      ? Math.min(Math.floor(input.pieceCount), 100_000)
      : null;

  const fields = {
    price,
    piece_count: pieceCount,
    description: input.description.trim().slice(0, 2000) || null,
    category_id: categoryId,
    images: imageUrl ? [imageUrl] : [],
    components,
    is_kit: Boolean(input.isKit),
  };

  let id = input.id;

  if (id) {
    const { data: current } = await supabase
      .from("items")
      .select("name, slug")
      .eq("id", id)
      .eq("tenant_id", tenant.id)
      .maybeSingle();
    if (!current) return { ok: false, error: "Item não encontrado." };

    // A blank name never renames an existing item or draft: the other fields are still saved.
    const name = typedName || current.name;
    const slug =
      current.name === name && current.slug
        ? current.slug
        : await uniqueSlug(supabase, tenant.id, slugify(name) || "rascunho", id);

    const { error } = await supabase
      .from("items")
      .update({ ...fields, name, slug, active: Boolean(input.active) })
      .eq("id", id)
      .eq("tenant_id", tenant.id);
    if (error) return { ok: false, error: "Não foi possível salvar o item." };
  } else {
    const name = typedName || DRAFT_NAME;
    const slug = await uniqueSlug(supabase, tenant.id, slugify(name) || "rascunho", null);
    const { data, error } = await supabase
      .from("items")
      .insert({ ...fields, name, tenant_id: tenant.id, slug, active: opts.draft ? false : Boolean(input.active) })
      .select("id")
      .single();
    if (error || !data) return { ok: false, error: "Não foi possível salvar o item." };
    id = data.id;
  }

  if (input.syncComponents && components.length > 0) {
    await syncKitComponents(supabase, tenant.id, components);
  }

  // Background saves must not refresh the router: it would rewrite the address bar and re-render the open form.
  if (!opts.draft) revalidatePath("/admin/items");
  return { ok: true, id: id as string };
}

/** Saves in the background while the admin is still filling in the form. New items become hidden drafts. */
export async function autosaveItem(input: ItemInput): Promise<AutosaveResult> {
  const name = (input.name ?? "").trim();
  const hasContent =
    name ||
    input.imageUrl ||
    (input.description ?? "").trim() ||
    (input.price ?? 0) > 0 ||
    (input.components ?? []).some((c) => c?.name?.trim());

  if (!input.id && !hasContent) return { ok: true, skipped: true };

  return persistItem(input, { draft: true });
}

/** The explicit "Salvar item" button: saves, publishes per the visibility switch and goes back to the list. */
export async function saveItem(input: ItemInput): Promise<{ error: string } | void> {
  const result = await persistItem(input, { draft: false });
  if (!result.ok) return { error: result.error };
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

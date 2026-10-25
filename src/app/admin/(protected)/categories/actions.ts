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

export async function createCategory(formData: FormData): Promise<{ error: string } | void> {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/admin/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Digite um nome para a categoria." };

  const supabase = await createClient();
  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenant!.id);

  const { error } = await supabase.from("categories").insert({
    tenant_id: tenant!.id,
    name,
    slug: slugify(name),
    sort_order: count ?? 0,
  });

  if (error) {
    return { error: "Não foi possível criar a categoria. Talvez já exista uma com esse nome." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/items");
}

export async function renameCategory(formData: FormData): Promise<{ error: string } | void> {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Digite um nome para a categoria." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name, slug: slugify(name) })
    .eq("id", id)
    .eq("tenant_id", tenant!.id);

  if (error) {
    return { error: "Não foi possível renomear. Talvez já exista uma categoria com esse nome." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/items");
  revalidatePath("/c", "layout");
}

export async function deleteCategory(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id).eq("tenant_id", tenant!.id);

  revalidatePath("/admin/categories");
  revalidatePath("/admin/items");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/data/platform";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function randomPassword() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6).toUpperCase() + "!1";
}

export async function updateTenantStatus(formData: FormData) {
  if (!(await isPlatformAdmin())) redirect("/super-admin/login");

  const tenantId = String(formData.get("tenant_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["pending", "active", "suspended"].includes(status)) return;

  const supabase = await createClient();
  await supabase.from("tenants").update({ subscription_status: status }).eq("id", tenantId);

  revalidatePath("/super-admin");
}

export type CreateTenantResult =
  | { ok: true; slug: string; adminEmail: string; adminPassword: string }
  | { ok: false; error: string };

export async function createTenant(formData: FormData): Promise<CreateTenantResult> {
  if (!(await isPlatformAdmin())) redirect("/super-admin/login");

  const name = String(formData.get("name") ?? "").trim();
  const adminEmail = String(formData.get("admin_email") ?? "").trim();
  const primaryColor = String(formData.get("primary_color") ?? "").trim() || "#9d174d";

  if (!name || !adminEmail) {
    return { ok: false, error: "Preencha o nome da loja e o e-mail do admin." };
  }

  const slug = slugify(name);
  const adminPassword = randomPassword();

  const supabase = await createClient();

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      name,
      slug,
      primary_color: primaryColor,
      active: true,
      subscription_status: "pending",
    })
    .select("id")
    .single();

  if (tenantError || !tenant) {
    return {
      ok: false,
      error: tenantError?.message.includes("duplicate")
        ? "Já existe uma loja com esse nome/slug."
        : "Não foi possível criar a loja.",
    };
  }

  const { error: adminError } = await supabase.rpc("create_tenant_admin", {
    p_email: adminEmail,
    p_password: adminPassword,
    p_tenant_id: tenant.id,
  });

  if (adminError) {
    return {
      ok: false,
      error: adminError.message.includes("duplicate")
        ? "Já existe uma conta com esse e-mail."
        : "Loja criada, mas não foi possível criar o login do admin.",
    };
  }

  revalidatePath("/super-admin");
  return { ok: true, slug, adminEmail, adminPassword };
}

export type ResetPasswordResult = { ok: true; password: string } | { ok: false; error: string };

export async function resetTenantAdminPassword(userId: string): Promise<ResetPasswordResult> {
  if (!(await isPlatformAdmin())) redirect("/super-admin/login");

  const password = randomPassword();
  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_tenant_admin_password", {
    p_user_id: userId,
    p_password: password,
  });

  if (error) {
    return { ok: false, error: "Não foi possível redefinir a senha." };
  }

  return { ok: true, password };
}

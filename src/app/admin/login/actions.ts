"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/data/platform";
import { getCurrentTenant } from "@/lib/data/admin";

export async function login(formData: FormData): Promise<{ error: string } | void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  if (await isPlatformAdmin()) {
    redirect("/super-admin");
  }

  const tenant = await getCurrentTenant();
  if (!tenant) {
    await supabase.auth.signOut();
    return { error: "Essa conta não tem acesso a nenhuma loja." };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

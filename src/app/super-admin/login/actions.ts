"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/data/platform";

export async function superAdminLogin(formData: FormData): Promise<{ error: string } | void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  if (!(await isPlatformAdmin())) {
    await supabase.auth.signOut();
    return { error: "Esta conta não tem acesso ao super admin." };
  }

  redirect("/super-admin");
}

export async function superAdminLogout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/super-admin/login");
}

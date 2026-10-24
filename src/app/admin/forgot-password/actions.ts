"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData): Promise<{ ok: true }> {
  const email = String(formData.get("email") ?? "").trim();

  if (email) {
    const supabase = await createClient();
    const hdrs = await headers();
    const origin = hdrs.get("origin") ?? `https://${hdrs.get("host")}`;

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/admin/reset-password`,
    });
  }

  // Always respond the same way, whether or not the e-mail exists, so we
  // don't leak which e-mails have accounts.
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTenant } from "@/lib/data/admin";

export async function updateBookingStatus(formData: FormData) {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/admin/login");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["confirmed", "cancelled"].includes(status)) return;

  const supabase = await createClient();
  await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .eq("tenant_id", tenant!.id);

  revalidatePath("/admin/bookings");
}

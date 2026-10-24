"use server";

import { createClient } from "@/lib/supabase/server";

export type CreateBookingResult = { ok: true } | { ok: false; error: string };

export async function createBooking(input: {
  tenantId: string;
  itemId: string;
  eventDate: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
}): Promise<CreateBookingResult> {
  if (!input.customerName.trim() || !input.customerPhone.trim() || !input.eventDate) {
    return { ok: false, error: "Preencha nome, telefone e data do evento." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("bookings").insert({
    tenant_id: input.tenantId,
    item_id: input.itemId,
    event_date: input.eventDate,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    notes: input.notes?.trim() || null,
  });

  if (error) {
    if (error.message.includes("not available")) {
      return { ok: false, error: "Essa data não está mais disponível para este item." };
    }
    return { ok: false, error: "Não foi possível criar a reserva. Tente novamente." };
  }

  return { ok: true };
}

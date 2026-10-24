import Link from "next/link";
import { getAdminBookings, getCurrentTenant } from "@/lib/data/admin";
import { updateBookingStatus } from "./actions";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmada", className: "bg-green-50 text-green-700 border-green-200" },
  cancelled: { label: "Cancelada", className: "bg-red-50 text-red-700 border-red-200" },
};

export default async function AdminBookingsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const bookings = await getAdminBookings(tenant.id);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">Pedidos do site</h1>
      </div>
      <p className="mb-6 text-sm text-neutral-500">
        Pedidos de reserva que clientes enviaram direto pela sua vitrine pública, escolhendo a
        data no calendário do item. Confirme, recuse, ou transforme em um contrato completo.
      </p>

      <div className="space-y-3">
        {bookings.map((b) => {
          const status = statusConfig[b.status];
          const prefillUrl =
            `/admin/quotes/new?customer_name=${encodeURIComponent(b.customer_name)}` +
            `&customer_phone=${encodeURIComponent(b.customer_phone)}` +
            `&item_id=${b.item_id}`;
          return (
            <div
              key={b.id}
              className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-neutral-900">{b.item_name}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-neutral-500">
                  {new Date(b.event_date + "T00:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-1 text-sm text-neutral-700">
                  {b.customer_name} · {b.customer_phone}
                </p>
                {b.notes && <p className="mt-0.5 text-xs text-neutral-400">&quot;{b.notes}&quot;</p>}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {b.status !== "cancelled" && (
                  <Link
                    href={prefillUrl}
                    className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
                  >
                    Transformar em contrato
                  </Link>
                )}
                {b.status !== "confirmed" && (
                  <form action={updateBookingStatus}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="status" value="confirmed" />
                    <button className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                      Confirmar
                    </button>
                  </form>
                )}
                {b.status !== "cancelled" && (
                  <form action={updateBookingStatus}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="status" value="cancelled" />
                    <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                      Recusar
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}

        {bookings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-12 text-center">
            <p className="text-sm text-neutral-500">
              Nenhum pedido recebido pela vitrine ainda. Assim que um cliente reservar uma data
              pelo site, o pedido aparece aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

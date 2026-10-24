import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getAdminBookings,
  getAdminItems,
  getCurrentTenant,
  getUpcomingEvents,
} from "@/lib/data/admin";
import { getQuotes } from "@/lib/data/quotes";
import { quoteTotals } from "@/lib/contract-terms";
import { whatsappLink } from "@/lib/whatsapp";

function money(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

function formatEventDate(iso: string) {
  const d = iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" });
}

export default async function AdminDashboardPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/admin/login");

  const [items, bookings, quotes, upcoming] = await Promise.all([
    getAdminItems(tenant!.id),
    getAdminBookings(tenant!.id),
    getQuotes(tenant!.id),
    getUpcomingEvents(tenant!.id),
  ]);

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const toReceiveTotal = quotes.reduce(
    (sum, q) => sum + quoteTotals(q.items, q.discount, q.paid_amount).toReceive,
    0
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Olá, {tenant!.name}</h1>
        <p className="text-sm text-neutral-500">Resumo da sua loja.</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
        <Link
          href="/admin/items"
          className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:border-neutral-300 sm:p-5"
        >
          <p className="text-[11px] font-medium text-neutral-500 sm:text-xs">Itens ativos</p>
          <p className="mt-1 text-xl font-bold text-neutral-900 sm:text-2xl">{items.length}</p>
        </Link>
        <Link
          href="/admin/bookings"
          className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:border-neutral-300 sm:p-5"
        >
          <p className="text-[11px] font-medium text-neutral-500 sm:text-xs">Pedidos pendentes</p>
          <p className="mt-1 text-xl font-bold text-amber-600 sm:text-2xl">{pendingBookings}</p>
        </Link>
        <Link
          href="/admin/caixa"
          className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:border-neutral-300 sm:p-5"
        >
          <p className="text-[11px] font-medium text-neutral-500 sm:text-xs">A receber</p>
          <p className="mt-1 text-base font-bold text-neutral-900 sm:text-2xl">{money(toReceiveTotal)}</p>
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-4">
          <p className="font-semibold text-neutral-900">Próximos eventos</p>
          <p className="text-xs text-neutral-500">Contratos e pedidos do site com data marcada.</p>
        </div>

        {upcoming.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-neutral-500">
            Nenhum evento agendado por enquanto.
          </p>
        )}

        <div className="divide-y divide-neutral-100">
          {upcoming.map((ev) => {
            const wa = whatsappLink(ev.customerPhone, `Olá ${ev.customerName}! Tudo certo pra ${formatEventDate(ev.date)}?`);
            return (
              <div key={`${ev.source}-${ev.id}`} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                  <span className="text-[10px] font-medium uppercase leading-none">
                    {formatEventDate(ev.date).split(" ")[2]}
                  </span>
                  <span className="text-sm font-bold leading-tight">
                    {formatEventDate(ev.date).split(" ")[1]}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {ev.customerName} <span className="text-neutral-400">·</span>{" "}
                    <span className="text-neutral-500">{ev.label}</span>
                  </p>
                  <p className="text-xs text-neutral-400">
                    {ev.source === "quote" ? "Contrato" : "Pedido do site"}
                    {ev.status && ev.status !== "confirmed" ? ` · ${ev.status === "pending" ? "pendente" : ev.status}` : ""}
                  </p>
                </div>
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

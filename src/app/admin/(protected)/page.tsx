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

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toDate(iso: string) {
  return iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
}

function daysUntil(d: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function relativeDay(d: Date) {
  const n = daysUntil(d);
  if (n === 0) return "Hoje";
  if (n === 1) return "Amanhã";
  if (n > 1 && n < 7) return `Em ${n} dias`;
  return cap(d.toLocaleDateString("pt-BR", { weekday: "long" }));
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

  const activeItems = items.filter((i) => i.active).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const toReceiveTotal = quotes.reduce(
    (sum, q) => sum + quoteTotals(q.items, q.discount, q.paid_amount).toReceive,
    0
  );

  const stats = [
    { href: "/admin/items", label: "Itens ativos", value: String(activeItems), highlight: false },
    {
      href: "/admin/bookings",
      label: "Pedidos pendentes",
      value: String(pendingBookings),
      highlight: pendingBookings > 0,
    },
    { href: "/admin/caixa", label: "A receber", value: money(toReceiveTotal), highlight: false },
  ];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-[28px]">Olá, {tenant!.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {cap(new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }))}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-2xl border border-neutral-200 bg-white px-3 py-3.5 transition-colors hover:border-neutral-300 sm:px-5 sm:py-5"
          >
            <p className="text-[11px] font-semibold text-neutral-500 sm:text-[13px]">{s.label}</p>
            <p
              className={`mt-1.5 font-display text-lg font-bold tabular-nums tracking-tight sm:text-[28px] sm:leading-none ${
                s.highlight ? "" : "text-neutral-900"
              }`}
              style={s.highlight ? { color: "var(--accent-strong)" } : undefined}
            >
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Próximos eventos</h2>
            <p className="text-[13px] text-neutral-500">Contratos e pedidos do site com data marcada.</p>
          </div>
          <Link href="/admin/quotes/new" className="shrink-0 text-sm font-semibold" style={{ color: "var(--accent-strong)" }}>
            Novo contrato
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {upcoming.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-semibold text-neutral-900">Agenda livre</p>
              <p className="mt-1 text-sm text-neutral-500">
                Quando um contrato ou pedido tiver data, ele aparece aqui.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {upcoming.map((ev) => {
                const d = toDate(ev.date);
                const soon = daysUntil(d) <= 2;
                const wa = whatsappLink(
                  ev.customerPhone,
                  `Olá ${ev.customerName}! Tudo certo para ${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}?`
                );
                return (
                  <li key={`${ev.source}-${ev.id}`} className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5">
                    <div
                      className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ${
                        soon ? "text-white" : "bg-neutral-100 text-neutral-700"
                      }`}
                      style={soon ? { backgroundColor: "var(--accent-strong)" } : undefined}
                    >
                      <span className="text-[10px] font-semibold uppercase leading-none tracking-wide opacity-80">
                        {d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                      </span>
                      <span className="mt-0.5 font-display text-lg font-bold leading-none tabular-nums">
                        {d.getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-900">{ev.customerName}</p>
                      <p className="truncate text-[13px] text-neutral-500">
                        {ev.label}
                        <span className="text-neutral-300"> — </span>
                        <span>{relativeDay(d)}</span>
                        {ev.source === "booking" && ev.status === "pending" && (
                          <span className="ml-1.5 rounded-full bg-amber-50 px-1.5 py-px text-[11px] font-semibold text-amber-700">
                            pendente
                          </span>
                        )}
                      </p>
                    </div>
                    {wa && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#25D366]/10 px-3 text-xs font-semibold text-[#128C4B] transition-colors hover:bg-[#25D366]/20"
                        aria-label={`Conversar com ${ev.customerName} no WhatsApp`}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                          <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm4.4 12.4c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4.2-.4c.1-.2 0-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 3 4.7 4.1 2.3.9 2.8.7 3.3.7.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1l-.4-.3Z" />
                        </svg>
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

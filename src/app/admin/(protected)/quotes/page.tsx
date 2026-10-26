import Link from "next/link";
import { getQuotes } from "@/lib/data/quotes";
import { getCurrentTenant } from "@/lib/data/admin";
import { quoteTotals } from "@/lib/contract-terms";

export default async function AdminQuotesPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const quotes = await getQuotes(tenant.id);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-[28px]">Contratos</h1>
          <p className="text-sm text-neutral-500">Contratos gerados manualmente, prontos em PDF.</p>
        </div>
        <Link
          href="/admin/quotes/new"
          className="shrink-0 whitespace-nowrap rounded-full bg-[var(--accent-strong)] px-4 py-2 text-center text-sm font-semibold text-white hover:brightness-110"
        >
          + Novo contrato
        </Link>
      </div>

      <div className="space-y-3">
        {quotes.map((q) => {
          const { total, toReceive } = quoteTotals(q.items, q.discount, q.paid_amount);
          return (
            <Link
              key={q.id}
              href={`/admin/quotes/${q.id}`}
              className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-neutral-900">
                  Contrato #{q.number} · {q.customer_name}
                </p>
                <p className="truncate text-sm text-neutral-500">
                  {q.theme ?? "—"} · {q.items.length} {q.items.length === 1 ? "item" : "itens"} · R${" "}
                  {total.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                    toReceive > 0 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
                  }`}
                >
                  {toReceive > 0 ? `R$ ${toReceive.toFixed(2).replace(".", ",")}` : "quitado"}
                </span>
                {toReceive > 0 && (
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-amber-600/70">
                    a receber
                  </p>
                )}
                <p className="mt-1 text-xs text-neutral-400">
                  {new Date(q.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </Link>
          );
        })}

        {quotes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-12 text-center">
            <p className="text-sm text-neutral-500">Nenhum contrato gerado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Contratos</h1>
          <p className="text-sm text-neutral-500">Contratos gerados manualmente, prontos em PDF.</p>
        </div>
        <Link
          href="/admin/quotes/new"
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
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
              className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300"
            >
              <div>
                <p className="font-semibold text-neutral-900">
                  Contrato #{q.number} · {q.customer_name}
                </p>
                <p className="text-sm text-neutral-500">
                  {q.theme ?? "—"} · {q.items.length} {q.items.length === 1 ? "item" : "itens"} · R${" "}
                  {total.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    toReceive > 0 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
                  }`}
                >
                  {toReceive > 0 ? `R$ ${toReceive.toFixed(2).replace(".", ",")} a receber` : "quitado"}
                </span>
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

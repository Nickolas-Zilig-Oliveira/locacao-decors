import { getCurrentTenant } from "@/lib/data/admin";
import { getQuotes } from "@/lib/data/quotes";
import { quoteTotals } from "@/lib/contract-terms";
import { PaymentForm } from "./payment-form";

function money(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

export default async function CaixaPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const quotes = await getQuotes(tenant.id);

  const rows = quotes.map((q) => ({
    quote: q,
    ...quoteTotals(q.items, q.discount, q.paid_amount),
  }));

  const totalContratos = rows.reduce((sum, r) => sum + r.total, 0);
  const totalRecebido = rows.reduce((sum, r) => sum + r.quote.paid_amount, 0);
  const totalAReceber = rows.reduce((sum, r) => sum + r.toReceive, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Fluxo de caixa</h1>
        <p className="text-sm text-neutral-500">Entradas e pendências dos seus contratos.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-neutral-500">Total em contratos</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">{money(totalContratos)}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-neutral-500">Total recebido</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{money(totalRecebido)}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-neutral-500">Total a receber</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{money(totalAReceber)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="hidden grid-cols-6 gap-2 border-b border-neutral-100 bg-neutral-50 px-5 py-3 text-xs font-semibold text-neutral-500 sm:grid">
          <span>Contrato</span>
          <span>Cliente</span>
          <span className="text-right">Total</span>
          <span className="text-right">Pago</span>
          <span className="text-right">A receber</span>
          <span></span>
        </div>
        <div className="divide-y divide-neutral-100">
          {rows.map(({ quote, total, toReceive }) => (
            <div
              key={quote.id}
              className="grid grid-cols-2 items-center gap-2 px-5 py-4 text-sm sm:grid-cols-6"
            >
              <span className="font-medium text-neutral-900">#{quote.number}</span>
              <span className="truncate">{quote.customer_name}</span>
              <span className="text-right">{money(total)}</span>
              <span className="text-right text-green-600">{money(quote.paid_amount)}</span>
              <span className="text-right text-amber-600">{money(toReceive)}</span>
              <div className="col-span-2 flex justify-end sm:col-span-1">
                {toReceive > 0 ? (
                  <PaymentForm quoteId={quote.id} toReceive={toReceive} />
                ) : (
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    quitado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {rows.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-neutral-500">
            Nenhum contrato gerado ainda.
          </p>
        )}
      </div>
    </div>
  );
}

import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentTenant } from "@/lib/data/admin";
import { getQuoteById } from "@/lib/data/quotes";
import { DEFAULT_CONTRACT_CLAUSES, quoteTotals } from "@/lib/contract-terms";

function money(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const date = d.toLocaleDateString("pt-BR");
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const weekday = d.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${date} ${time} - ${weekday}`;
}

export default async function QuoteViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const quote = await getQuoteById(tenant.id, id);
  if (!quote) notFound();

  const { subtotal, total, toReceive } = quoteTotals(quote.items, quote.discount, quote.paid_amount);
  const issueDate = new Date(quote.created_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/admin/quotes" className="inline-block text-sm text-neutral-500 hover:underline">
          ← Voltar para contratos
        </Link>
        <a
          href={`/admin/quotes/${quote.id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Baixar PDF
        </a>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-neutral-200 pb-4">
          <h1 className="text-lg font-bold">{tenant.name}</h1>
          {tenant.cnpj && <p className="text-sm text-neutral-600">CNPJ: {tenant.cnpj}</p>}
          <p className="text-sm text-neutral-600">
            {[tenant.phone, tenant.email].filter(Boolean).join(" - ")}
          </p>
          {tenant.address && <p className="text-sm text-neutral-600">{tenant.address}</p>}
        </header>

        <h2 className="my-6 text-center text-base font-bold">
          Contrato de Locação # {quote.number}
        </h2>

        <div className="mb-4 border-b border-neutral-100 pb-4">
          <p className="text-xs text-neutral-500">Cliente</p>
          <p className="text-sm font-medium">{quote.customer_name}</p>
          {quote.customer_phone && (
            <>
              <p className="mt-1 text-xs text-neutral-500">Telefone</p>
              <p className="text-sm">{quote.customer_phone}</p>
            </>
          )}
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4 border-b border-neutral-100 pb-4 text-sm">
          <div>
            <p className="text-xs text-neutral-500">Início da Locação</p>
            <p>{formatDateTime(quote.rental_start)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Término da Locação</p>
            <p>{formatDateTime(quote.rental_end)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Tema</p>
            <p>{quote.theme ?? "—"}</p>
          </div>
        </div>

        <p className="mb-2 text-xs font-semibold text-neutral-500">ITENS DE LOCAÇÃO</p>
        {quote.items_note && <p className="mb-2 text-sm text-neutral-600">{quote.items_note}</p>}

        <table className="mb-4 w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-400 text-left">
              <th className="w-16 pb-2 font-semibold">Qtdade</th>
              <th className="pb-2 font-semibold">Produto (Locação)</th>
              <th className="w-28 pb-2 text-right font-semibold">Preço (un.)</th>
              <th className="w-28 pb-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, i) => (
              <Fragment key={i}>
                <tr className="border-b border-neutral-100">
                  <td className="py-1.5">{item.quantity}x</td>
                  <td className="py-1.5">{item.name}</td>
                  <td className="py-1.5 text-right">{money(item.unit_price)}</td>
                  <td className="py-1.5 text-right">{money(item.quantity * item.unit_price)}</td>
                </tr>
                {item.components?.map((c, ci) => (
                  <tr key={`${i}-${ci}`} className="text-xs text-neutral-400">
                    <td></td>
                    <td className="py-0.5 pl-4" colSpan={3}>
                      • {c.quantity}x {c.name}
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>

        <div className="mb-8 grid grid-cols-5 gap-2 border-t border-neutral-400 pt-3 text-center text-sm">
          <div>
            <p className="text-xs text-neutral-500">Sub Total</p>
            <p className="font-semibold">{money(subtotal)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Desconto</p>
            <p className="font-semibold">{money(quote.discount)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Valor total</p>
            <p className="font-semibold">{money(total)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Valor pago</p>
            <p className="font-semibold">{money(quote.paid_amount)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Valor a receber</p>
            <p className="font-semibold">{money(toReceive)}</p>
          </div>
        </div>

        <h3 className="mb-3 text-center text-base font-bold">Cláusulas Contratuais</h3>
        <ol className="mb-4 space-y-1.5 text-sm text-neutral-700">
          {DEFAULT_CONTRACT_CLAUSES.map((clause, i) => (
            <li key={i}>
              <span className="font-medium">1.{i + 1}</span> {clause}
            </li>
          ))}
        </ol>

        {(quote.notes || tenant.pickup_notes) && (
          <p className="mb-6 text-sm text-neutral-700">
            <span className="font-medium">Observação:</span> {quote.notes ?? tenant.pickup_notes}
          </p>
        )}

        <p className="mb-16 text-sm">
          {tenant.city ?? ""}, {issueDate}
        </p>

        <div className="mx-auto w-72 border-t border-neutral-400 pt-2 text-center text-sm">
          <p>{quote.customer_name}</p>
          <p className="text-neutral-500">CPF: {quote.customer_cpf ?? ""}</p>
        </div>
      </div>
    </div>
  );
}

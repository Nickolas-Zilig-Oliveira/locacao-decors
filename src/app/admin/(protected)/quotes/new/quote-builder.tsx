"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { Item, QuoteItem } from "@/lib/types";
import { quoteTotals } from "@/lib/contract-terms";
import { formatCPF, formatPhone, moneyToDisplay, parseMoneyTyping } from "@/lib/masks";
import { createQuote } from "../actions";

function blockNonNumericKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
}

export function QuoteBuilder({
  catalogItems,
  prefillCustomerName,
  prefillCustomerPhone,
  prefillItemId,
}: {
  catalogItems: Item[];
  prefillCustomerName?: string;
  prefillCustomerPhone?: string;
  prefillItemId?: string;
}) {
  const router = useRouter();
  const prefillItem = prefillItemId ? catalogItems.find((i) => i.id === prefillItemId) : undefined;
  const [lines, setLines] = useState<QuoteItem[]>(
    prefillItem
      ? [
          {
            name: prefillItem.name,
            quantity: 1,
            unit_price: prefillItem.price,
            components: prefillItem.components,
          },
        ]
      : []
  );
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { subtotal, total, toReceive } = useMemo(
    () => quoteTotals(lines, discount, paidAmount),
    [lines, discount, paidAmount]
  );

  function addCatalogItem(itemId: string) {
    const item = catalogItems.find((i) => i.id === itemId);
    if (!item) return;
    setLines((prev) => [
      ...prev,
      {
        name: item.name,
        quantity: 1,
        unit_price: item.price,
        components: item.components,
      },
    ]);
  }

  function addCustomLine() {
    setLines((prev) => [...prev, { name: "", quantity: 1, unit_price: 0 }]);
  }

  function updateLine(index: number, patch: Partial<QuoteItem>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("items_json", JSON.stringify(lines));
    startTransition(async () => {
      const result = await createQuote(formData);
      if (result.ok) {
        router.push(`/admin/quotes/${result.id}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 font-medium">Cliente</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              name="customer_name"
              defaultValue={prefillCustomerName}
              required
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Telefone</label>
            <input
              name="customer_phone"
              defaultValue={prefillCustomerPhone ? formatPhone(prefillCustomerPhone) : undefined}
              onChange={(e) => {
                e.target.value = formatPhone(e.target.value);
              }}
              inputMode="numeric"
              placeholder="(11) 90000-0000"
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">CPF (opcional)</label>
            <input
              name="customer_cpf"
              onChange={(e) => {
                e.target.value = formatCPF(e.target.value);
              }}
              inputMode="numeric"
              placeholder="000.000.000-00"
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tema (opcional)</label>
            <input
              name="theme"
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Início da locação</label>
            <input
              type="datetime-local"
              name="rental_start"
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Término da locação</label>
            <input
              type="datetime-local"
              name="rental_end"
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-medium">Itens de locação</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              onChange={(e) => {
                if (e.target.value) addCatalogItem(e.target.value);
                e.target.value = "";
              }}
              defaultValue=""
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="" disabled>
                Adicionar do catálogo...
              </option>
              {catalogItems.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addCustomLine}
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm"
            >
              + Item avulso
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Observação dos itens (opcional, ex: &quot;descontar display frazola&quot;)
          </label>
          <input
            name="items_note"
            className="mb-3 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        {lines.length === 0 && (
          <p className="py-4 text-center text-sm text-neutral-500">Nenhum item adicionado.</p>
        )}

        {lines.map((line, i) => (
          <div key={i} className="mb-2 rounded-lg border border-neutral-100 p-2">
            <div className="mb-2">
              <label className="mb-0.5 block text-[10px] font-medium text-neutral-400">
                Nome do item
              </label>
              <input
                value={line.name}
                onChange={(e) => updateLine(i, { name: e.target.value })}
                placeholder="Nome do item"
                className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="w-16">
                <label className="mb-0.5 block text-[10px] font-medium text-neutral-400">Qtd.</label>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  onKeyDown={blockNonNumericKeys}
                  value={line.quantity}
                  onChange={(e) => updateLine(i, { quantity: Number(e.target.value) || 1 })}
                  className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
                />
              </div>
              <span className="pb-1.5 text-sm text-neutral-400">x</span>
              <div className="w-24">
                <label className="mb-0.5 block text-[10px] font-medium text-neutral-400">
                  Preço (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={moneyToDisplay(line.unit_price)}
                  onChange={(e) => updateLine(i, { unit_price: parseMoneyTyping(e.target.value) })}
                  className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
                />
              </div>
              <span className="flex-1 pb-1.5 text-right text-sm font-medium">
                R$ {(line.quantity * line.unit_price).toFixed(2).replace(".", ",")}
              </span>
              <button
                type="button"
                onClick={() => removeLine(i)}
                className="shrink-0 pb-1.5 text-sm text-red-600 hover:underline"
              >
                Remover
              </button>
            </div>
            {line.components && line.components.length > 0 && (
              <ul className="ml-2 mt-1.5 space-y-0.5 border-l-2 border-neutral-100 pl-3 text-xs text-neutral-500">
                {line.components.map((c, ci) => (
                  <li key={ci}>
                    {c.quantity}x {c.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 font-medium">Valores</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Desconto / promoção (R$)
            </label>
            <input
              type="text"
              inputMode="decimal"
              name="discount"
              value={discount === 0 ? "" : moneyToDisplay(discount)}
              placeholder="0,00"
              onChange={(e) => setDiscount(parseMoneyTyping(e.target.value))}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Valor já pago (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              name="paid_amount"
              value={paidAmount === 0 ? "" : moneyToDisplay(paidAmount)}
              placeholder="0,00"
              onChange={(e) => setPaidAmount(parseMoneyTyping(e.target.value))}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 space-y-1 text-sm">
          <p className="flex justify-between">
            <span>Sub total</span>
            <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
          </p>
          <p className="flex justify-between font-medium">
            <span>Valor total</span>
            <span>R$ {total.toFixed(2).replace(".", ",")}</span>
          </p>
          <p className="flex justify-between text-neutral-500">
            <span>Valor a receber</span>
            <span>R$ {toReceive.toFixed(2).replace(".", ",")}</span>
          </p>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">
            Observação geral (ex: horário de retirada)
          </label>
          <textarea
            name="notes"
            rows={2}
            className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isPending ? "Gerando..." : "Gerar contrato"}
      </button>
    </form>
  );
}

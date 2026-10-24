"use client";

import { registerPayment } from "./actions";

function blockNonNumericKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
}

export function PaymentForm({ quoteId, toReceive }: { quoteId: string; toReceive: number }) {
  return (
    <form action={registerPayment} className="flex items-center gap-1">
      <input type="hidden" name="id" value={quoteId} />
      <input
        type="number"
        inputMode="decimal"
        name="amount"
        step="0.01"
        min="0.01"
        max={toReceive}
        placeholder="valor"
        onKeyDown={blockNonNumericKeys}
        required
        className="w-20 rounded-lg border border-neutral-300 px-2 py-1 text-xs"
      />
      <button className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-800">
        Registrar
      </button>
    </form>
  );
}

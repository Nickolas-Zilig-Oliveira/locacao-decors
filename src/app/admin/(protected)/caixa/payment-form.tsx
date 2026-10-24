"use client";

import { formatMoneyTyping } from "@/lib/masks";
import { registerPayment } from "./actions";

export function PaymentForm({ quoteId, toReceive }: { quoteId: string; toReceive: number }) {
  return (
    <form action={registerPayment} className="flex items-center gap-1">
      <input type="hidden" name="id" value={quoteId} />
      <input
        type="text"
        inputMode="decimal"
        name="amount"
        placeholder="0,00"
        onChange={(e) => {
          e.target.value = formatMoneyTyping(e.target.value);
        }}
        required
        className="w-20 rounded-lg border border-neutral-300 px-2 py-1 text-xs"
      />
      <button className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-800">
        Registrar
      </button>
    </form>
  );
}

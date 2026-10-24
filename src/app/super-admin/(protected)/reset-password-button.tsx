"use client";

import { useState, useTransition } from "react";
import { resetTenantAdminPassword } from "./actions";

export function ResetPasswordButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await resetTenantAdminPassword(userId);
      if (res.ok) {
        setResult(res.password);
      } else {
        setError(res.error);
      }
    });
  }

  if (result) {
    return (
      <span className="rounded bg-neutral-900 px-2 py-1 font-mono text-xs text-white">
        nova senha: {result}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-medium text-neutral-600 underline hover:text-neutral-900 disabled:opacity-50"
    >
      {isPending ? "Gerando..." : error ? "Erro, tentar de novo" : "Redefinir senha"}
    </button>
  );
}

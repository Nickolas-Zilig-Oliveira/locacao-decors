"use client";

import { useRef, useState, useTransition } from "react";
import { createCategory } from "./actions";

export function NewCategoryForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCategory(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit}>
      <div className="flex gap-2">
        <input
          name="name"
          required
          placeholder="Nome da nova categoria"
          aria-label="Nome da nova categoria"
          className="h-10 min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-4 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15 sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-10 shrink-0 rounded-full bg-[var(--accent-strong)] px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? "Criando…" : "Criar"}
        </button>
      </div>
      {error && <p className="mt-1.5 px-1 text-xs text-red-600">{error}</p>}
    </form>
  );
}

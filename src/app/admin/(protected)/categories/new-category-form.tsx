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
    <form ref={formRef} action={handleSubmit} className="flex flex-wrap items-start gap-2">
      <div>
        <input
          name="name"
          required
          placeholder="Ex: Festa Infantil"
          className="w-56 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {isPending ? "Criando..." : "+ Nova categoria"}
      </button>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import type { Category } from "@/lib/types";
import { ConfirmSubmit } from "../confirm-submit";
import { deleteCategory, renameCategory } from "./actions";

export function CategoryRow({ category, count }: { category: Category; count: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRename(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await renameCategory(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
      }
    });
  }

  function cancelEdit() {
    setName(category.name);
    setError(null);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="px-4 py-3 sm:px-5">
        <form action={handleRename} className="flex items-center gap-2">
          <input type="hidden" name="id" value={category.id} />
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-[var(--accent-strong)] focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/15"
          />
          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 rounded-full bg-[var(--accent-strong)] px-3 py-1.5 text-xs font-medium text-white hover:brightness-110 disabled:opacity-50"
          >
            {isPending ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="shrink-0 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
          >
            Cancelar
          </button>
        </form>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-neutral-900">{category.name}</p>
        <p className="text-xs tabular-nums text-neutral-500">
          {count} {count === 1 ? "item" : "itens"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="h-8 rounded-full px-3 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          Renomear
        </button>
        <form action={deleteCategory}>
          <input type="hidden" name="id" value={category.id} />
          <ConfirmSubmit
            message={`Excluir a categoria "${category.name}"?`}
            className="h-8 rounded-full px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            Excluir
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}

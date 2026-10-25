"use client";

import { useState, useTransition } from "react";
import type { Category } from "@/lib/types";
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
      <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
        <form action={handleRename} className="flex items-center gap-2">
          <input type="hidden" name="id" value={category.id} />
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-900 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
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
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="font-medium text-neutral-900">{category.name}</p>
        <p className="text-xs text-neutral-400">
          {count} {count === 1 ? "item" : "itens"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
        >
          Renomear
        </button>
        <form action={deleteCategory}>
          <input type="hidden" name="id" value={category.id} />
          <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
            Excluir
          </button>
        </form>
      </div>
    </div>
  );
}

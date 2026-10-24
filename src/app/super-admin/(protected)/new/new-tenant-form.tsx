"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createTenant } from "../actions";

export function NewTenantForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ slug: string; adminEmail: string; adminPassword: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTenant(formData);
      if (result.ok) {
        setSuccess(result);
      } else {
        setError(result.error);
      }
    });
  }

  if (success) {
    return (
      <div className="max-w-lg rounded-2xl border border-green-200 bg-green-50 p-6">
        <p className="mb-3 font-semibold text-green-800">Loja criada!</p>
        <p className="mb-4 text-sm text-green-700">
          Anote os dados abaixo agora — a senha não aparece de novo depois.
        </p>
        <div className="space-y-2 rounded-xl bg-white p-4 font-mono text-sm">
          <p>
            Loja: <span className="font-semibold">/c/{success.slug}</span>
          </p>
          <p>
            Login: <span className="font-semibold">{success.adminEmail}</span>
          </p>
          <p>
            Senha: <span className="font-semibold">{success.adminPassword}</span>
          </p>
        </div>
        <div className="mt-4 flex gap-3 text-sm">
          <Link href="/super-admin" className="font-medium text-green-800 hover:underline">
            ← Voltar para lojas
          </Link>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="font-medium text-green-800 hover:underline"
          >
            Criar outra loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="max-w-lg space-y-5">
      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-neutral-900">Dados da loja</p>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Nome da loja</label>
          <input
            name="name"
            required
            placeholder="Ex: Festa Perfeita Decorações"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">E-mail do login da loja</label>
          <input
            type="email"
            name="admin_email"
            required
            placeholder="dono@loja.com"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-500">Cor principal</label>
          <input
            type="color"
            name="primary_color"
            defaultValue="#9d174d"
            className="h-9 w-12 rounded border border-neutral-300"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-neutral-900">Responsável pela loja</p>
          <p className="text-xs text-neutral-400">Opcional — ajuda você a saber com quem falar depois.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Nome</label>
            <input
              name="owner_name"
              placeholder="Nome completo"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">WhatsApp</label>
            <input
              name="owner_phone"
              placeholder="(11) 90000-0000"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <p className="text-xs text-neutral-400">
        A loja é criada como &quot;pendente&quot; — ative depois de confirmar o pagamento, na lista de lojas.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {isPending ? "Criando..." : "Criar loja"}
      </button>
    </form>
  );
}

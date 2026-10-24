"use client";

import { useState, useTransition } from "react";
import { superAdminLogin } from "./actions";

export default function SuperAdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await superAdminLogin(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Ziliglasis</p>
          <h1 className="mt-2 text-xl font-bold">Super Admin</h1>
          <p className="mt-1 text-sm text-white/50">Acesso restrito ao operador da plataforma</p>
        </div>

        <form
          action={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">E-mail</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">Senha</label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-white py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-50"
          >
            {isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

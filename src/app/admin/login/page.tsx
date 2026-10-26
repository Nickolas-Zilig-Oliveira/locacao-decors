"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AuthShell, authButton, authField, authLabel, authLink } from "../auth-shell";
import { login } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <AuthShell
      title="Painel do locador"
      subtitle="Entre para gerenciar sua loja, contratos e pedidos."
      footer={<p className="text-xs text-white/35">Plataforma de locação operada pela Ziligz</p>}
    >
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className={authLabel}>
            E-mail
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            className={authField}
          />
        </div>
        <div>
          <label htmlFor="login-password" className={authLabel}>
            Senha
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className={authField}
          />
        </div>
        {error && (
          <p className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={isPending} className={`${authButton} mt-2`}>
          {isPending ? "Entrando…" : "Entrar"}
        </button>
        <div className="pt-1 text-center">
          <Link href="/admin/forgot-password" className={authLink}>
            Esqueci minha senha
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

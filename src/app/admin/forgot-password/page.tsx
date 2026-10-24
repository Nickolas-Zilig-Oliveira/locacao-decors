"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await requestPasswordReset(formData);
      setSent(true);
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Ziliglasis</p>
          <h1 className="mt-2 text-xl font-bold">Esqueci minha senha</h1>
          <p className="mt-1 text-sm text-white/50">
            Informe o e-mail da sua conta e enviaremos um link para redefinir a senha.
          </p>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur">
            <p className="text-sm text-white/80">
              Se esse e-mail tiver uma conta, enviamos um link de redefinição para ele. Verifique também
              a caixa de spam.
            </p>
            <Link
              href="/admin/login"
              className="mt-4 inline-block text-sm font-medium text-white underline hover:text-white/80"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
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
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-white py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-50"
            >
              {isPending ? "Enviando..." : "Enviar link de redefinição"}
            </button>
            <Link
              href="/admin/login"
              className="block text-center text-xs text-white/50 hover:text-white/80 hover:underline"
            >
              Voltar para o login
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}

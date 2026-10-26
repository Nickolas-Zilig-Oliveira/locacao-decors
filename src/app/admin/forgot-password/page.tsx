"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AuthShell, authButton, authField, authLabel, authLink } from "../auth-shell";
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
    <AuthShell
      title={sent ? "Confira seu e-mail" : "Esqueci minha senha"}
      subtitle={
        sent
          ? undefined
          : "Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
      }
      footer={
        <Link href="/admin/login" className={authLink}>
          Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <p className="text-center text-sm leading-relaxed text-white/75">
          Se esse e-mail tiver uma conta, o link de redefinição já está a caminho. Se não chegar em alguns
          minutos, olhe a caixa de spam.
        </p>
      ) : (
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className={authLabel}>
              E-mail
            </label>
            <input
              id="forgot-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              className={authField}
            />
          </div>
          <button type="submit" disabled={isPending} className={`${authButton} mt-2`}>
            {isPending ? "Enviando…" : "Enviar link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

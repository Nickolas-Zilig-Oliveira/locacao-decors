"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell, authButton, authField, authLabel } from "../auth-shell";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    // If the recovery link was already consumed by the time this effect
    // runs, there may already be a session — allow it too.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    const timeout = setTimeout(() => {
      setInvalid((current) => current || !ready);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (updateError) {
      setError("Não foi possível redefinir a senha. O link pode ter expirado — peça um novo.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/admin/login"), 2000);
  }

  return (
    <AuthShell title="Nova senha" subtitle="Escolha uma senha com pelo menos 6 caracteres.">
      {success ? (
        <p className="text-center text-sm text-emerald-300" role="status">
          Senha alterada. Levando você para o login…
        </p>
      ) : invalid && !ready ? (
        <p className="text-center text-sm leading-relaxed text-white/70">
          Esse link expirou ou já foi usado. Volte ao login e peça um novo em “Esqueci minha senha”.
        </p>
      ) : !ready ? (
        <p className="text-center text-sm text-white/50">Verificando o link…</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-password" className={authLabel}>
              Nova senha
            </label>
            <input
              id="reset-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authField}
            />
          </div>
          <div>
            <label htmlFor="reset-confirm" className={authLabel}>
              Confirmar senha
            </label>
            <input
              id="reset-confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={authField}
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={isSubmitting} className={`${authButton} mt-2`}>
            {isSubmitting ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

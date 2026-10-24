import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 py-12 text-white">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
          Ziliglasis
        </p>
        <h1 className="text-2xl font-bold sm:text-3xl">Sistema de Locação de Decoração</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
          Plataforma multi-tenant: cada empresa tem sua própria vitrine e painel de gestão.
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        <Link
          href="/c/lavita-decor"
          className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition hover:border-pink-400/50 hover:bg-white/10"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/20 text-pink-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M3 9.5 12 3l9 6.5" />
              <path d="M5 10v10h14V10" />
            </svg>
          </div>
          <p className="font-semibold">Ver loja de exemplo</p>
          <p className="mt-1 text-xs text-white/50">Entre na vitrine pública de um locador</p>
        </Link>

        <Link
          href="/admin/login"
          className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition hover:border-indigo-400/50 hover:bg-white/10"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="font-semibold">Painel do locador</p>
          <p className="mt-1 text-xs text-white/50">Gerencie itens, reservas e contratos</p>
        </Link>
      </div>

      <p className="mt-10 text-xs text-white/30">Plataforma operada por Ziliglasis</p>
    </main>
  );
}

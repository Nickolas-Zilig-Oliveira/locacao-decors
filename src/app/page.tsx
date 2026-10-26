import Link from "next/link";

const ACCENT = "#ee719e";

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-5 py-16 text-white"
      style={{ backgroundColor: `color-mix(in srgb, ${ACCENT} 12%, #0b0b0d)`, ["--accent" as string]: ACCENT }}
    >
      <div className="w-full max-w-md text-center">
        <p className="font-display text-[34px] font-extrabold leading-none tracking-tight" style={{ color: ACCENT }}>
          ziligz
        </p>
        <h1 className="mt-8 text-3xl font-bold leading-tight sm:text-[40px]">
          Sua loja de decoração com vitrine, agenda e contratos
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-white/60">
          Cada locador tem o próprio catálogo público e um painel para cuidar de pedidos, contratos e caixa.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/admin/login"
            className="flex h-12 items-center justify-center rounded-full bg-white px-7 text-[15px] font-semibold text-neutral-900 transition-colors hover:bg-white/90"
          >
            Entrar no painel
          </Link>
          <Link
            href="/c/lavita-decor"
            className="flex h-12 items-center justify-center rounded-full px-7 text-[15px] font-semibold text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/[0.06]"
          >
            Ver loja de exemplo
          </Link>
        </div>
      </div>
    </main>
  );
}

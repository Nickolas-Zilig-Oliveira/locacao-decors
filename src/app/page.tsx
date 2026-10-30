import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getItems, getTenantBySlug } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Ziligz — catálogo, agenda e contratos para lojas de decoração",
  description:
    "Catálogo online com a sua marca, calendário de datas livres, pedidos direto no WhatsApp e um painel completo para gerir contratos e caixa.",
};

const DEMO_SLUG = "lavita-decor";
const DEMO_HREF = `/c/${DEMO_SLUG}`;

const PINK = "#ee719e";
const PINK_STRONG = "#c93d73";
const INK = "#24101b";
const GROUND = "#fff6f9";
const BLUSH = "#fbd3e1";
const PLUM = "#2a1220";

const steps = [
  {
    title: "O cliente escolhe o kit e a data",
    text: "Catálogo com fotos, categorias e o que vem em cada kit. As datas já reservadas aparecem bloqueadas no calendário.",
  },
  {
    title: "O pedido chega no seu WhatsApp",
    text: "Com nome, telefone, kit e data. Você confirma pagamento e retirada na conversa, do jeito que já faz hoje.",
  },
  {
    title: "Você fecha o contrato em PDF",
    text: "Itens, valores e regras de retirada já preenchidos. É só gerar e enviar para o cliente.",
  },
];

const features = [
  ["Itens e kits", "Cadastre com foto, preço e a lista do que vem em cada kit."],
  ["Categorias", "Organize a vitrine. As categorias com mais itens aparecem primeiro."],
  ["Pedidos do site", "Veja, confirme ou recuse cada reserva que chegar."],
  ["Contratos em PDF", "Gere o contrato com valores, itens e regras de retirada."],
  ["Caixa", "Acompanhe o que já recebeu e o que ainda falta receber."],
  ["Agenda", "Os próximos eventos na tela inicial, com atalho para o WhatsApp."],
  ["IA nas descrições", "Envie a foto e receba uma sugestão de nome e descrição."],
  ["Claro e escuro", "Trabalhe no modo mais confortável, no celular ou no computador."],
];

const faq = [
  {
    q: "O cliente paga pelo site?",
    a: "Não. O pedido vira uma conversa no seu WhatsApp, e você combina pagamento e retirada com o cliente, como já faz hoje.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim, o catálogo e o painel foram feitos pensando no celular. Você cadastra um kit direto da galeria do telefone.",
  },
  {
    q: "Posso usar minha logo e minha cor?",
    a: "Sim. A loja usa o seu nome, a sua logo e a cor da sua marca, e o endereço é só seu.",
  },
  {
    q: "E se eu tiver muitos itens?",
    a: "Você separa por categoria e por tipo (kits ou itens avulsos), e o cliente ainda pode buscar pelo nome.",
  },
];

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold leading-none tracking-tight ${className}`} style={{ color: PINK_STRONG }}>
      ziligz
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default async function Home() {
  const tenant = await getTenantBySlug(DEMO_SLUG).catch(() => null);
  const items = tenant ? await getItems(tenant.id).catch(() => []) : [];
  const photos = items.filter((i) => i.images?.[0]).slice(0, 5);


  const primaryBtn =
    "group inline-flex h-13 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold text-white transition-[transform,background-color] duration-200 active:scale-[0.98]";

  return (
    <main className="overflow-x-clip" style={{ backgroundColor: GROUND, color: INK, ["--accent" as string]: PINK_STRONG }}>
      {/* Hero */}
      <section className="relative">
        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Wordmark className="text-[28px]" />
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Principal">
            <a href="#como" className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors hover:bg-black/5 md:flex">
              Como funciona
            </a>
            <a href="#painel" className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors hover:bg-black/5 md:flex">
              Painel
            </a>
            <a href="#preco" className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors hover:bg-black/5 md:flex">
              Preço
            </a>
            <Link
              href="/admin/login"
              className="flex h-10 items-center rounded-full px-4 text-sm font-semibold ring-1 ring-inset ring-black/15 transition-colors hover:bg-black/5"
            >
              Entrar
            </Link>
          </nav>
        </header>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 grid-cols-1 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-6 lg:pb-28 lg:pt-10">
          <div className="relative z-10">
            <h1 className="anim-rise text-[44px] font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-[68px]">
              Sua loja de festa, sempre aberta.
            </h1>
            <p className="anim-rise mt-6 max-w-xl text-[17px] leading-relaxed sm:text-lg" style={{ ["--d" as string]: "90ms", color: "#4a3140" }}>
              Catálogo online com a sua marca, calendário de datas livres e pedidos direto no seu WhatsApp. E um painel completo para cuidar de itens, contratos e caixa.
            </p>
            <div className="anim-rise mt-9 flex flex-wrap items-center gap-3" style={{ ["--d" as string]: "180ms" }}>
              <Link href={DEMO_HREF} className={primaryBtn} style={{ backgroundColor: PINK_STRONG }}>
                Ver loja de exemplo
                <ArrowIcon />
              </Link>
                              <Link href="/admin/login" className="inline-flex h-13 items-center rounded-full px-6 text-[15px] font-semibold ring-1 ring-inset ring-black/20 transition-colors hover:bg-black/5">
                  Entrar no painel
                </Link>
            </div>
            <p className="anim-rise mt-5 text-sm" style={{ ["--d" as string]: "260ms", color: "#6b5260" }}>
              R$ 100 por mês, tudo incluso.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[340px] lg:max-w-none">
            <div aria-hidden className="float-slow absolute -right-10 top-4 h-[300px] w-[300px] rounded-full sm:h-[420px] sm:w-[420px] lg:-right-24 lg:top-0 lg:h-[520px] lg:w-[520px]" style={{ backgroundColor: BLUSH }} />
            <div aria-hidden className="float-slow absolute -left-8 bottom-6 h-24 w-24 rounded-full sm:h-32 sm:w-32" style={{ backgroundColor: PINK, ["--d" as string]: "-3s" }} />
            <div aria-hidden className="absolute -right-4 bottom-0 h-40 w-28 rounded-t-full sm:h-56 sm:w-40" style={{ backgroundColor: PLUM }} />

            <div className="anim-rise relative mx-auto w-[300px] rounded-[42px] p-3 sm:w-[320px]" style={{ backgroundColor: PLUM, ["--d" as string]: "200ms" }}>
              <div className="relative overflow-hidden rounded-[32px] bg-white">
                <iframe
                  src={DEMO_HREF}
                  title="Prévia da loja de exemplo"
                  loading="lazy"
                  tabIndex={-1}
                  aria-hidden
                  className="pointer-events-none block h-[560px] w-full border-0 sm:h-[620px]"
                />
                <Link href={DEMO_HREF} className="absolute inset-0 z-10" aria-label="Abrir a loja de exemplo" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <h2 className="reveal text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              Do pedido ao contrato, sem planilha.
            </h2>
            <ol className="mt-12 space-y-10">
              {steps.map((s) => (
                <li key={s.title} className="reveal">
                  <h3 className="text-2xl font-bold leading-tight">{s.title}</h3>
                  <p className="mt-2 max-w-md text-[16px] leading-relaxed" style={{ color: "#4a3140" }}>
                    {s.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="reveal relative flex items-center justify-center lg:justify-end">
            <div aria-hidden className="absolute inset-x-0 top-1/2 mx-auto h-[86%] w-[86%] -translate-y-1/2 rounded-[48px]" style={{ backgroundColor: BLUSH }} />
            <div data-ui className="relative w-full max-w-sm rounded-[28px] p-5" style={{ backgroundColor: "#e8e1d8" }}>
              <p className="mb-3 text-center text-xs font-semibold" style={{ color: "#5b5348" }}>
                Hoje
              </p>
              <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md p-3.5 text-[15px] leading-snug" style={{ backgroundColor: "#d9fdd3", color: "#1d2a1a" }}>
                Olá! Acabei de solicitar a reserva de &quot;Kit Batman Clássico&quot; para sábado, 14 de novembro. Meu nome é Marina.
                <span className="mt-1 block text-right text-[11px]" style={{ color: "#5f7a58" }}>
                  14:32
                </span>
              </div>
              <div className="mt-3 max-w-[80%] rounded-2xl rounded-tl-md bg-white p-3.5 text-[15px] leading-snug" style={{ color: "#1d1d1d" }}>
                Oi, Marina! Essa data está livre. Vou te mandar o contrato para confirmar.
                <span className="mt-1 block text-right text-[11px]" style={{ color: "#7a7a7a" }}>
                  14:35
                </span>
              </div>
              <p className="mt-4 text-center text-[12px]" style={{ color: "#6f675c" }}>
                Conversa de exemplo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Painel */}
      <section id="painel" className="relative" style={{ backgroundColor: PLUM, color: "#fff4f8" }}>
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-32">
          <div>
            <h2 className="reveal text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              Um painel completo para cuidar de tudo sozinha.
            </h2>
            <dl className="mt-12 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {features.map(([title, text]) => (
                <div key={title} className="reveal">
                  <dt className="text-[17px] font-bold">{title}</dt>
                  <dd className="mt-1 text-[15px] leading-relaxed" style={{ color: "#e3c3d0" }}>
                    {text}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="reveal relative self-center">
            <div aria-hidden className="absolute -right-6 -top-6 h-40 w-40 rounded-full" style={{ backgroundColor: PINK }} />
            <div data-ui className="relative overflow-hidden rounded-[28px] bg-[#f7f5f6] p-5 text-neutral-900 sm:p-6">
              <p className="text-xl font-bold">Olá, Sua Loja</p>
              <p className="text-sm text-neutral-500">Segunda-feira, 26 de outubro</p>
              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {[
                  ["Itens ativos", "24"],
                  ["Pedidos pendentes", "3"],
                  ["A receber", "R$ 1.280"],
                ].map(([label, value], i) => (
                  <div key={label} className="rounded-2xl bg-white p-3">
                    <p className="text-[11px] font-semibold text-neutral-500">{label}</p>
                    <p className="mt-1 whitespace-nowrap text-base font-bold tabular-nums sm:text-lg" style={i === 1 ? { color: PINK_STRONG } : undefined}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mb-2 mt-6 text-sm font-bold">Próximos eventos</p>
              <ul className="overflow-hidden rounded-2xl bg-white">
                {[
                  ["OUT", "29", "Marina Souza", "Kit Batman Clássico", "pendente"],
                  ["OUT", "31", "Paula Lima", "Painel Fundo do Mar", ""],
                  ["NOV", "07", "Carla Mendes", "Casamento Rústico", ""],
                ].map(([m, d, name, kit, tag], i) => (
                  <li key={name} className="flex items-center gap-3 px-3.5 py-3" style={i > 0 ? { borderTop: "1px solid #f1eef0" } : undefined}>
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-white" style={{ backgroundColor: i === 0 ? PINK_STRONG : "#f1eef0", color: i === 0 ? "#fff" : "#4b4b4b" }}>
                      <span className="text-[9px] font-semibold leading-none">{m}</span>
                      <span className="mt-0.5 text-base font-bold leading-none tabular-nums">{d}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{name}</span>
                      <span className="block truncate text-[13px] text-neutral-500">
                        {kit}
                        {tag && (
                          <span className="ml-1.5 rounded-full bg-amber-50 px-1.5 py-px text-[11px] font-semibold text-amber-700">{tag}</span>
                        )}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-center text-xs text-neutral-400">Dados de exemplo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Galeria */}
      {photos.length >= 3 && (
        <section className="py-24 lg:py-32">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <h2 className="reveal max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              Seus kits, do jeito que o cliente vê.
            </h2>
            <p className="reveal mt-4 max-w-lg text-[17px] leading-relaxed" style={{ color: "#4a3140" }}>
              Fotos grandes, nome e preço à vista. Assim o cliente se apaixona pelo kit antes de mandar a primeira mensagem.
            </p>
          </div>
          <ul className="no-scrollbar mx-auto mt-14 flex w-full max-w-7xl snap-x scroll-pl-5 gap-4 overflow-x-auto px-5 pb-4 sm:scroll-pl-8 sm:px-8 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible">
            {photos.map((item, i) => (
              <li
                key={item.id}
                className="reveal w-[62vw] max-w-[260px] shrink-0 snap-start lg:w-auto lg:max-w-none"
                style={{ marginTop: i % 2 === 1 ? "2.5rem" : 0 }}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl" style={{ backgroundColor: BLUSH }}>
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 230px, 62vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 truncate px-1 text-[15px] font-semibold">{item.name}</p>
              </li>
            ))}
          </ul>
          <div className="mx-auto mt-12 flex w-full max-w-7xl px-5 sm:px-8">
            <Link href={DEMO_HREF} className={primaryBtn} style={{ backgroundColor: PINK_STRONG }}>
              Abrir a loja de exemplo
              <ArrowIcon />
            </Link>
          </div>
        </section>
      )}

      {/* Preço */}
      <section id="preco" className="relative overflow-hidden" style={{ backgroundColor: PINK, color: INK }}>
        <div aria-hidden className="absolute -left-24 -top-24 h-80 w-80 rounded-full" style={{ backgroundColor: "#f58db1" }} />
        <div aria-hidden className="absolute -bottom-32 right-[-5rem] h-96 w-72 rounded-t-full" style={{ backgroundColor: PLUM }} />
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:py-32">
          <div>
            <h2 className="reveal text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">Um plano só, tudo incluso.</h2>
            <p className="reveal mt-8 flex items-baseline gap-2 whitespace-nowrap">
              <span className="font-display text-[72px] font-extrabold leading-none tracking-[-0.05em] min-[400px]:text-[88px] sm:text-[120px]">R$ 100</span>
              <span className="text-2xl font-bold">/mês</span>
            </p>
          </div>
          <div className="reveal rounded-[32px] p-7 sm:p-9" style={{ backgroundColor: "#fff6f9" }}>
            <ul className="space-y-3.5 text-[17px] font-medium">
              {[
                "Site do seu catálogo com a sua marca",
                "Calendário de datas livres",
                "Pedidos direto no seu WhatsApp",
                "Painel completo de gestão",
                "Contratos em PDF e controle de caixa",
                "IA que sugere nome e descrição dos kits",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke={PINK_STRONG} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-1 h-5 w-5 shrink-0" aria-hidden>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
                          <Link href={DEMO_HREF} className={`${primaryBtn} mt-8 w-full`} style={{ backgroundColor: PLUM }}>
                Ver a loja de exemplo
                <ArrowIcon />
              </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-4xl px-5 py-24 sm:px-8 lg:py-32">
        <h2 className="reveal text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">Perguntas comuns</h2>
        <div className="mt-10 space-y-3">
          {faq.map((f) => (
            <details key={f.q} className="group reveal rounded-3xl p-5 sm:px-7 [&_summary::-webkit-details-marker]:hidden" style={{ backgroundColor: "#fdebf2" }}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
                {f.q}
                <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300 group-open:rotate-45" style={{ backgroundColor: PINK_STRONG }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-[16px] leading-relaxed" style={{ color: "#4a3140" }}>
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Fecho */}
      <footer className="relative overflow-hidden" style={{ backgroundColor: PLUM, color: "#fff4f8" }}>
        <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-20 sm:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-[-0.02em] sm:text-4xl">
              Deixe a sua loja de decoração pronta para receber pedidos.
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href={DEMO_HREF} className={primaryBtn} style={{ backgroundColor: PINK_STRONG }}>
                Ver loja de exemplo
                <ArrowIcon />
              </Link>
              <Link href="/admin/login" className="inline-flex h-13 items-center rounded-full px-6 text-[15px] font-semibold ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/10">
                Entrar no painel
              </Link>
            </div>
          </div>
          <p aria-hidden className="mt-16 select-none pb-[2vw] text-center font-display text-[36vw] font-extrabold leading-[0.85] tracking-[-0.06em]" style={{ color: PINK }}>
            ziligz
          </p>
          <p className="mt-6 text-sm" style={{ color: "#c9a5b6" }}>
            © {new Date().getFullYear()} Ziligz
          </p>
        </div>
      </footer>
    </main>
  );
}

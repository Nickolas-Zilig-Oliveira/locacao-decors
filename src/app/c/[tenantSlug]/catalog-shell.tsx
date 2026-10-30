"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Category, Item, Tenant } from "@/lib/types";
import { SiteFooter } from "./site-footer";
import { StoreHeader, headerIconBtn } from "./store-header";
import { formatBRL, storePageBg, storeTheme, useDocumentTheme, useStoreDark } from "./store-theme";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  MapPinIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
  WhatsAppIcon,
} from "./icons";

type Props = {
  tenant: Tenant;
  tenantSlug: string;
  categories: Category[];
  categoryCounts: { total: number; byCategory: Record<string, number> };
  items: Item[];
  categoria?: string;
  q?: string;
  tipo?: "kit" | "avulso";
  waLink: string | null;
  isAdminViewer?: boolean;
};

export function CatalogShell({
  tenant,
  tenantSlug,
  categories,
  categoryCounts,
  items,
  categoria,
  q,
  tipo,
  waLink,
  isAdminViewer,
}: Props) {
  const [dark, setDark] = useStoreDark();
  const [searchOpen, setSearchOpen] = useState(() => Boolean(q));
  const [canScroll, setCanScroll] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const categorySearchRef = useRef<HTMLInputElement>(null);
  const accent = tenant.primary_color;
  const pageBg = storePageBg(accent, dark);
  const theme = storeTheme(dark);
  useDocumentTheme(pageBg, dark);

  const filteredCategories = categorySearch.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(categorySearch.trim().toLowerCase()))
    : categories;

  const isBrowsingAll = !categoria && !q && !tipo;
  const activeCategory = categories.find((c) => c.slug === categoria);

  function closeCategoryMenu() {
    setCategoryMenuOpen(false);
    setCategorySearch("");
  }

  function buildHref(overrides: { categoria?: string; q?: string; tipo?: string }) {
    const params = new URLSearchParams();
    if (overrides.categoria) params.set("categoria", overrides.categoria);
    if (overrides.q) params.set("q", overrides.q);
    if (overrides.tipo) params.set("tipo", overrides.tipo);
    const qs = params.toString();
    return `/c/${tenantSlug}${qs ? `?${qs}` : ""}`;
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const check = () => setCanScroll(el.scrollWidth > el.clientWidth + 4);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [categories]);

  useEffect(() => {
    if (!categoryMenuOpen) return;
    const t = setTimeout(() => categorySearchRef.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCategoryMenu();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [categoryMenuOpen]);

  function scrollCategories() {
    scrollerRef.current?.scrollBy({ left: 240, behavior: "smooth" });
  }

  const badgeBg = `color-mix(in srgb, ${accent} 55%, black)`;
  const activePill = { backgroundColor: accent, color: "white" };
  const resultLabel = items.length === 1 ? "1 item" : `${items.length} itens`;

  return (
    <div
      className={`flex min-h-screen flex-col transition-colors duration-500 ${theme.text}`}
      style={{ backgroundColor: pageBg, ["--accent" as string]: accent }}
    >
      <StoreHeader
        name={tenant.name}
        logoUrl={tenant.logo_url}
        accent={accent}
        homeHref={`/c/${tenantSlug}`}
        actions={
          <>
            {waLink && (
              <a href={waLink} target="_blank" rel="noreferrer" className={headerIconBtn} aria-label="Falar no WhatsApp">
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className={headerIconBtn}
              aria-label={searchOpen ? "Fechar busca" : "Buscar produtos"}
              aria-expanded={searchOpen}
            >
              {searchOpen ? <CloseIcon className="h-4 w-4" /> : <SearchIcon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setDark((v) => !v)}
              className={headerIconBtn}
              aria-label={dark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            >
              {dark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>
          </>
        }
      >
        {searchOpen && (
          <form action={`/c/${tenantSlug}`} className="relative w-full" role="search">
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            {tipo && <input type="hidden" name="tipo" value={tipo} />}
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/75" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar por tema, personagem, ocasião…"
              autoFocus
              aria-label="Buscar produtos"
              className="w-full rounded-full border-0 bg-black/15 py-2.5 pl-10 pr-4 text-[15px] text-white placeholder-white/70 outline-none transition-colors focus:bg-black/25 focus-visible:outline-none"
            />
          </form>
        )}
      </StoreHeader>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {isBrowsingAll && (tenant.description || tenant.city) && (
          <section className="mb-7 max-w-2xl">
            {tenant.description && (
              <p className={`text-[15px] leading-relaxed sm:text-base ${theme.softText}`}>{tenant.description}</p>
            )}
            {tenant.city && (
              <p className={`mt-2.5 flex items-center gap-1.5 text-sm ${theme.muted}`}>
                <MapPinIcon className="h-4 w-4 shrink-0" style={{ color: accent }} />
                {tenant.city}
              </p>
            )}
          </section>
        )}

        <nav aria-label="Categorias" className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoryMenuOpen(true)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${theme.iconBtn}`}
            aria-label="Ver todas as categorias"
          >
            <MenuIcon className="h-4 w-4" />
          </button>

          <div ref={scrollerRef} className="no-scrollbar flex flex-1 gap-2 overflow-x-auto scroll-smooth">
            <Link
              href={buildHref({ q, tipo })}
              className={`flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${
                !categoria ? "" : theme.pill
              }`}
              style={!categoria ? activePill : undefined}
              aria-current={!categoria ? "page" : undefined}
            >
              Todos
            </Link>
            {categories.map((c) => {
              const active = categoria === c.slug;
              const count = categoryCounts.byCategory[c.id] ?? 0;
              return (
                <Link
                  key={c.id}
                  href={buildHref({ categoria: c.slug, q, tipo })}
                  className={`flex h-9 shrink-0 items-center gap-2 rounded-full pl-4 pr-2.5 text-sm font-semibold transition-colors duration-200 ${
                    active ? "" : theme.pill
                  }`}
                  style={active ? activePill : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  {c.name}
                  <span
                    className={`min-w-5 rounded-full px-1.5 py-px text-center text-[11px] font-semibold tabular-nums ${
                      active ? "bg-white/25" : dark ? "bg-white/10" : "bg-neutral-900/[0.07]"
                    }`}
                  >
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>

          {canScroll && (
            <button
              type="button"
              onClick={scrollCategories}
              className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 sm:flex ${theme.iconBtn}`}
              aria-label="Mais categorias"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          )}
        </nav>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" role="group" aria-label="Tipo de item">
            {([
              { label: "Tudo", value: undefined },
              { label: "Kits", value: "kit" as const },
              { label: "Itens avulsos", value: "avulso" as const },
            ]).map((opt) => {
              const active = tipo === opt.value;
              return (
                <Link
                  key={opt.label}
                  href={buildHref({ categoria, q, tipo: opt.value })}
                  className={`flex h-8 items-center rounded-full px-3.5 text-[13px] font-semibold transition-colors duration-200 ${
                    active ? "" : theme.outline
                  }`}
                  style={active ? activePill : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  {opt.label}
                </Link>
              );
            })}
          </div>
          <p className={`text-sm tabular-nums ${theme.muted}`} aria-live="polite">
            {q ? (
              <>
                {resultLabel} para “{q}”
              </>
            ) : activeCategory ? (
              <>
                {resultLabel} em {activeCategory.name}
              </>
            ) : (
              resultLabel
            )}
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {items.map((item, index) => (
              <Link
                key={item.id}
                href={`/c/${tenantSlug}/item/${item.slug}`}
                className={`anim-rise group flex flex-col overflow-hidden rounded-2xl transition-[box-shadow,background-color] duration-300 ${theme.card}`}
                style={{ ["--d" as string]: `${Math.min(index, 7) * 55}ms` }}
              >
                <div className={`relative aspect-[3/4] overflow-hidden ${theme.cardImgBg}`}>
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      sizes="(min-width: 1024px) 280px, (min-width: 768px) 30vw, 48vw"
                      priority={index < 2}
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center text-xs ${theme.muted}`}>
                      Sem foto
                    </div>
                  )}
                  {item.piece_count ? (
                    <span
                      className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none text-white shadow-sm tabular-nums"
                      style={{ backgroundColor: badgeBg }}
                    >
                      {item.piece_count} peças
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-1 px-3.5 pb-3.5 pt-3">
                  <p className="line-clamp-2 text-[14px] font-semibold leading-snug sm:text-[15px]">{item.name}</p>
                  <p className="mt-auto pt-0.5 text-[15px] font-bold tabular-nums" style={{ color: accent }}>
                    {formatBRL(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`flex flex-col items-center rounded-2xl px-6 py-16 text-center ${theme.cardImgBg}`}>
            <SearchIcon className={`h-6 w-6 ${theme.muted}`} />
            <p className="mt-3 font-display text-lg font-bold">Nada por aqui</p>
            <p className={`mt-1 max-w-xs text-sm ${theme.muted}`}>
              {q ? `Não achamos itens para “${q}”. Tente outra palavra ou veja tudo.` : "Ainda não há itens nesse filtro."}
            </p>
            <Link
              href={`/c/${tenantSlug}`}
              className="mt-5 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              Ver todo o catálogo
            </Link>
          </div>
        )}
      </main>

      <SiteFooter tenantName={tenant.name} instagram={tenant.instagram} dark={dark} />

      {isAdminViewer && (
        <Link
          href="/admin"
          className="fixed bottom-5 left-5 z-20 flex h-10 items-center gap-1 rounded-full bg-neutral-950/85 pl-2.5 pr-4 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-neutral-950"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Painel
        </Link>
      )}

      <div
        className={`fixed inset-0 z-50 flex transition-[visibility] duration-300 ${
          categoryMenuOpen ? "visible" : "invisible"
        }`}
        aria-hidden={!categoryMenuOpen}
      >
        <div
          className={`absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 ${
            categoryMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeCategoryMenu}
        />
        <div
          role="dialog"
          aria-label="Categorias"
          className={`relative flex w-80 max-w-[85vw] flex-col p-4 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            categoryMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            backgroundColor: theme.panel,
            paddingTop: "max(1rem, env(safe-area-inset-top))",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className={`font-display text-lg font-bold ${theme.text}`}>Categorias</p>
            <button
              type="button"
              onClick={closeCategoryMenu}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 ${theme.iconBtn}`}
              aria-label="Fechar categorias"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="relative mb-3 shrink-0">
            <SearchIcon className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.muted}`} />
            <input
              ref={categorySearchRef}
              type="search"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Buscar categoria"
              aria-label="Buscar categoria"
              className={`w-full rounded-xl border-0 py-2.5 pl-9 pr-3 text-sm outline-none transition-shadow ${theme.field}`}
            />
          </div>

          <div className="-mx-1 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-1">
            {!categorySearch.trim() && (
              <Link
                href={buildHref({ q, tipo })}
                onClick={closeCategoryMenu}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                  !categoria ? "" : `${theme.softText} ${dark ? "hover:bg-white/[0.06]" : "hover:bg-neutral-900/[0.04]"}`
                }`}
                style={!categoria ? activePill : undefined}
              >
                Todos
                <span className="text-xs tabular-nums opacity-70">{categoryCounts.total}</span>
              </Link>
            )}
            {filteredCategories.map((c) => {
              const active = categoria === c.slug;
              const count = categoryCounts.byCategory[c.id] ?? 0;
              return (
                <Link
                  key={c.id}
                  href={buildHref({ categoria: c.slug, q, tipo })}
                  onClick={closeCategoryMenu}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                    active ? "" : `${theme.softText} ${dark ? "hover:bg-white/[0.06]" : "hover:bg-neutral-900/[0.04]"}`
                  }`}
                  style={active ? activePill : undefined}
                >
                  {c.name}
                  <span className="text-xs tabular-nums opacity-70">{count}</span>
                </Link>
              );
            })}
            {categorySearch.trim() && filteredCategories.length === 0 && (
              <p className={`px-3 py-8 text-center text-sm ${theme.muted}`}>Nenhuma categoria com esse nome.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

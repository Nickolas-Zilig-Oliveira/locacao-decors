"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Category, Item, Tenant } from "@/lib/types";
import { SiteFooter } from "./site-footer";
import {
  ChevronRightIcon,
  CloseIcon,
  CropIcon,
  ExpandIcon,
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
  const [dark, setDark] = useState(true);
  const [searchOpen, setSearchOpen] = useState(() => Boolean(q));
  const [canScroll, setCanScroll] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const accent = tenant.primary_color;

  const filteredCategories = categorySearch.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(categorySearch.trim().toLowerCase()))
    : categories;

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

  function scrollCategories() {
    scrollerRef.current?.scrollBy({ left: 240, behavior: "smooth" });
  }

  const pageBg = dark
    ? `color-mix(in srgb, ${accent} 16%, #0b0b0d)`
    : "#ffffff";

  // Keep the iOS overscroll/bounce area the same color as the page so it
  // doesn't flash white past the top/bottom edges.
  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = pageBg;
    document.body.style.backgroundColor = pageBg;
    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
    };
  }, [pageBg]);

  const theme = dark
    ? {
        text: "text-white",
        muted: "text-white/50",
        softText: "text-white/70",
        pill: "bg-white/10 text-white",
        card: "bg-white/[0.06] border-white/10 hover:border-white/30",
        cardImgBg: "bg-white/10",
        iconBtn: "bg-white/10 text-white hover:bg-white/20",
        badge: "text-white",
      }
    : {
        text: "text-neutral-900",
        muted: "text-neutral-500",
        softText: "text-neutral-700",
        pill: "bg-neutral-100 text-neutral-800",
        card: "bg-white border-neutral-200 hover:border-neutral-400",
        cardImgBg: "bg-neutral-100",
        iconBtn: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        badge: "text-white",
      };

  const badgeBg = `color-mix(in srgb, ${accent} 55%, black)`;

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${theme.text}`}
      style={{ backgroundColor: pageBg }}
    >
      <header
        className="sticky top-0 z-10 flex flex-wrap items-center gap-3 px-4 pb-3 shadow-lg transition-colors duration-500 sm:px-6 lg:px-8"
        style={{ backgroundColor: accent, paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          {tenant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenant.logo_url}
              alt=""
              className="h-9 w-9 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold"
              style={{ color: accent }}
            >
              {tenant.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="truncate text-base font-bold uppercase tracking-wide text-white sm:text-lg">
            {tenant.name}
          </h1>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/20 text-white transition-colors hover:bg-black/30"
              aria-label="Falar no WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/20 text-white transition-colors hover:bg-black/30"
            aria-label={searchOpen ? "Fechar busca" : "Buscar produtos"}
          >
            {searchOpen ? <CloseIcon className="h-4 w-4" /> : <SearchIcon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setDark((v) => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/20 text-white transition-colors hover:bg-black/30"
            aria-label="Alternar tema"
          >
            {dark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
        </div>

        {searchOpen && (
          <form action={`/c/${tenantSlug}`} className="relative w-full">
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            {tipo && <input type="hidden" name="tipo" value={tipo} />}
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar produtos..."
              autoFocus
              className="w-full rounded-full border-0 bg-black/20 py-2 pl-9 pr-4 text-sm text-white placeholder-white/60 outline-none focus:bg-black/30"
            />
          </form>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 pb-16 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoryMenuOpen(true)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-500 ${theme.iconBtn}`}
            aria-label="Menu de categorias"
          >
            <MenuIcon className="h-4 w-4" />
          </button>

          <div ref={scrollerRef} className="no-scrollbar flex flex-1 gap-2 overflow-x-auto scroll-smooth">
            <Link
              href={buildHref({ q, tipo })}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-500 ${
                !categoria ? "" : theme.pill
              }`}
              style={!categoria ? { backgroundColor: accent, color: "white" } : undefined}
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
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-500 ${
                    active ? "" : theme.pill
                  }`}
                  style={active ? { backgroundColor: accent, color: "white" } : undefined}
                >
                  {c.name}
                  <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-xs">{count}</span>
                </Link>
              );
            })}
          </div>

          {canScroll && (
            <button
              type="button"
              onClick={scrollCategories}
              className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-500 sm:flex ${theme.iconBtn}`}
              aria-label="Mais categorias"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mb-4 flex items-center gap-2">
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
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-500 ${
                  active
                    ? "border-transparent"
                    : dark
                      ? "border-white/15 text-white/70 hover:border-white/30"
                      : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                }`}
                style={active ? { backgroundColor: accent, color: "white" } : undefined}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className={`text-sm transition-colors duration-500 ${theme.muted}`}>
            {items.length} itens encontrados
          </p>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded"
              style={{ backgroundColor: accent, color: "white" }}
              aria-label="Modo compacto"
            >
              <CropIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`flex h-8 w-8 items-center justify-center rounded transition-colors duration-500 ${theme.iconBtn}`}
              aria-label="Tela cheia"
            >
              <ExpandIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/c/${tenantSlug}/item/${item.slug}`}
              className={`group overflow-hidden rounded-xl border transition-colors duration-500 ${theme.card}`}
            >
              <div className={`relative aspect-square overflow-hidden ${theme.cardImgBg}`}>
                {item.piece_count && (
                  <span
                    className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${theme.badge}`}
                    style={{ backgroundColor: badgeBg }}
                  >
                    {item.piece_count} itens
                  </span>
                )}
                {item.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center text-xs ${theme.muted}`}>
                    sem foto
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-sm font-semibold" style={{ color: accent }}>
                  R$ {item.price.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {items.length === 0 && (
          <p className={`py-12 text-center ${theme.muted}`}>Nenhum item encontrado.</p>
        )}
      </main>

      <SiteFooter tenantName={tenant.name} instagram={tenant.instagram} dark={dark} />

      {isAdminViewer && (
        <Link
          href="/admin"
          className="fixed bottom-5 left-5 z-20 flex h-11 items-center gap-1.5 rounded-full bg-neutral-900/90 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-neutral-900"
        >
          ← Admin
        </Link>
      )}

      {categoryMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={closeCategoryMenu} />
          <div
            className="relative flex w-72 max-w-[80vw] flex-col p-4 transition-colors duration-500"
            style={{ backgroundColor: dark ? "#141417" : "#ffffff" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className={`text-sm font-semibold ${theme.text}`}>Categorias</p>
              <button
                type="button"
                onClick={closeCategoryMenu}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-500 ${theme.iconBtn}`}
                aria-label="Fechar menu"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mb-3 shrink-0">
              <SearchIcon
                className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  dark ? "text-white/40" : "text-neutral-400"
                }`}
              />
              <input
                type="search"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Buscar categoria..."
                autoFocus
                className={`w-full rounded-lg border-0 py-2 pl-9 pr-3 text-sm outline-none transition-colors duration-500 ${
                  dark
                    ? "bg-white/10 text-white placeholder-white/40 focus:bg-white/15"
                    : "bg-neutral-100 text-neutral-900 placeholder-neutral-400 focus:bg-neutral-200"
                }`}
              />
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto overscroll-contain">
              {!categorySearch.trim() && (
                <Link
                  href={buildHref({ q, tipo })}
                  onClick={closeCategoryMenu}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-500 ${
                    !categoria ? "" : theme.pill
                  }`}
                  style={!categoria ? { backgroundColor: accent, color: "white" } : undefined}
                >
                  Todos
                  <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-xs">
                    {categoryCounts.total}
                  </span>
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
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-500 ${
                      active ? "" : theme.pill
                    }`}
                    style={active ? { backgroundColor: accent, color: "white" } : undefined}
                  >
                    {c.name}
                    <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-xs">{count}</span>
                  </Link>
                );
              })}
              {categorySearch.trim() && filteredCategories.length === 0 && (
                <p className={`px-3 py-6 text-center text-xs ${theme.muted}`}>
                  Nenhuma categoria encontrada.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

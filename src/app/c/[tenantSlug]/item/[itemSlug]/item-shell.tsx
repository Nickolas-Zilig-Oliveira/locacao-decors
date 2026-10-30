"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Item, Tenant } from "@/lib/types";
import { SiteFooter } from "../../site-footer";
import { StoreHeader, headerIconBtn } from "../../store-header";
import { formatBRL, storePageBg, storeTheme, useDocumentTheme, useStoreDark } from "../../store-theme";
import { ChevronLeftIcon, MoonIcon, SunIcon, WhatsAppIcon } from "../../icons";
import { BookingForm } from "./booking-form";

type Props = {
  tenant: Pick<Tenant, "id" | "name" | "logo_url" | "primary_color" | "phone" | "instagram">;
  tenantSlug: string;
  item: Item;
  blockedDates: string[];
  waLink: string | null;
  isAdminViewer: boolean;
};

export function ItemShell({ tenant, tenantSlug, item, blockedDates, waLink, isAdminViewer }: Props) {
  const [dark, setDark] = useStoreDark();
  const accent = tenant.primary_color;
  const pageBg = storePageBg(accent, dark);
  const theme = storeTheme(dark);
  useDocumentTheme(pageBg, dark);

  const [reservaVisible, setReservaVisible] = useState(false);
  const catalogHref = `/c/${tenantSlug}`;
  const pieces = item.piece_count ?? item.components.reduce((sum, c) => sum + (c.quantity || 0), 0);

  useEffect(() => {
    const el = document.getElementById("reserva");
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setReservaVisible(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`flex min-h-screen flex-col transition-colors duration-500 ${theme.text}`}
      style={{ backgroundColor: pageBg, ["--accent" as string]: accent }}
    >
      <StoreHeader
        name={tenant.name}
        logoUrl={tenant.logo_url}
        accent={accent}
        homeHref={catalogHref}
        backHref={catalogHref}
        actions={
          <button
            type="button"
            onClick={() => setDark((v) => !v)}
            className={headerIconBtn}
            aria-label={dark ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {dark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
        }
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10 lg:gap-14">
          <div className="md:sticky md:top-24 md:self-start">
            <div className={`aspect-[3/4] overflow-hidden rounded-3xl ${theme.cardImgBg}`}>
              {item.images?.[0] ? (
                <Image
                  src={item.images[0]}
                  alt={item.name}
                  width={900}
                  height={1200}
                  sizes="(min-width: 768px) 480px, 92vw"
                  priority
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className={`flex h-full w-full items-center justify-center text-sm ${theme.muted}`}>Sem foto</div>
              )}
            </div>
          </div>

          <div className="md:pt-2">
            <h1 className="font-display text-[28px] font-bold leading-[1.1] sm:text-4xl">{item.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="font-display text-2xl font-bold tabular-nums" style={{ color: accent }}>
                {formatBRL(item.price)}
              </p>
              {pieces > 0 && (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${theme.pill}`}>
                  {pieces} {item.is_kit ? "peças no kit" : "peças"}
                </span>
              )}
            </div>

            {item.description && (
              <p className={`mt-5 max-w-prose whitespace-pre-line text-[15px] leading-relaxed ${theme.softText}`}>
                {item.description}
              </p>
            )}

            {item.components.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 font-display text-lg font-bold">O que vem no kit</h2>
                <ul className={`divide-y overflow-hidden rounded-2xl ${theme.card} ${dark ? "divide-white/[0.07]" : "divide-neutral-900/[0.06]"}`}>
                  {item.components.map((c, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-3">
                      <div className={`h-11 w-11 shrink-0 overflow-hidden rounded-xl ${theme.cardImgBg}`}>
                        {c.photo_url && (
                          <Image src={c.photo_url} alt="" width={88} height={88} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <p className="min-w-0 flex-1 text-sm font-medium">{c.name}</p>
                      <span className={`text-sm font-semibold tabular-nums ${theme.muted}`}>×{c.quantity}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <BookingForm
              tenantId={tenant.id}
              itemId={item.id}
              itemName={item.name}
              itemPrice={item.price}
              itemImage={item.images?.[0] ?? null}
              catalogHref={catalogHref}
              tenantPhone={tenant.phone}
              blockedDates={blockedDates}
              accent={accent}
              dark={dark}
            />
          </div>
        </div>
      </main>

      <SiteFooter tenantName={tenant.name} instagram={tenant.instagram} dark={dark} />

      {isAdminViewer && (
        <Link
          href="/admin"
          className="fixed bottom-24 left-5 z-20 flex h-10 items-center gap-1 rounded-full bg-neutral-950/85 pl-2.5 pr-4 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-neutral-950 md:bottom-5"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Painel
        </Link>
      )}

      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="fixed z-20 hidden h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.6)] transition-transform duration-200 hover:scale-105 active:scale-95 md:flex"
          style={{
            right: "max(1.25rem, env(safe-area-inset-right))",
            bottom: "max(1.25rem, env(safe-area-inset-bottom))",
          }}
          aria-label="Falar no WhatsApp"
        >
          <WhatsAppIcon className="h-7 w-7" />
        </a>
      )}

      <div
        className={`fixed inset-x-0 bottom-0 z-30 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          reservaVisible ? "translate-y-full" : "translate-y-0"
        }`}
        style={{
          backgroundColor: dark ? "#141417" : "#ffffff",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          boxShadow: "0 -12px 32px -16px rgba(0,0,0,0.35)",
        }}
        aria-hidden={reservaVisible}
      >
        <div className="flex items-center gap-3 px-4 pt-3">
          <div className="min-w-0 flex-1">
            <p className={`truncate text-xs ${theme.muted}`}>{item.name}</p>
            <p className="font-display text-lg font-bold leading-tight tabular-nums">{formatBRL(item.price)}</p>
          </div>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform duration-200 active:scale-95"
              aria-label="Tirar dúvidas no WhatsApp"
              tabIndex={reservaVisible ? -1 : 0}
            >
              <WhatsAppIcon className="h-6 w-6" />
            </a>
          )}
          <button
            type="button"
            tabIndex={reservaVisible ? -1 : 0}
            onClick={() => document.getElementById("reserva")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="h-12 shrink-0 rounded-full px-6 text-[15px] font-semibold text-white transition-transform duration-200 active:scale-[0.97]"
            style={{ backgroundColor: accent }}
          >
            Reservar data
          </button>
        </div>
      </div>
    </div>
  );
}

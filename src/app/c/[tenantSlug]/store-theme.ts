"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ziligz-store-theme";

/** Light/dark choice for the public storefront, shared by every store page. */
export function useStoreDark() {
  const [dark, setDark] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setDark(saved === "dark");
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    } catch {}
  }, [dark, ready]);

  return [dark, setDark] as const;
}

export function storePageBg(accent: string, dark: boolean) {
  return dark ? `color-mix(in srgb, ${accent} 16%, #0b0b0d)` : "#fbf9fa";
}

/** Keeps the iOS overscroll area and native form chrome in sync with the theme. */
export function useDocumentTheme(pageBg: string, dark: boolean) {
  useEffect(() => {
    const html = document.documentElement;
    const prev = {
      htmlBg: html.style.backgroundColor,
      bodyBg: document.body.style.backgroundColor,
      scheme: html.style.colorScheme,
    };
    html.style.backgroundColor = pageBg;
    document.body.style.backgroundColor = pageBg;
    html.style.colorScheme = dark ? "dark" : "light";
    return () => {
      html.style.backgroundColor = prev.htmlBg;
      document.body.style.backgroundColor = prev.bodyBg;
      html.style.colorScheme = prev.scheme;
    };
  }, [pageBg, dark]);
}

export function storeTheme(dark: boolean) {
  return dark
    ? {
        text: "text-white",
        muted: "text-white/55",
        softText: "text-white/75",
        pill: "bg-white/[0.08] text-white/85 hover:bg-white/[0.14]",
        card: "bg-white/[0.05] ring-1 ring-white/[0.08] hover:ring-white/20",
        cardImgBg: "bg-white/[0.06]",
        iconBtn: "bg-white/[0.08] text-white hover:bg-white/[0.14]",
        outline: "ring-1 ring-inset ring-white/15 text-white/75 hover:ring-white/30 hover:text-white",
        panel: "#141417",
        field: "bg-white/[0.06] text-white placeholder-white/35 ring-1 ring-inset ring-white/10 focus:ring-white/25",
        divider: "border-white/10",
      }
    : {
        text: "text-neutral-900",
        muted: "text-neutral-500",
        softText: "text-neutral-700",
        pill: "bg-neutral-900/[0.05] text-neutral-700 hover:bg-neutral-900/[0.09]",
        card: "bg-white shadow-[0_1px_2px_rgba(40,15,25,0.06),0_10px_28px_-14px_rgba(40,15,25,0.18)] hover:shadow-[0_2px_4px_rgba(40,15,25,0.06),0_18px_40px_-16px_rgba(40,15,25,0.26)]",
        cardImgBg: "bg-neutral-100",
        iconBtn: "bg-neutral-900/[0.05] text-neutral-700 hover:bg-neutral-900/[0.09]",
        outline: "ring-1 ring-inset ring-neutral-300 text-neutral-600 hover:ring-neutral-400 hover:text-neutral-900",
        panel: "#ffffff",
        field: "bg-white text-neutral-900 placeholder-neutral-400 ring-1 ring-inset ring-neutral-200 focus:ring-neutral-400",
        divider: "border-neutral-200",
      };
}

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

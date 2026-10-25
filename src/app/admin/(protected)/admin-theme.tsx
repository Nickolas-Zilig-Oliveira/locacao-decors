"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "ziligz-admin-theme";

type ThemeContextValue = {
  dark: boolean;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({ dark: false, toggle: () => {} });

export function useAdminTheme() {
  return useContext(ThemeContext);
}

export function AdminThemeProvider({
  primaryColor,
  children,
}: {
  primaryColor: string;
  children: React.ReactNode;
}) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(localStorage.getItem(STORAGE_KEY) === "1");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, dark ? "1" : "0");
  }, [dark, ready]);

  // Same tinted-near-black formula used on the public storefront's dark mode,
  // so the admin panel's dark theme matches it instead of a generic gray.
  const pageBg = dark ? `color-mix(in srgb, ${primaryColor} 16%, #0b0b0d)` : "#f5f5f5";

  // Keep the iOS overscroll/bounce area the same color as the page (and the
  // real color-scheme in sync with the toggle) instead of following the
  // phone's system theme — same fix as catalog-shell.tsx on the storefront.
  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevColorScheme = document.documentElement.style.colorScheme;
    document.documentElement.style.backgroundColor = pageBg;
    document.body.style.backgroundColor = pageBg;
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.colorScheme = prevColorScheme;
    };
  }, [pageBg, dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((v) => !v) }}>
      <div
        className={`admin-theme min-h-screen transition-colors duration-300 lg:flex ${dark ? "dark" : ""}`}
        style={{ backgroundColor: pageBg }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

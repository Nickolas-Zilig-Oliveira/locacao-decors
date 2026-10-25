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

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((v) => !v) }}>
      <div
        className={`admin-theme min-h-screen bg-neutral-100 transition-colors duration-300 dark:bg-neutral-950 lg:flex ${dark ? "dark" : ""}`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

"use client";

import { useEffect } from "react";

/** Keeps the iOS overscroll/bounce area the same color as the page background. */
export function IosBackgroundSync({ color }: { color: string }) {
  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    const prevColorScheme = document.documentElement.style.colorScheme;
    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
    document.documentElement.style.colorScheme = "dark";
    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.colorScheme = prevColorScheme;
    };
  }, [color]);

  return null;
}

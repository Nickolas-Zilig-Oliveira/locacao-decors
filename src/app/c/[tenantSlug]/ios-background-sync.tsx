"use client";

import { useEffect } from "react";

/** Keeps the iOS overscroll/bounce area the same color as the page background. */
export function IosBackgroundSync({ color }: { color: string }) {
  useEffect(() => {
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
    };
  }, [color]);

  return null;
}

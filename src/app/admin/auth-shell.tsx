const ACCENT = "#ee719e";

export const authLabel = "mb-1.5 block text-[13px] font-semibold text-white/70";
export const authField =
  "w-full rounded-xl border-0 bg-white/[0.06] px-3.5 py-3 text-[15px] text-white ring-1 ring-inset ring-white/10 outline-none transition-shadow placeholder:text-white/30 focus:ring-white/30";
export const authButton =
  "h-12 w-full rounded-full bg-white text-[15px] font-semibold text-neutral-900 transition-[background-color,transform] duration-200 hover:bg-white/90 active:scale-[0.99] disabled:opacity-50";
export const authLink = "text-sm font-medium text-white/55 underline-offset-4 transition-colors hover:text-white hover:underline";

/** Shared frame for the platform's sign-in, forgot-password and reset-password screens. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 text-white"
      style={{
        backgroundColor: `color-mix(in srgb, ${ACCENT} 12%, #0b0b0d)`,
        ["--accent" as string]: ACCENT,
        colorScheme: "dark",
      }}
    >
      <div className="relative w-full max-w-[380px]">
        <div className="mb-8 text-center">
          <p className="font-display text-[28px] font-extrabold leading-none tracking-tight" style={{ color: ACCENT }}>
            ziligz
          </p>
          <h1 className="mt-6 text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/55">{subtitle}</p>}
        </div>

        <div className="rounded-3xl bg-white/[0.045] p-6 ring-1 ring-white/[0.08] sm:p-7">{children}</div>

        {footer && <div className="mt-6 text-center">{footer}</div>}
      </div>
    </main>
  );
}

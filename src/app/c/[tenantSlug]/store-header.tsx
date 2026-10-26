import Link from "next/link";
import { ChevronLeftIcon } from "./icons";

type Props = {
  name: string;
  logoUrl: string | null;
  accent: string;
  homeHref: string;
  backHref?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export const headerIconBtn =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/15 text-white transition-colors duration-200 hover:bg-black/25 active:bg-black/30";

export function StoreHeader({ name, logoUrl, accent, homeHref, backHref, actions, children }: Props) {
  return (
    <header
      className="sticky top-0 z-30 px-4 pb-3 shadow-[0_6px_24px_-10px_rgba(0,0,0,0.45)] sm:px-6 lg:px-8"
      style={{ backgroundColor: accent, paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3">
        {backHref && (
          <Link href={backHref} className={headerIconBtn} aria-label="Voltar ao catálogo">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
        )}
        <Link href={homeHref} className="flex min-w-0 items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-xl object-cover ring-2 ring-white/30"
            />
          ) : (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white font-display text-sm font-bold"
              style={{ color: accent }}
            >
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate font-display text-lg font-bold tracking-tight text-white">{name}</span>
        </Link>

        {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}

        {children}
      </div>
    </header>
  );
}

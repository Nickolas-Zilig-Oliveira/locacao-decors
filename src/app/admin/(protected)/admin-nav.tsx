"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Tenant } from "@/lib/types";
import {
  BoxIcon,
  CalendarIcon,
  CloseIcon,
  FileIcon,
  GearIcon,
  HomeIcon,
  LogoutIcon,
  MenuIcon,
  MoonIcon,
  StoreIcon,
  SunIcon,
  TagIcon,
  WalletIcon,
} from "./admin-icons";
import { useAdminTheme } from "./admin-theme";

const navItems = [
  { href: "/admin", label: "Início", icon: HomeIcon },
  { href: "/admin/items", label: "Itens", icon: BoxIcon },
  { href: "/admin/categories", label: "Categorias", icon: TagIcon },
  { href: "/admin/bookings", label: "Pedidos do site", icon: CalendarIcon },
  { href: "/admin/quotes", label: "Contratos", icon: FileIcon },
  { href: "/admin/caixa", label: "Caixa", icon: WalletIcon },
  { href: "/admin/settings", label: "Configurações", icon: GearIcon },
];

function NavLinks({ primaryColor, onNavigate }: { primaryColor: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "font-semibold" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
            style={active ? { backgroundColor: `${primaryColor}1a`, color: primaryColor } : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

type NavProps = {
  tenant: Tenant;
  tenantSlug: string;
  onLogout: () => void;
};

/** Fixed mobile header + slide-in drawer. Rendered only below the lg breakpoint. */
export function AdminTopBar({ tenant, tenantSlug, onLogout }: NavProps) {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useAdminTheme();

  return (
    <>
      <div
        className="sticky top-0 z-30 flex w-full items-center justify-between gap-2 px-4 py-3 text-white shadow-md lg:hidden"
        style={{
          backgroundColor: tenant.primary_color,
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {tenant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logo_url} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
          ) : (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold"
              style={{ color: tenant.primary_color }}
            >
              {tenant.name.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="truncate text-sm font-bold">{tenant.name}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/20 active:bg-black/30"
            aria-label={dark ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {dark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/20 active:bg-black/30"
            aria-label="Abrir menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
        <div
          className={`admin-surface relative flex w-72 flex-col bg-white text-neutral-900 transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div
            className="flex items-center justify-between gap-2 p-4 text-white"
            style={{
              backgroundColor: tenant.primary_color,
              paddingTop: "max(1rem, env(safe-area-inset-top))",
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              {tenant.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tenant.logo_url} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
              ) : (
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold"
                  style={{ color: tenant.primary_color }}
                >
                  {tenant.name.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="truncate text-sm font-bold">{tenant.name}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/20"
              aria-label="Fechar menu"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <NavLinks primaryColor={tenant.primary_color} onNavigate={() => setOpen(false)} />
            <div className="mt-auto space-y-1 border-t border-neutral-100 pt-4">
              <Link
                href={`/c/${tenantSlug}`}
                target="_blank"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <StoreIcon className="h-4 w-4" />
                Ver minha loja
              </Link>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <LogoutIcon className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Fixed-width sidebar column. Rendered only at the lg breakpoint and above. */
export function AdminSidebar({ tenant, tenantSlug, onLogout }: NavProps) {
  const { dark, toggle } = useAdminTheme();

  return (
    <aside className="admin-surface sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-white text-neutral-900 lg:flex">
      <div
        className="flex items-center justify-between gap-2 px-4 py-3 text-white"
        style={{ backgroundColor: tenant.primary_color }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {tenant.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logo_url} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
          ) : (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold"
              style={{ color: tenant.primary_color }}
            >
              {tenant.name.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="truncate text-sm font-bold">{tenant.name}</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/20 hover:bg-black/30"
          aria-label={dark ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
          {dark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <NavLinks primaryColor={tenant.primary_color} />

        <div className="mt-auto space-y-1 border-t border-neutral-100 pt-4">
          <Link
            href={`/c/${tenantSlug}`}
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <StoreIcon className="h-4 w-4" />
            Ver minha loja
          </Link>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <LogoutIcon className="h-4 w-4" />
            Sair
          </button>
        </div>

        <p className="mt-4 px-1 text-center text-[10px] uppercase tracking-[0.2em] text-neutral-300">
          Ziligz
        </p>
      </div>
    </aside>
  );
}

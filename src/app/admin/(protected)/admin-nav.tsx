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
  StoreIcon,
  TagIcon,
  WalletIcon,
} from "./admin-icons";

const navItems = [
  { href: "/admin", label: "Início", icon: HomeIcon },
  { href: "/admin/items", label: "Itens", icon: BoxIcon },
  { href: "/admin/categories", label: "Categorias", icon: TagIcon },
  { href: "/admin/bookings", label: "Pedidos do site", icon: CalendarIcon },
  { href: "/admin/quotes", label: "Contratos", icon: FileIcon },
  { href: "/admin/caixa", label: "Caixa", icon: WalletIcon },
  { href: "/admin/settings", label: "Configurações", icon: GearIcon },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
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
              active
                ? "bg-white text-neutral-900"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
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

  return (
    <>
      <div
        className="sticky top-0 z-30 flex w-full items-center justify-between gap-3 px-4 pb-3 text-white shadow-md lg:hidden"
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
          <p className="truncate text-sm font-bold uppercase tracking-wide">{tenant.name}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/20 active:bg-black/30"
          aria-label="Abrir menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
        <div
          className={`relative flex w-72 flex-col bg-neutral-900 p-4 text-white transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Ziliglasis
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"
              aria-label="Fechar menu"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <NavLinks onNavigate={() => setOpen(false)} />
          <div className="mt-auto space-y-1 pt-4">
            <Link
              href={`/c/${tenantSlug}`}
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
            >
              <StoreIcon className="h-4 w-4" />
              Ver minha loja
            </Link>
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogoutIcon className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/** Fixed-width sidebar column. Rendered only at the lg breakpoint and above. */
export function AdminSidebar({ tenant, tenantSlug, onLogout }: NavProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-neutral-900 p-4 text-white lg:flex">
      <div className="mb-1 flex items-center gap-2 px-1">
        {tenant.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tenant.logo_url} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
        ) : (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold"
            style={{ color: tenant.primary_color }}
          >
            {tenant.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{tenant.name}</p>
          <p className="text-xs text-white/40">Painel administrativo</p>
        </div>
      </div>

      <div className="my-4 border-t border-white/10" />

      <NavLinks />

      <div className="mt-auto space-y-1 pt-4">
        <Link
          href={`/c/${tenantSlug}`}
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          <StoreIcon className="h-4 w-4" />
          Ver minha loja
        </Link>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          <LogoutIcon className="h-4 w-4" />
          Sair
        </button>
      </div>

      <p className="mt-4 px-1 text-center text-[10px] uppercase tracking-[0.2em] text-white/20">
        Ziliglasis
      </p>
    </aside>
  );
}

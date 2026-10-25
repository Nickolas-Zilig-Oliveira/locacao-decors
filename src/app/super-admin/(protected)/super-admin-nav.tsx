"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BoxIcon, CloseIcon, LogoutIcon, MenuIcon, StoreIcon } from "@/app/admin/(protected)/admin-icons";
import { PlusIcon } from "./super-admin-icons";

const navItems = [
  { href: "/super-admin", label: "Lojas", icon: StoreIcon },
  { href: "/super-admin/new", label: "Nova loja", icon: PlusIcon },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = item.href === "/super-admin" ? pathname === item.href : pathname?.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-white text-neutral-900" : "text-white/70 hover:bg-white/10 hover:text-white"
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

type NavProps = { onLogout: () => void };

export function SuperAdminTopBar({ onLogout }: NavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <div
        className="flex w-full items-center justify-between px-4 py-3 text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, #18181b, #3f0d27)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-neutral-900">
            Z
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Ziligz</p>
            <p className="text-[10px] leading-tight text-white/50">Super admin</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/20"
          aria-label="Abrir menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative flex w-72 flex-col bg-neutral-900 p-4 text-white">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Ziligz</p>
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
            <button
              onClick={onLogout}
              className="mt-auto flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogoutIcon className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SuperAdminSidebar({ onLogout }: NavProps) {
  return (
    <aside
      className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col p-4 text-white lg:flex"
      style={{ background: "linear-gradient(180deg, #18181b, #2a0c1b 70%, #3f0d27)" }}
    >
      <div className="mb-1 flex items-center gap-2 px-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-neutral-900">
          <BoxIcon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">Ziligz</p>
          <p className="text-xs text-white/40">Super admin</p>
        </div>
      </div>

      <div className="my-4 border-t border-white/10" />

      <NavLinks />

      <button
        onClick={onLogout}
        className="mt-auto flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
      >
        <LogoutIcon className="h-4 w-4" />
        Sair
      </button>

      <p className="mt-4 px-1 text-center text-[10px] uppercase tracking-[0.2em] text-white/20">
        Painel do operador
      </p>
    </aside>
  );
}

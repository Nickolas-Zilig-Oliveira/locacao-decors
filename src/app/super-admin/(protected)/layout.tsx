import Link from "next/link";
import { redirect } from "next/navigation";
import { isPlatformAdmin } from "@/lib/data/platform";
import { superAdminLogout } from "../login/actions";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isPlatformAdmin())) {
    redirect("/super-admin/login");
  }

  return (
    <div className="min-h-screen bg-neutral-100 lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-neutral-950 p-4 text-white lg:flex">
        <p className="px-1 text-sm font-bold">Ziliglasis</p>
        <p className="px-1 text-xs text-white/40">Super admin</p>
        <div className="my-4 border-t border-white/10" />
        <nav className="space-y-1">
          <Link
            href="/super-admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
          >
            Lojas
          </Link>
          <Link
            href="/super-admin/new"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
          >
            + Nova loja
          </Link>
        </nav>
        <form action={superAdminLogout} className="mt-auto">
          <button className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
            Sair
          </button>
        </form>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between bg-neutral-950 px-4 py-3 text-white lg:hidden">
          <div>
            <p className="text-sm font-bold">Ziliglasis</p>
            <p className="text-xs text-white/40">Super admin</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/super-admin" className="text-white/70 hover:text-white">
              Lojas
            </Link>
            <Link href="/super-admin/new" className="text-white/70 hover:text-white">
              + Nova
            </Link>
            <form action={superAdminLogout}>
              <button className="text-white/70 hover:text-white">Sair</button>
            </form>
          </div>
        </div>
        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

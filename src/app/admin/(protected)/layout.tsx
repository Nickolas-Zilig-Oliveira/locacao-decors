import { redirect } from "next/navigation";
import { getCurrentTenant } from "@/lib/data/admin";
import { logout } from "../login/actions";
import { AdminSidebar, AdminTopBar } from "./admin-nav";
import { AdminThemeProvider } from "./admin-theme";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    redirect("/admin/login");
  }

  if (tenant.subscription_status !== "active") {
    const message =
      tenant.subscription_status === "pending"
        ? "Seu acesso está pendente de ativação. Fale com a Ziligz para liberar o painel."
        : "Seu acesso está suspenso. Fale com a Ziligz para reativar o painel.";

    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-center text-white">
        <div className="max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Ziligz</p>
          <h1 className="mt-2 text-lg font-bold">Painel indisponível</h1>
          <p className="mt-2 text-sm text-white/60">{message}</p>
          <form action={logout} className="mt-6">
            <button className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/10">
              Sair
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AdminThemeProvider primaryColor={tenant.primary_color}>
      <AdminSidebar tenant={tenant} tenantSlug={tenant.slug} onLogout={logout} />
      <div className="min-w-0 flex-1">
        <AdminTopBar tenant={tenant} tenantSlug={tenant.slug} onLogout={logout} />
        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </AdminThemeProvider>
  );
}

import Link from "next/link";
import { getAllTenants } from "@/lib/data/platform";
import { whatsappLink } from "@/lib/whatsapp";
import { updateTenantStatus } from "./actions";
import { PlusIcon, WhatsAppIcon } from "./super-admin-icons";

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  pending: { label: "Pendente", className: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  active: { label: "Ativo", className: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  suspended: { label: "Suspenso", className: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

export default async function SuperAdminPage() {
  const tenants = await getAllTenants();

  const counts = {
    active: tenants.filter((t) => t.subscription_status === "active").length,
    pending: tenants.filter((t) => t.subscription_status === "pending").length,
    suspended: tenants.filter((t) => t.subscription_status === "suspended").length,
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Lojas</h1>
          <p className="text-sm text-neutral-500">Todas as lojas cadastradas na plataforma.</p>
        </div>
        <Link
          href="/super-admin/new"
          className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          <PlusIcon className="h-4 w-4" />
          Nova loja
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-600">{counts.active}</p>
          <p className="text-xs text-neutral-500">Ativas</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{counts.pending}</p>
          <p className="text-xs text-neutral-500">Pendentes</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-red-600">{counts.suspended}</p>
          <p className="text-xs text-neutral-500">Suspensas</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant) => {
          const status = statusConfig[tenant.subscription_status];
          const wa = whatsappLink(
            tenant.owner_phone || tenant.phone,
            `Olá${tenant.owner_name ? `, ${tenant.owner_name}` : ""}! Aqui é da Ziliglasis.`
          );

          return (
            <div
              key={tenant.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div
                className="h-2 w-full"
                style={{ background: `linear-gradient(90deg, ${tenant.primary_color}, ${tenant.primary_color}aa)` }}
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                    style={{ backgroundColor: tenant.primary_color }}
                  >
                    {tenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-neutral-900">{tenant.name}</p>
                    <p className="truncate text-xs text-neutral-400">/c/{tenant.slug}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100"
                      aria-label="Falar no WhatsApp"
                      title={`Falar com ${tenant.owner_name || "o responsável"} no WhatsApp`}
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {tenant.owner_name && (
                  <p className="mt-3 truncate text-sm text-neutral-600">
                    <span className="text-neutral-400">Responsável: </span>
                    {tenant.owner_name}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
                  <Link
                    href={`/super-admin/tenants/${tenant.id}`}
                    className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                  >
                    Saber mais
                  </Link>
                  <Link
                    href={`/c/${tenant.slug}`}
                    target="_blank"
                    className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
                  >
                    Ver loja
                  </Link>
                  {tenant.subscription_status !== "active" && (
                    <form action={updateTenantStatus}>
                      <input type="hidden" name="tenant_id" value={tenant.id} />
                      <input type="hidden" name="status" value="active" />
                      <button className="rounded-full border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50">
                        Ativar
                      </button>
                    </form>
                  )}
                  {tenant.subscription_status !== "suspended" && (
                    <form action={updateTenantStatus}>
                      <input type="hidden" name="tenant_id" value={tenant.id} />
                      <input type="hidden" name="status" value="suspended" />
                      <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                        Suspender
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tenants.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-12 text-center">
          <p className="text-sm text-neutral-500">Nenhuma loja cadastrada ainda.</p>
        </div>
      )}
    </div>
  );
}

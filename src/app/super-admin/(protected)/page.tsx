import Link from "next/link";
import { getAllTenants, getTenantAdminEmails } from "@/lib/data/platform";
import { updateTenantStatus } from "./actions";
import { ResetPasswordButton } from "./reset-password-button";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-50 text-amber-700 border-amber-200" },
  active: { label: "Ativo", className: "bg-green-50 text-green-700 border-green-200" },
  suspended: { label: "Suspenso", className: "bg-red-50 text-red-700 border-red-200" },
};

export default async function SuperAdminPage() {
  const tenants = await getAllTenants();
  const admins = await Promise.all(tenants.map((t) => getTenantAdminEmails(t.id)));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Lojas</h1>
          <p className="text-sm text-neutral-500">Todas as lojas cadastradas na plataforma.</p>
        </div>
        <Link
          href="/super-admin/new"
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          + Nova loja
        </Link>
      </div>

      <div className="space-y-3">
        {tenants.map((tenant, i) => {
          const status = statusConfig[tenant.subscription_status];
          const tenantAdmins = admins[i];
          return (
            <div key={tenant.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-neutral-900">{tenant.name}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">/c/{tenant.slug}</p>
                  {tenantAdmins.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {tenantAdmins.map((a) => (
                        <div key={a.user_id} className="flex items-center gap-2 text-xs text-neutral-500">
                          <span>{a.email}</span>
                          <ResetPasswordButton userId={a.user_id} />
                        </div>
                      ))}
                    </div>
                  )}
                  {tenantAdmins.length === 0 && (
                    <p className="mt-2 text-xs text-neutral-400">Nenhum login de admin vinculado.</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
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
                      <button className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
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

        {tenants.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-12 text-center">
            <p className="text-sm text-neutral-500">Nenhuma loja cadastrada ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}

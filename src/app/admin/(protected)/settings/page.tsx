import { getCurrentTenant } from "@/lib/data/admin";
import { SettingsForm } from "./settings-form";
import { ChangePasswordForm } from "./change-password-form";

export default async function AdminSettingsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-neutral-900">Configurações da loja</h1>
          <p className="text-sm text-neutral-500">
            Dados exibidos na sua vitrine pública e nos contratos gerados.
          </p>
        </div>
        <SettingsForm tenant={tenant} />
      </div>

      <div className="border-t border-neutral-200 pt-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-neutral-900">Segurança</h2>
          <p className="text-sm text-neutral-500">Troque a senha de acesso ao seu painel.</p>
        </div>
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}

import { getCurrentTenant } from "@/lib/data/admin";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Configurações da loja</h1>
        <p className="text-sm text-neutral-500">
          Dados exibidos na sua vitrine pública e nos contratos gerados.
        </p>
      </div>
      <SettingsForm tenant={tenant} />
    </div>
  );
}

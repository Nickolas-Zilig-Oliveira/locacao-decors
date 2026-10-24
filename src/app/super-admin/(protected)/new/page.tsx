import { NewTenantForm } from "./new-tenant-form";

export default function NewTenantPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Nova loja</h1>
        <p className="text-sm text-neutral-500">
          Cria a loja e o login de admin dela. Você cobra por fora e ativa depois.
        </p>
      </div>
      <NewTenantForm />
    </div>
  );
}

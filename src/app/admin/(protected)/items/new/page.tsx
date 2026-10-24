import { getAdminCategories, getCurrentTenant, getKitComponentsCatalog } from "@/lib/data/admin";
import { ItemForm } from "../item-form";

export default async function NewItemPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const [categories, existingComponents] = await Promise.all([
    getAdminCategories(tenant.id),
    getKitComponentsCatalog(tenant.id),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-neutral-900">Novo item</h1>
      <ItemForm categories={categories} existingComponents={existingComponents} />
    </div>
  );
}

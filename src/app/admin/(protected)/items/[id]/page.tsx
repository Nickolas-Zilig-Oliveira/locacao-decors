import { notFound } from "next/navigation";
import {
  getAdminCategories,
  getAdminItemById,
  getCurrentTenant,
  getKitComponentsCatalog,
} from "@/lib/data/admin";
import { ItemForm } from "../item-form";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const [item, categories, existingComponents] = await Promise.all([
    getAdminItemById(tenant.id, id),
    getAdminCategories(tenant.id),
    getKitComponentsCatalog(tenant.id),
  ]);

  if (!item) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 sm:text-[28px]">Editar item</h1>
      <ItemForm item={item} categories={categories} existingComponents={existingComponents} />
    </div>
  );
}

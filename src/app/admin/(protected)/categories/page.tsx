import { getAdminCategories, getAdminItems, getCurrentTenant } from "@/lib/data/admin";
import { CategoryRow } from "./category-row";
import { NewCategoryForm } from "./new-category-form";

export default async function AdminCategoriesPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const [categories, items] = await Promise.all([
    getAdminCategories(tenant.id),
    getAdminItems(tenant.id),
  ]);

  const counts: Record<string, number> = {};
  for (const item of items) {
    if (item.category_id) counts[item.category_id] = (counts[item.category_id] ?? 0) + 1;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-[28px]">Categorias</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Na vitrine, as categorias com mais itens aparecem primeiro.
        </p>
      </div>

      <div className="mb-4">
        <NewCategoryForm />
      </div>

      {categories.length > 0 ? (
        <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {categories.map((c) => (
            <CategoryRow key={c.id} category={c} count={counts[c.id] ?? 0} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-neutral-900">Nenhuma categoria ainda</p>
          <p className="mt-1 text-sm text-neutral-500">Crie categorias como “Infantil” ou “Casamento” para organizar a vitrine.</p>
        </div>
      )}
    </div>
  );
}

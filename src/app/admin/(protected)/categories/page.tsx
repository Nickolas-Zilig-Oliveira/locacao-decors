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
        <h1 className="text-xl font-bold text-neutral-900">Categorias</h1>
        <p className="text-sm text-neutral-500">Organize os itens da sua vitrine por categoria.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <NewCategoryForm />
      </div>

      <div className="space-y-2">
        {categories.map((c) => (
          <CategoryRow key={c.id} category={c} count={counts[c.id] ?? 0} />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-12 text-center">
          <p className="text-sm text-neutral-500">Nenhuma categoria cadastrada ainda.</p>
        </div>
      )}
    </div>
  );
}

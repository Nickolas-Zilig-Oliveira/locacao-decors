import { getAdminCategories, getAdminItems, getCurrentTenant } from "@/lib/data/admin";
import { deleteCategory } from "./actions";
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
          <div
            key={c.id}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <p className="font-medium text-neutral-900">{c.name}</p>
              <p className="text-xs text-neutral-400">
                {counts[c.id] ?? 0} {counts[c.id] === 1 ? "item" : "itens"}
              </p>
            </div>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                Excluir
              </button>
            </form>
          </div>
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

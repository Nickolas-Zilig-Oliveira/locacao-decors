import Link from "next/link";
import { getAdminItems, getCurrentTenant } from "@/lib/data/admin";
import { deleteItem } from "./actions";

export default async function AdminItemsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const items = await getAdminItems(tenant.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Itens</h1>
          <p className="text-sm text-neutral-500">Catálogo da sua loja.</p>
        </div>
        <Link
          href="/admin/items/new"
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          + Novo item
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
          >
            <div className="aspect-[4/3] bg-neutral-100">
              {item.images?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.images[0]} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="p-4">
              <p className="truncate font-semibold text-neutral-900">{item.name}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <p className="text-sm text-neutral-600">R$ {item.price.toFixed(2).replace(".", ",")}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.active ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {item.active ? "ativo" : "inativo"}
                </span>
              </div>
              {item.components.length > 0 && (
                <p className="mt-1 text-xs text-neutral-400">
                  {item.components.length} sub-{item.components.length === 1 ? "item" : "itens"} no kit
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/admin/items/${item.id}`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
                >
                  Editar
                </Link>
                <form action={deleteItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-12 text-center">
          <p className="text-sm text-neutral-500">Nenhum item cadastrado ainda.</p>
        </div>
      )}
    </div>
  );
}

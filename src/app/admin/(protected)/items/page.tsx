import Link from "next/link";
import { getAdminCategories, getAdminItems, getCurrentTenant } from "@/lib/data/admin";
import { PlusIcon, TrashIcon } from "../admin-icons";
import { ConfirmSubmit } from "../confirm-submit";
import { deleteItem } from "./actions";

export default async function AdminItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo: rawTipo } = await searchParams;
  const tipo = rawTipo === "kit" || rawTipo === "avulso" ? rawTipo : undefined;

  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const [allItems, categories] = await Promise.all([
    getAdminItems(tenant.id),
    getAdminCategories(tenant.id),
  ]);
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));
  const kitCount = allItems.filter((i) => i.is_kit).length;
  const avulsoCount = allItems.length - kitCount;
  const items = allItems.filter((i) => {
    if (tipo === "kit") return i.is_kit;
    if (tipo === "avulso") return !i.is_kit;
    return true;
  });

  const tabs = [
    { href: "/admin/items", label: "Todos", count: allItems.length, active: !tipo },
    { href: "/admin/items?tipo=kit", label: "Kits", count: kitCount, active: tipo === "kit" },
    { href: "/admin/items?tipo=avulso", label: "Avulsos", count: avulsoCount, active: tipo === "avulso" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-[28px]">Itens</h1>
          <p className="mt-1 text-sm text-neutral-500">Tudo o que aparece no seu catálogo.</p>
        </div>
        <Link
          href="/admin/items/new"
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[var(--accent-strong)] pl-3.5 pr-4 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <PlusIcon className="h-4 w-4" />
          Novo item
        </Link>
      </div>

      <div className="mb-5 inline-flex rounded-full border border-neutral-200 bg-white p-1" role="tablist">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={tab.active}
            className={`flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
              tab.active ? "bg-[var(--accent-strong)] text-white" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {tab.label}
            <span className={`tabular-nums ${tab.active ? "text-white/75" : "text-neutral-400"}`}>{tab.count}</span>
          </Link>
        ))}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
          {items.map((item) => {
            const category = item.category_id ? categoryNames.get(item.category_id) ?? "Categoria removida" : null;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-colors hover:border-neutral-300"
              >
                <Link href={`/admin/items/${item.id}`} className="flex flex-1 flex-col" aria-label={`Editar ${item.name}`}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                    {item.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.images[0]}
                        alt=""
                        loading="lazy"
                        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                          item.active ? "" : "opacity-50 grayscale"
                        }`}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-400">Sem foto</div>
                    )}
                    <div className="absolute left-2 top-2 flex gap-1">
                      <span className="rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                        {item.is_kit ? "Kit" : "Avulso"}
                      </span>
                      {!item.active && (
                        <span className="rounded-full bg-black/75 px-2 py-0.5 text-[11px] font-semibold text-white">
                          Oculto
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col px-3.5 pb-3 pt-3">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">{item.name}</p>
                    <p className={`mt-0.5 truncate text-xs font-medium ${category ? "text-neutral-500" : "text-amber-600"}`}>
                      {category ?? "Sem categoria"}
                    </p>
                    <p className="mt-auto pt-2 text-sm font-bold tabular-nums text-neutral-900">
                      {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                </Link>
                <form action={deleteItem} className="absolute right-2 top-2">
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmSubmit
                    message={`Excluir "${item.name}"? Essa ação não pode ser desfeita.`}
                    aria-label={`Excluir ${item.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </ConfirmSubmit>
                </form>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
          <p className="text-sm font-semibold text-neutral-900">
            {tipo === "kit" ? "Nenhum kit ainda" : tipo === "avulso" ? "Nenhum item avulso ainda" : "Seu catálogo está vazio"}
          </p>
          <p className="mt-1 text-sm text-neutral-500">Cadastre o primeiro item com foto, preço e categoria.</p>
          <Link
            href="/admin/items/new"
            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--accent-strong)] pl-3.5 pr-4 text-sm font-semibold text-white"
          >
            <PlusIcon className="h-4 w-4" />
            Novo item
          </Link>
        </div>
      )}
    </div>
  );
}

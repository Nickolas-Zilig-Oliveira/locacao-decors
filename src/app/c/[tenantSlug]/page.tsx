import { notFound } from "next/navigation";
import { getCategories, getCategoryItemCounts, getItems, getTenantBySlug } from "@/lib/data/catalog";
import { whatsappLink } from "@/lib/whatsapp";
import { CatalogShell } from "./catalog-shell";

export default async function TenantCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const { tenantSlug } = await params;
  const { categoria, q } = await searchParams;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const [categories, items, categoryCounts] = await Promise.all([
    getCategories(tenant.id),
    getItems(tenant.id, categoria, q),
    getCategoryItemCounts(tenant.id),
  ]);

  const wa = whatsappLink(tenant.phone, `Olá! Vi a loja ${tenant.name} e quero saber mais.`);

  return (
    <CatalogShell
      tenant={tenant}
      tenantSlug={tenantSlug}
      categories={categories}
      categoryCounts={categoryCounts}
      items={items}
      categoria={categoria}
      q={q}
      waLink={wa}
    />
  );
}

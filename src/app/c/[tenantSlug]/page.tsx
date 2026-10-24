import { notFound } from "next/navigation";
import { getCategories, getCategoryItemCounts, getItems, getTenantBySlug } from "@/lib/data/catalog";
import { isCurrentUserTenantAdmin } from "@/lib/data/admin";
import { whatsappLink } from "@/lib/whatsapp";
import { CatalogShell } from "./catalog-shell";

export default async function TenantCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ categoria?: string; q?: string; tipo?: string }>;
}) {
  const { tenantSlug } = await params;
  const { categoria, q, tipo: rawTipo } = await searchParams;
  const tipo = rawTipo === "kit" || rawTipo === "avulso" ? rawTipo : undefined;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const [categories, items, categoryCounts, isAdminViewer] = await Promise.all([
    getCategories(tenant.id),
    getItems(tenant.id, categoria, q, tipo),
    getCategoryItemCounts(tenant.id),
    isCurrentUserTenantAdmin(tenant.id),
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
      tipo={tipo}
      waLink={wa}
      isAdminViewer={isAdminViewer}
    />
  );
}

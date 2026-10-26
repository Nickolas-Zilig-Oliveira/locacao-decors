import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryItemCounts, getItems, getTenantBySlug } from "@/lib/data/catalog";
import { isCurrentUserTenantAdmin } from "@/lib/data/admin";
import { whatsappLink } from "@/lib/whatsapp";
import { CatalogShell } from "./catalog-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}): Promise<Metadata> {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  return {
    title: `${tenant.name} · Catálogo`,
    description: tenant.description ?? `Catálogo de locação de decoração da ${tenant.name}.`,
    icons: tenant.logo_url ? { icon: tenant.logo_url, apple: tenant.logo_url } : undefined,
  };
}

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

  const sortedCategories = [...categories].sort(
    (a, b) => (categoryCounts.byCategory[b.id] ?? 0) - (categoryCounts.byCategory[a.id] ?? 0)
  );

  return (
    <CatalogShell
      tenant={tenant}
      tenantSlug={tenantSlug}
      categories={sortedCategories}
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

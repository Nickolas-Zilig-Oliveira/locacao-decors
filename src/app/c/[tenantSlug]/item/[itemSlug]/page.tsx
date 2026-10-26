import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlockedDates, getItemBySlug, getTenantBySlug } from "@/lib/data/catalog";
import { isCurrentUserTenantAdmin } from "@/lib/data/admin";
import { whatsappLink } from "@/lib/whatsapp";
import { ItemShell } from "./item-shell";

type Params = Promise<{ tenantSlug: string; itemSlug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tenantSlug, itemSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  const item = await getItemBySlug(tenant.id, itemSlug);
  if (!item) return { title: tenant.name };
  return {
    title: `${item.name} · ${tenant.name}`,
    description: item.description ?? undefined,
    openGraph: item.images?.[0] ? { images: [item.images[0]] } : undefined,
  };
}

export default async function ItemPage({ params }: { params: Params }) {
  const { tenantSlug, itemSlug } = await params;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const item = await getItemBySlug(tenant.id, itemSlug);
  if (!item) notFound();

  const [blockedDates, isAdminViewer] = await Promise.all([
    getBlockedDates(item.id),
    isCurrentUserTenantAdmin(tenant.id),
  ]);

  return (
    <ItemShell
      tenant={tenant}
      tenantSlug={tenantSlug}
      item={item}
      blockedDates={blockedDates.map((b) => b.date)}
      waLink={whatsappLink(tenant.phone, `Olá! Tenho interesse em "${item.name}".`)}
      isAdminViewer={isAdminViewer}
    />
  );
}

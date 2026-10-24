import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlockedDates, getItemBySlug, getTenantBySlug } from "@/lib/data/catalog";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsappButton } from "../../whatsapp-button";
import { IosBackgroundSync } from "../../ios-background-sync";
import { BookingForm } from "./booking-form";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; itemSlug: string }>;
}) {
  const { tenantSlug, itemSlug } = await params;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) notFound();

  const item = await getItemBySlug(tenant.id, itemSlug);
  if (!item) notFound();

  const blockedDates = await getBlockedDates(item.id);
  const accent = tenant.primary_color;
  const wa = whatsappLink(tenant.phone, `Olá! Tenho interesse em "${item.name}".`);

  const pageBg = `color-mix(in srgb, ${accent} 16%, #0b0b0d)`;

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: pageBg }}>
      <IosBackgroundSync color={pageBg} />
      <header
        className="px-4 pb-3 shadow-lg sm:px-6 lg:px-8"
        style={{ backgroundColor: accent, paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <h1 className="truncate text-lg font-bold uppercase tracking-wide">{tenant.name}</h1>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-6 lg:px-8">
        <Link href={`/c/${tenantSlug}`} className="text-sm text-white/60 hover:underline">
          ← Voltar
        </Link>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-xl bg-white/10">
            {item.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-white/30">
                sem foto
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="mt-1 text-lg font-bold" style={{ color: accent }}>
              R$ {item.price.toFixed(2).replace(".", ",")}
            </p>
            {item.piece_count && (
              <p className="text-sm text-white/50">{item.piece_count} peças no kit</p>
            )}
            {item.description && <p className="mt-3 whitespace-pre-line text-white/70">{item.description}</p>}
          </div>
        </div>

        {item.components.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 font-semibold">Itens inclusos no Kit</h3>
            <div className="space-y-2">
              {item.components.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/10">
                    {c.photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.photo_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-white/50">Quantidade: {c.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <BookingForm
          tenantId={tenant.id}
          itemId={item.id}
          blockedDates={blockedDates.map((b) => b.date)}
          accent={accent}
        />
      </main>

      <WhatsappButton href={wa} />
    </div>
  );
}

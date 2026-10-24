import { getAdminItems, getCurrentTenant } from "@/lib/data/admin";
import { QuoteBuilder } from "./quote-builder";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ customer_name?: string; customer_phone?: string; item_id?: string }>;
}) {
  const tenant = await getCurrentTenant();
  if (!tenant) return null;

  const { customer_name, customer_phone, item_id } = await searchParams;
  const items = await getAdminItems(tenant.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Novo contrato</h1>
          <p className="text-sm text-neutral-500">
            Monte o contrato escolhendo o cliente, os itens e os valores.
          </p>
        </div>
      </div>
      <QuoteBuilder
        catalogItems={items.filter((i) => i.active)}
        prefillCustomerName={customer_name}
        prefillCustomerPhone={customer_phone}
        prefillItemId={item_id}
      />
    </div>
  );
}

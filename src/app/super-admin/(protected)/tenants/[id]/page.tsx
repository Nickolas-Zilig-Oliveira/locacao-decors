import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BoxIcon,
  CalendarIcon,
  FileIcon,
  GearIcon,
  WalletIcon,
} from "@/app/admin/(protected)/admin-icons";
import { getTenantAdminEmails, getTenantById, getTenantStats } from "@/lib/data/platform";
import { updateTenantStatus } from "../../actions";

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  pending: { label: "Pendente", className: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  active: { label: "Ativo", className: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  suspended: { label: "Suspenso", className: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

function money(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tenant = await getTenantById(id);
  if (!tenant) notFound();

  const [admins, stats] = await Promise.all([getTenantAdminEmails(id), getTenantStats(id)]);
  const status = statusConfig[tenant.subscription_status];

  return (
    <div>
      <Link href="/super-admin" className="mb-4 inline-block text-sm text-neutral-500 hover:underline">
        ← Voltar para lojas
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{ backgroundColor: tenant.primary_color }}
          >
            {tenant.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{tenant.name}</h1>
            <p className="text-sm text-neutral-400">/c/{tenant.slug}</p>
            <span
              className={`mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/c/${tenant.slug}`}
            target="_blank"
            className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
          >
            Ver loja
          </Link>
          {tenant.subscription_status !== "active" && (
            <form action={updateTenantStatus}>
              <input type="hidden" name="tenant_id" value={tenant.id} />
              <input type="hidden" name="status" value="active" />
              <button className="rounded-full border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50">
                Ativar
              </button>
            </form>
          )}
          {tenant.subscription_status !== "suspended" && (
            <form action={updateTenantStatus}>
              <input type="hidden" name="tenant_id" value={tenant.id} />
              <input type="hidden" name="status" value="suspended" />
              <button className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                Suspender
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={BoxIcon} label="Itens" value={stats?.item_count ?? 0} />
        <StatCard icon={GearIcon} label="Categorias" value={stats?.category_count ?? 0} />
        <StatCard icon={FileIcon} label="Contratos" value={stats?.quote_count ?? 0} />
        <StatCard icon={CalendarIcon} label="Pedidos do site" value={stats?.booking_count ?? 0} />
        <StatCard icon={WalletIcon} label="Total recebido" value={money(stats?.total_received ?? 0)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Registered data */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-neutral-900">Dados cadastrados</p>
          <dl className="space-y-3 text-sm">
            <Field label="E-mail de contato" value={tenant.email} />
            <Field label="Telefone" value={tenant.phone} />
            <Field label="Cidade" value={tenant.city} />
            <Field label="Endereço" value={tenant.address} />
            <Field label="CNPJ" value={tenant.cnpj} />
            <Field label="Descrição" value={tenant.description} />
            <Field label="Observações de retirada" value={tenant.pickup_notes} />
            <div>
              <dt className="text-xs font-medium text-neutral-400">Cor principal</dt>
              <dd className="mt-1 flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border border-neutral-200"
                  style={{ backgroundColor: tenant.primary_color }}
                />
                <span className="text-neutral-700">{tenant.primary_color}</span>
              </dd>
            </div>
            <Field
              label="Cadastrada em"
              value={new Date(tenant.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            />
          </dl>
        </section>

        {/* Admin logins (read-only) */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="mb-1 text-sm font-semibold text-neutral-900">Login do painel</p>
          <p className="mb-4 text-xs text-neutral-400">
            A senha é de responsabilidade da própria loja — aqui você só vê qual e-mail está vinculado.
          </p>
          {admins.length === 0 && (
            <p className="rounded-lg bg-neutral-50 px-3 py-3 text-center text-xs text-neutral-400">
              Nenhum login de admin vinculado.
            </p>
          )}
          <div className="space-y-2">
            {admins.map((a) => (
              <div
                key={a.user_id}
                className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
              >
                {a.email}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-neutral-400">{label}</dt>
      <dd className={value ? "text-neutral-700" : "text-neutral-300"}>{value || "Não informado"}</dd>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <Icon className="mb-2 h-4 w-4 text-neutral-400" />
      <p className="text-lg font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

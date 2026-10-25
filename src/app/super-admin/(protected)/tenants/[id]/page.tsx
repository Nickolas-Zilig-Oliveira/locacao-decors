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
import { whatsappLink } from "@/lib/whatsapp";
import { updateTenantStatus } from "../../actions";
import { MailIcon, MapPinIcon, PhoneIcon, UserIcon, WhatsAppIcon } from "../../super-admin-icons";

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
  const wa = whatsappLink(
    tenant.owner_phone || tenant.phone,
    `Olá${tenant.owner_name ? `, ${tenant.owner_name}` : ""}! Aqui é da Ziligz.`
  );

  return (
    <div>
      <Link href="/super-admin" className="mb-4 inline-block text-sm text-neutral-500 hover:underline">
        ← Voltar para lojas
      </Link>

      {/* Header */}
      <div
        className="mb-6 overflow-hidden rounded-3xl text-white shadow-sm"
        style={{ background: `linear-gradient(135deg, ${tenant.primary_color}, #18181b 120%)` }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{tenant.name}</h1>
              <p className="text-sm text-white/70">/c/{tenant.slug}</p>
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
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-white/25"
            >
              Ver loja
            </Link>
            {tenant.subscription_status !== "active" && (
              <form action={updateTenantStatus}>
                <input type="hidden" name="tenant_id" value={tenant.id} />
                <input type="hidden" name="status" value="active" />
                <button className="rounded-full bg-green-500/90 px-3 py-1.5 text-xs font-semibold hover:bg-green-500">
                  Ativar
                </button>
              </form>
            )}
            {tenant.subscription_status !== "suspended" && (
              <form action={updateTenantStatus}>
                <input type="hidden" name="tenant_id" value={tenant.id} />
                <input type="hidden" name="status" value="suspended" />
                <button className="rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-semibold hover:bg-red-500">
                  Suspender
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Owner / contact card */}
      <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold text-neutral-900">Responsável pela loja</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{tenant.owner_name || "Não informado"}</p>
              <p className="text-sm text-neutral-500">{tenant.owner_phone || tenant.phone || "Sem telefone cadastrado"}</p>
            </div>
          </div>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Chamar no WhatsApp
            </a>
          ) : (
            <span className="text-xs text-neutral-400">Sem WhatsApp cadastrado</span>
          )}
        </div>
      </section>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={BoxIcon} label="Itens" value={stats?.item_count ?? 0} color="#2563eb" />
        <StatCard icon={GearIcon} label="Categorias" value={stats?.category_count ?? 0} color="#7c3aed" />
        <StatCard icon={FileIcon} label="Contratos" value={stats?.quote_count ?? 0} color="#0891b2" />
        <StatCard icon={CalendarIcon} label="Pedidos do site" value={stats?.booking_count ?? 0} color="#d97706" />
        <StatCard icon={WalletIcon} label="Total recebido" value={money(stats?.total_received ?? 0)} color="#16a34a" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Registered data */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-neutral-900">Dados cadastrados</p>
          <dl className="space-y-4 text-sm">
            <IconField icon={MailIcon} label="E-mail de contato" value={tenant.email} />
            <IconField icon={PhoneIcon} label="Telefone da loja" value={tenant.phone} />
            <IconField icon={MapPinIcon} label="Endereço" value={[tenant.address, tenant.city].filter(Boolean).join(" — ") || null} />
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
                className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
              >
                <MailIcon className="h-4 w-4 shrink-0 text-neutral-400" />
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

function IconField({
  icon: Icon,
  label,
  value,
}: {
  icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-300" />
      <div>
        <dt className="text-xs font-medium text-neutral-400">{label}</dt>
        <dd className={value ? "text-neutral-700" : "text-neutral-300"}>{value || "Não informado"}</dd>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div
        className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-lg font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

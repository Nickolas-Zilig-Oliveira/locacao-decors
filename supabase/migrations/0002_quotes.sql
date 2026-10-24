-- Tenant business details needed on the printed contract header.
alter table tenants add column cnpj text;
alter table tenants add column email text;
alter table tenants add column address text;
-- Fixed pickup/return instructions shown under the contract clauses
-- (e.g. "Retirada às sextas-feiras das 10h às 17h").
alter table tenants add column pickup_notes text;

-- Manually built rental contracts, created by the tenant admin from the
-- "Novo contrato" screen. Items are a flexible JSON array (not tied 1:1 to
-- the catalog) so the locador can add, remove, re-price or discount freely.
create table quotes (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity,
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_name text not null,
  customer_phone text,
  customer_cpf text,
  rental_start timestamptz,
  rental_end timestamptz,
  theme text,
  -- [{ name, quantity, unit_price, catalog_item_id? }]
  items jsonb not null default '[]'::jsonb,
  items_note text,
  discount numeric(10,2) not null default 0,
  paid_amount numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index quotes_tenant_id_idx on quotes(tenant_id);

alter table quotes enable row level security;

create policy "tenant admins manage their quotes" on quotes
  for all using (
    exists (
      select 1 from tenant_users tu
      where tu.tenant_id = quotes.tenant_id and tu.user_id = auth.uid()
    )
  );

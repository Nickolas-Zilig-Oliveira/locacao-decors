-- Multi-tenant rental catalog & booking schema

create extension if not exists "pgcrypto";

-- One row per rental business (tenant). Public storefront lives at /c/{slug}.
create table tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  city text,
  phone text,
  logo_url text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Links a Supabase auth user to the tenant(s) they can administer.
create table tenant_users (
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  primary key (tenant_id, user_id)
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  price numeric(10,2) not null default 0,
  piece_count int,
  images jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

-- A date an item is unavailable, either because it was manually blocked
-- by the tenant admin or because a booking occupies that date.
create table blocked_dates (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  date date not null,
  reason text not null default 'manual' check (reason in ('manual', 'booking')),
  booking_id uuid,
  created_at timestamptz not null default now(),
  unique (item_id, date)
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  event_date date not null,
  customer_name text not null,
  customer_phone text not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table blocked_dates
  add constraint blocked_dates_booking_id_fkey
  foreign key (booking_id) references bookings(id) on delete cascade;

create index items_tenant_id_idx on items(tenant_id);
create index categories_tenant_id_idx on categories(tenant_id);
create index blocked_dates_item_id_idx on blocked_dates(item_id);
create index bookings_tenant_id_idx on bookings(tenant_id);
create index bookings_item_id_idx on bookings(item_id);

-- Reject a booking (or un-cancelling one) for a date that is already
-- blocked by another booking or a manual block, before it is written.
create or replace function check_booking_date_available()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('pending', 'confirmed') then
    if exists (
      select 1 from blocked_dates bd
      where bd.item_id = new.item_id
        and bd.date = new.event_date
        and bd.booking_id is distinct from new.id
    ) then
      raise exception 'Date % is not available for this item', new.event_date;
    end if;
  end if;
  return new;
end;
$$;

create trigger bookings_check_date_available
before insert or update on bookings
for each row execute function check_booking_date_available();

-- Keep blocked_dates in sync with booking status after the write succeeds.
create or replace function sync_booking_blocked_date()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT') then
    if new.status in ('pending', 'confirmed') then
      insert into blocked_dates (item_id, date, reason, booking_id)
      values (new.item_id, new.event_date, 'booking', new.id);
    end if;
  elsif (tg_op = 'UPDATE') then
    if new.status = 'cancelled' and old.status <> 'cancelled' then
      delete from blocked_dates where booking_id = new.id;
    elsif new.status in ('pending', 'confirmed') and old.status = 'cancelled' then
      insert into blocked_dates (item_id, date, reason, booking_id)
      values (new.item_id, new.event_date, 'booking', new.id);
    end if;
  elsif (tg_op = 'DELETE') then
    delete from blocked_dates where booking_id = old.id;
  end if;
  return null;
end;
$$;

create trigger bookings_sync_blocked_date
after insert or update or delete on bookings
for each row execute function sync_booking_blocked_date();

-- Row Level Security --------------------------------------------------

alter table tenants enable row level security;
alter table tenant_users enable row level security;
alter table categories enable row level security;
alter table items enable row level security;
alter table blocked_dates enable row level security;
alter table bookings enable row level security;

-- Public storefront can read active tenants/categories/items and the
-- blocked dates needed to render availability.
create policy "public read active tenants" on tenants
  for select using (active = true);

create policy "public read categories of active tenants" on categories
  for select using (
    exists (select 1 from tenants t where t.id = categories.tenant_id and t.active)
  );

create policy "public read active items" on items
  for select using (
    active = true
    and exists (select 1 from tenants t where t.id = items.tenant_id and t.active)
  );

create policy "public read blocked dates" on blocked_dates
  for select using (
    exists (select 1 from items i where i.id = blocked_dates.item_id)
  );

-- Anyone can create a booking (the public booking form); only tenant
-- admins can read/update/cancel bookings for their own tenant.
create policy "public can create bookings" on bookings
  for insert with check (true);

create policy "tenant admins manage their bookings" on bookings
  for all using (
    exists (
      select 1 from tenant_users tu
      where tu.tenant_id = bookings.tenant_id and tu.user_id = auth.uid()
    )
  );

-- Tenant admins manage their own tenant row, categories and items.
create policy "tenant admins read own tenant" on tenants
  for select using (
    exists (select 1 from tenant_users tu where tu.tenant_id = tenants.id and tu.user_id = auth.uid())
  );

create policy "tenant admins update own tenant" on tenants
  for update using (
    exists (select 1 from tenant_users tu where tu.tenant_id = tenants.id and tu.user_id = auth.uid())
  );

create policy "tenant admins manage categories" on categories
  for all using (
    exists (select 1 from tenant_users tu where tu.tenant_id = categories.tenant_id and tu.user_id = auth.uid())
  );

create policy "tenant admins manage items" on items
  for all using (
    exists (select 1 from tenant_users tu where tu.tenant_id = items.tenant_id and tu.user_id = auth.uid())
  );

create policy "tenant admins manage blocked dates" on blocked_dates
  for all using (
    exists (
      select 1 from items i
      join tenant_users tu on tu.tenant_id = i.tenant_id
      where i.id = blocked_dates.item_id and tu.user_id = auth.uid()
    )
  );

create policy "tenant admins see their membership" on tenant_users
  for select using (user_id = auth.uid());

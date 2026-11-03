-- Multi-tenant schema. Every business = one row in tenants. Every data table carries tenant_id + RLS.
create extension if not exists "pgcrypto";

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'starter',
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text not null default 'incomplete',
  monthly_message_limit int not null default 1000,
  created_at timestamptz default now()
);

create table memberships (
  tenant_id uuid references tenants on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null default 'owner',
  primary key (tenant_id, user_id)
);

create function my_tenants() returns setof uuid language sql stable security definer as
$$ select tenant_id from memberships where user_id = auth.uid() $$;

create table assistants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants on delete cascade,
  public_key text unique not null default encode(gen_random_bytes(16),'hex'),
  name text not null default 'Assistant',
  system_prompt text not null default '',
  welcome_message text default 'Hi! How can I help?',
  allowed_origins text[] default '{}',
  config jsonb default '{}'
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants on delete cascade,
  name text, email text, phone text,
  created_at timestamptz default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants on delete cascade,
  assistant_id uuid references assistants on delete cascade,
  customer_id uuid references customers,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants on delete cascade,
  conversation_id uuid not null references conversations on delete cascade,
  role text not null check (role in ('user','assistant','tool')),
  content text,
  tokens_in int default 0, tokens_out int default 0,
  created_at timestamptz default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants on delete cascade,
  customer_id uuid references customers,
  starts_at timestamptz not null,
  ends_at timestamptz,
  reason text,
  status text default 'booked',
  external_event_id text
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants on delete cascade,
  title text, storage_path text, content text,
  created_at timestamptz default now()
);

create table integrations (
  tenant_id uuid references tenants on delete cascade,
  provider text,
  credentials jsonb, -- encrypt refresh tokens before storing
  primary key (tenant_id, provider)
);

create table usage_events (
  id bigserial primary key,
  tenant_id uuid not null references tenants on delete cascade,
  kind text default 'message',
  tokens_in int default 0, tokens_out int default 0,
  created_at timestamptz default now()
);
create index on usage_events (tenant_id, created_at);
create index on messages (tenant_id, conversation_id);

-- RLS: users only see rows of tenants they belong to. The widget API uses the service role (server only).
do $$
declare t text;
begin
  foreach t in array array['assistants','customers','conversations','messages','appointments','documents','integrations','usage_events']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy tenant_isolation on %I for all using (tenant_id in (select my_tenants())) with check (tenant_id in (select my_tenants()))', t);
  end loop;
end $$;

alter table tenants enable row level security;
create policy own_tenant_read on tenants for select using (id in (select my_tenants()));
alter table memberships enable row level security;
create policy own_membership on memberships for select using (user_id = auth.uid());
-- tenants/memberships are written only by the Stripe webhook (service role).
-- GDPR: deleting a tenant cascades to all its data. Add a scheduled job to purge old messages per retention policy.

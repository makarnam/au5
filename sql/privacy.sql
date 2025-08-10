-- Privacy module schema and seed data
-- Run this in your Supabase project's SQL editor or via psql

-- DPIA table
create table if not exists public.privacy_dpia (
  id uuid primary key default uuid_generate_v4(),
  title varchar not null check (char_length(trim(title)) > 0),
  description text,
  owner varchar,
  owner_id uuid references public.users(id),
  status varchar not null default 'draft' check (status in ('draft','in_review','approved','rejected')),
  risk_level varchar not null default 'medium' check (risk_level in ('low','medium','high','critical')),
  created_by uuid references public.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RoPA table
create table if not exists public.privacy_ropa (
  id uuid primary key default uuid_generate_v4(),
  name varchar not null check (char_length(trim(name)) > 0),
  purpose text not null,
  controller varchar not null,
  processor varchar,
  data_subjects text[] not null default array[]::text[],
  data_categories text[] not null default array[]::text[],
  recipients text[] not null default array[]::text[],
  transfers text[] not null default array[]::text[],
  retention text,
  legal_basis text,
  created_by uuid references public.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Simple updated_at triggers (optional but useful)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_privacy_dpia on public.privacy_dpia;
create trigger set_updated_at_privacy_dpia
before update on public.privacy_dpia
for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at_privacy_ropa on public.privacy_ropa;
create trigger set_updated_at_privacy_ropa
before update on public.privacy_ropa
for each row execute procedure public.set_updated_at();

-- Seed data
insert into public.privacy_dpia (title, description, owner, status, risk_level)
values
  ('Customer Analytics Platform', 'Processing behavioral data for analytics and personalization', 'Privacy Office', 'in_review', 'high'),
  ('Employee Monitoring', 'Endpoint telemetry collection for security operations', 'CISO', 'draft', 'medium'),
  ('Marketing CRM Migration', 'Data transfer to new marketing platform', 'Marketing', 'approved', 'low')
  on conflict do nothing;

insert into public.privacy_ropa (
  name, purpose, controller, processor, data_subjects, data_categories, recipients, transfers, retention, legal_basis
) values
  (
    'Customer Relationship Management',
    'Manage customer interactions, support and marketing',
    'ACME Corp',
    'SalesCloud Inc.',
    array['Customers','Leads'],
    array['Identification','Contact','Usage'],
    array['Marketing Partners'],
    array['US'],
    '36 months from last interaction',
    'Legitimate interests'
  ),
  (
    'HR Payroll',
    'Process payroll and statutory reporting',
    'ACME Corp',
    null,
    array['Employees'],
    array['Identification','Financial'],
    array['Tax Authority'],
    array[]::text[],
    '7 years post-employment',
    'Legal obligation'
  )
  on conflict do nothing;

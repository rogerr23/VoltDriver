create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_not_blank
    check (display_name is null or btrim(display_name) <> ''),
  constraint profiles_timezone_not_blank
    check (btrim(timezone) <> '')
);

create table public.vehicles (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name_model text not null,
  range_km numeric(10, 2) not null,
  consumption_kwh_per_100km numeric(10, 4) not null,
  residential_rate_per_kwh numeric(10, 4) not null,
  public_rate_per_kwh numeric(10, 4) not null,
  reference_gasoline_price_per_liter numeric(10, 4) not null,
  reference_fuel_efficiency_km_per_liter numeric(10, 4) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicles_id_user_id_unique unique (id, user_id),
  constraint vehicles_name_model_not_blank check (btrim(name_model) <> ''),
  constraint vehicles_range_positive check (range_km > 0),
  constraint vehicles_consumption_positive check (consumption_kwh_per_100km > 0),
  constraint vehicles_residential_rate_nonnegative check (residential_rate_per_kwh >= 0),
  constraint vehicles_public_rate_nonnegative check (public_rate_per_kwh >= 0),
  constraint vehicles_gasoline_price_nonnegative check (reference_gasoline_price_per_liter >= 0),
  constraint vehicles_fuel_efficiency_positive check (reference_fuel_efficiency_km_per_liter > 0)
);

create unique index vehicles_one_active_per_user_idx
  on public.vehicles (user_id)
  where is_active;

create table public.work_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vehicle_id uuid not null,
  work_date date not null,
  platform text not null,
  distance_km numeric(10, 2) not null,
  online_minutes integer not null,
  gross_earnings numeric(12, 2) not null,
  tips numeric(12, 2) not null default 0,
  vehicle_consumption_snapshot numeric(10, 4) not null,
  energy_rate_snapshot numeric(10, 4) not null,
  gasoline_price_snapshot numeric(10, 4) not null,
  reference_fuel_efficiency_snapshot numeric(10, 4) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_sessions_vehicle_owner_fk
    foreign key (vehicle_id, user_id)
    references public.vehicles (id, user_id)
    on delete restrict,
  constraint work_sessions_platform_valid
    check (platform in ('uber', '99', 'indrive', 'other')),
  constraint work_sessions_distance_positive check (distance_km > 0),
  constraint work_sessions_online_minutes_positive check (online_minutes > 0),
  constraint work_sessions_gross_earnings_nonnegative check (gross_earnings >= 0),
  constraint work_sessions_tips_nonnegative check (tips >= 0),
  constraint work_sessions_consumption_positive check (vehicle_consumption_snapshot > 0),
  constraint work_sessions_energy_rate_nonnegative check (energy_rate_snapshot >= 0),
  constraint work_sessions_gasoline_price_nonnegative check (gasoline_price_snapshot >= 0),
  constraint work_sessions_fuel_efficiency_positive check (reference_fuel_efficiency_snapshot > 0)
);

create index work_sessions_user_date_idx
  on public.work_sessions (user_id, work_date desc);

create index work_sessions_vehicle_idx
  on public.work_sessions (vehicle_id);

create table public.charging_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  vehicle_id uuid not null,
  charged_at date not null,
  location_name text not null,
  charge_type text not null,
  energy_kwh numeric(10, 3) not null,
  total_cost numeric(12, 2) not null,
  residential_rate_snapshot numeric(10, 4) not null,
  vehicle_consumption_snapshot numeric(10, 4) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint charging_sessions_vehicle_owner_fk
    foreign key (vehicle_id, user_id)
    references public.vehicles (id, user_id)
    on delete restrict,
  constraint charging_sessions_location_not_blank check (btrim(location_name) <> ''),
  constraint charging_sessions_type_valid
    check (charge_type in ('residential_ac', 'public_ac', 'public_dc', 'other')),
  constraint charging_sessions_energy_positive check (energy_kwh > 0),
  constraint charging_sessions_total_cost_nonnegative check (total_cost >= 0),
  constraint charging_sessions_residential_rate_nonnegative check (residential_rate_snapshot >= 0),
  constraint charging_sessions_consumption_positive check (vehicle_consumption_snapshot > 0)
);

create index charging_sessions_user_date_idx
  on public.charging_sessions (user_id, charged_at desc);

create index charging_sessions_vehicle_idx
  on public.charging_sessions (vehicle_id);

create table public.monthly_goals (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null,
  revenue_target numeric(12, 2) not null default 0,
  distance_target_km numeric(10, 2) not null default 0,
  savings_target numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_goals_user_month_unique unique (user_id, month),
  constraint monthly_goals_month_first_day
    check (month = date_trunc('month', month)::date),
  constraint monthly_goals_revenue_nonnegative check (revenue_target >= 0),
  constraint monthly_goals_distance_nonnegative check (distance_target_km >= 0),
  constraint monthly_goals_savings_nonnegative check (savings_target >= 0),
  constraint monthly_goals_has_target
    check (revenue_target > 0 or distance_target_km > 0 or savings_target > 0)
);

create index monthly_goals_user_idx on public.monthly_goals (user_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

create trigger work_sessions_set_updated_at
before update on public.work_sessions
for each row execute function public.set_updated_at();

create trigger charging_sessions_set_updated_at
before update on public.charging_sessions
for each row execute function public.set_updated_at();

create trigger monthly_goals_set_updated_at
before update on public.monthly_goals
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.work_sessions enable row level security;
alter table public.charging_sessions enable row level security;
alter table public.monthly_goals enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.vehicles from anon, authenticated;
revoke all on table public.work_sessions from anon, authenticated;
revoke all on table public.charging_sessions from anon, authenticated;
revoke all on table public.monthly_goals from anon, authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.vehicles to authenticated;
grant select, insert, update, delete on table public.work_sessions to authenticated;
grant select, insert, update, delete on table public.charging_sessions to authenticated;
grant select, insert, update, delete on table public.monthly_goals to authenticated;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "vehicles_select_own"
on public.vehicles for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "vehicles_insert_own"
on public.vehicles for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "vehicles_update_own"
on public.vehicles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "vehicles_delete_own"
on public.vehicles for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "work_sessions_select_own"
on public.work_sessions for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "work_sessions_insert_own"
on public.work_sessions for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "work_sessions_update_own"
on public.work_sessions for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "work_sessions_delete_own"
on public.work_sessions for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "charging_sessions_select_own"
on public.charging_sessions for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "charging_sessions_insert_own"
on public.charging_sessions for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "charging_sessions_update_own"
on public.charging_sessions for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "charging_sessions_delete_own"
on public.charging_sessions for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "monthly_goals_select_own"
on public.monthly_goals for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "monthly_goals_insert_own"
on public.monthly_goals for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "monthly_goals_update_own"
on public.monthly_goals for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "monthly_goals_delete_own"
on public.monthly_goals for delete
to authenticated
using ((select auth.uid()) = user_id);

-- NyumbaGO: Supabase Auth profiles for real accounts.
-- Apply this migration in the Supabase SQL editor before enabling production sign-in.
-- The trigger never accepts an admin role from user metadata.

create or replace function public.handle_new_nyumbago_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'requested_role', 'hunter');
  if requested_role not in ('hunter', 'landlord', 'agent') then
    requested_role := 'hunter';
  end if;

  insert into public.profiles (
    id, email, phone, full_name, role, age_verified, age_verified_at,
    status, verification_badge, two_factor_enabled, failed_login_attempts,
    created_at, updated_at
  )
  values (
    new.id::text,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    requested_role,
    coalesce((new.raw_user_meta_data ->> 'age_verified')::boolean, false),
    nullif(new.raw_user_meta_data ->> 'age_verified_at', '')::timestamptz,
    'active',
    'none',
    false,
    0,
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = excluded.phone,
    full_name = excluded.full_name,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_nyumbago on auth.users;
create trigger on_auth_user_created_nyumbago
  after insert on auth.users
  for each row execute procedure public.handle_new_nyumbago_user();

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Public can read landlord and agent verification status" on public.profiles;
drop policy if exists "NyumbaGO users read own profile" on public.profiles;
create policy "NyumbaGO users read own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid())::text);

-- No client UPDATE policy is created: role, status and verification are not user-editable.
grant select on public.profiles to authenticated;

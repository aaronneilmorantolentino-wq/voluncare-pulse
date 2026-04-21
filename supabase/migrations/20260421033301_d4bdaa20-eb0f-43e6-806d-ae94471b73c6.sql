
-- =========================
-- ENUMS
-- =========================
create type public.app_role as enum ('voluntario', 'coordinador', 'admin');
create type public.rol_asignado as enum ('campo', 'soporte_telefonico', 'logistica');
create type public.emocion_plutchik as enum (
  'alegria','confianza','miedo','sorpresa','tristeza','disgusto','enojo','anticipacion'
);
create type public.tipo_intervencion as enum (
  'mindfulness','tcc','linea_crisis','reestructuracion_cognitiva'
);

-- =========================
-- PROFILES
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_completo text not null,
  email text not null,
  rol_asignado public.rol_asignado,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- =========================
-- USER ROLES (separada por seguridad)
-- =========================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Función security definer (evita recursión RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- =========================
-- CHECK-INS EMOCIONALES
-- =========================
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  voluntario_id uuid not null references public.profiles(id) on delete cascade,
  fecha_hora timestamptz not null default now(),
  nivel_energia smallint not null check (nivel_energia between 1 and 5),
  nivel_animo smallint not null check (nivel_animo between 1 and 5),
  emocion_principal public.emocion_plutchik not null,
  caja_catarsis text,
  bandera_riesgo boolean generated always as ((nivel_energia + nivel_animo) < 4) stored,
  created_at timestamptz not null default now()
);

create index idx_check_ins_voluntario_fecha
  on public.check_ins (voluntario_id, fecha_hora desc);

alter table public.check_ins enable row level security;

-- =========================
-- RECURSOS DE APOYO
-- =========================
create table public.recursos_apoyo (
  id uuid primary key default gen_random_uuid(),
  nombre_recurso text not null,
  tipo_intervencion public.tipo_intervencion not null,
  url_contenido text not null,
  umbral_recomendado smallint check (umbral_recomendado between 1 and 5),
  created_at timestamptz not null default now()
);

alter table public.recursos_apoyo enable row level security;

-- =========================
-- TRIGGER: updated_at en profiles
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================
-- TRIGGER: auto-crear perfil + rol voluntario al registrarse
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre_completo, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre_completo', new.email),
    new.email
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'voluntario');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================
-- POLICIES: profiles
-- =========================
create policy "Voluntario ve su propio perfil"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Coordinador y admin ven todos los perfiles"
  on public.profiles for select
  to authenticated
  using (public.has_role(auth.uid(), 'coordinador') or public.has_role(auth.uid(), 'admin'));

create policy "Voluntario actualiza su propio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Admin actualiza cualquier perfil"
  on public.profiles for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- =========================
-- POLICIES: user_roles
-- =========================
create policy "Usuario ve sus propios roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admin ve todos los roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Solo admin gestiona roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================
-- POLICIES: check_ins
-- =========================
create policy "Voluntario ve sus check-ins"
  on public.check_ins for select
  to authenticated
  using (voluntario_id = auth.uid());

create policy "Coordinador y admin ven todos los check-ins"
  on public.check_ins for select
  to authenticated
  using (public.has_role(auth.uid(), 'coordinador') or public.has_role(auth.uid(), 'admin'));

create policy "Voluntario crea sus check-ins"
  on public.check_ins for insert
  to authenticated
  with check (voluntario_id = auth.uid());

create policy "Voluntario actualiza sus check-ins"
  on public.check_ins for update
  to authenticated
  using (voluntario_id = auth.uid());

create policy "Voluntario borra sus check-ins"
  on public.check_ins for delete
  to authenticated
  using (voluntario_id = auth.uid());

-- =========================
-- POLICIES: recursos_apoyo
-- =========================
create policy "Cualquier autenticado ve recursos"
  on public.recursos_apoyo for select
  to authenticated
  using (true);

create policy "Solo admin gestiona recursos"
  on public.recursos_apoyo for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

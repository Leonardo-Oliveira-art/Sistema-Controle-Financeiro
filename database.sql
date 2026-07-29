-- =====================================================================
-- CONTROLE FINANCEIRO PESSOAL — ESTRUTURA DO BANCO (Supabase / Postgres)
-- Cole tudo no SQL Editor do Supabase e execute uma única vez.
-- =====================================================================

-- ---------- TIPOS ----------
do $$ begin create type public.tipo_categoria as enum ('receita','despesa'); exception when duplicate_object then null; end $$;
do $$ begin create type public.tipo_despesa   as enum ('fixa','variavel','parcelada'); exception when duplicate_object then null; end $$;
do $$ begin create type public.situacao_conta as enum ('pendente','pago','vencido'); exception when duplicate_object then null; end $$;
do $$ begin create type public.prioridade_conta as enum ('baixa','media','alta'); exception when duplicate_object then null; end $$;

-- ---------- FUNÇÃO DE updated_at ----------
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- PERFIS ----------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null default '',
  email text,
  avatar_url text,
  moeda text not null default 'BRL',
  idioma text not null default 'pt-BR',
  tema text not null default 'light',
  notificacoes boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_own" on public.profiles for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- ---------- CATEGORIAS ----------
create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  tipo public.tipo_categoria not null default 'despesa',
  cor text not null default '#22c55e',
  icone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.categorias to authenticated;
grant all on public.categorias to service_role;
alter table public.categorias enable row level security;
create policy "categorias_own" on public.categorias for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger categorias_updated before update on public.categorias
  for each row execute function public.update_updated_at_column();

-- ---------- RECEITAS ----------
create table if not exists public.receitas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  categoria_id uuid references public.categorias(id) on delete set null,
  titulo text not null,
  valor numeric not null default 0,
  data date not null default current_date,
  descricao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.receitas to authenticated;
grant all on public.receitas to service_role;
alter table public.receitas enable row level security;
create policy "receitas_own" on public.receitas for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger receitas_updated before update on public.receitas
  for each row execute function public.update_updated_at_column();

-- ---------- DESPESAS ----------
create table if not exists public.despesas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  categoria_id uuid references public.categorias(id) on delete set null,
  titulo text not null,
  valor numeric not null default 0,
  data date not null default current_date,
  descricao text,
  tipo public.tipo_despesa not null default 'variavel',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.despesas to authenticated;
grant all on public.despesas to service_role;
alter table public.despesas enable row level security;
create policy "despesas_own" on public.despesas for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger despesas_updated before update on public.despesas
  for each row execute function public.update_updated_at_column();

-- ---------- CONTAS A PAGAR ----------
create table if not exists public.contas_pagar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  categoria_id uuid references public.categorias(id) on delete set null,
  nome text not null,
  valor numeric not null default 0,
  fornecedor text,
  descricao text,
  vencimento date not null default current_date,
  prioridade public.prioridade_conta not null default 'media',
  situacao public.situacao_conta not null default 'pendente',
  parcelada boolean not null default false,
  numero_parcelas integer not null default 1,
  observacoes text,
  pago_em date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.contas_pagar to authenticated;
grant all on public.contas_pagar to service_role;
alter table public.contas_pagar enable row level security;
create policy "contas_own" on public.contas_pagar for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger contas_updated before update on public.contas_pagar
  for each row execute function public.update_updated_at_column();

-- ---------- METAS ----------
create table if not exists public.metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  valor_desejado numeric not null default 0,
  valor_atual numeric not null default 0,
  data_prevista date,
  descricao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.metas to authenticated;
grant all on public.metas to service_role;
alter table public.metas enable row level security;
create policy "metas_own" on public.metas for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger metas_updated before update on public.metas
  for each row execute function public.update_updated_at_column();

-- ---------- PLANEJAMENTOS (orçamento mensal) ----------
create table if not exists public.planejamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  categoria_id uuid references public.categorias(id) on delete cascade,
  mes integer not null,
  ano integer not null,
  limite numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.planejamentos to authenticated;
grant all on public.planejamentos to service_role;
alter table public.planejamentos enable row level security;
create policy "planejamentos_own" on public.planejamentos for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger planejamentos_updated before update on public.planejamentos
  for each row execute function public.update_updated_at_column();

-- ---------- NOTIFICAÇÕES ----------
create table if not exists public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  mensagem text,
  tipo text not null default 'info',
  lida boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.notificacoes to authenticated;
grant all on public.notificacoes to service_role;
alter table public.notificacoes enable row level security;
create policy "notificacoes_own" on public.notificacoes for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- PERFIL + CATEGORIAS PADRÃO AO CRIAR USUÁRIO ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', ''), new.email);

  insert into public.categorias (user_id, nome, tipo, cor) values
    (new.id, 'Salário', 'receita', '#22c55e'),
    (new.id, 'Freelance', 'receita', '#2563eb'),
    (new.id, 'Investimentos', 'receita', '#0ea5e9'),
    (new.id, 'Moradia', 'despesa', '#ef4444'),
    (new.id, 'Alimentação', 'despesa', '#f59e0b'),
    (new.id, 'Transporte', 'despesa', '#8b5cf6'),
    (new.id, 'Saúde', 'despesa', '#ec4899'),
    (new.id, 'Lazer', 'despesa', '#14b8a6');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

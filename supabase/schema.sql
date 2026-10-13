-- Moriá Hamburgueria — schema do Supabase
-- Cole este arquivo inteiro no SQL Editor do Supabase e execute (é idempotente).

create extension if not exists "pgcrypto";

-- ───────── Cardápio ─────────
create table if not exists public.menu_items (
  id          uuid primary key default gen_random_uuid(),
  categoria   text not null check (categoria in
              ('Hambúrgueres','Baguetes','Acompanhamentos','Molhos','Bebidas','Combos')),
  nome        text not null check (char_length(nome) between 1 and 120),
  descricao   text not null default '',
  preco       numeric(10,2) not null check (preco >= 0),
  imagem      text not null default '',
  destaque    boolean not null default false,
  disponivel  boolean not null default true,
  adicionais  jsonb not null default '[]'::jsonb,   -- [{ "nome": "Bacon", "preco": 5 }]
  ordem       integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists menu_items_ordem_idx on public.menu_items (ordem);

-- ───────── Configurações da loja (linha única, id = 1) ─────────
create table if not exists public.store_settings (
  id           integer primary key check (id = 1),
  whatsapp     text not null,                 -- 55DDDNÚMERO
  hours        jsonb not null,                -- 7 posições (0 = domingo): {"open":"18:00","close":"23:00"} ou null
  delivery_fee jsonb not null,                -- {"mode":"fixed","amount":5} ou {"mode":"tbd"}
  notice       text not null default '',
  updated_at   timestamptz not null default now()
);

-- EDITAR: valores iniciais (também editáveis depois em /admin)
insert into public.store_settings (id, whatsapp, hours, delivery_fee, notice)
values (
  1,
  '5567998022571',
  '[{"open":"18:00","close":"23:00"},null,{"open":"18:00","close":"23:00"},{"open":"18:00","close":"23:00"},{"open":"18:00","close":"23:00"},{"open":"18:00","close":"00:00"},{"open":"18:00","close":"00:00"}]'::jsonb,
  '{"mode":"fixed","amount":5}'::jsonb,
  ''
)
on conflict (id) do nothing;

-- ───────── RLS: leitura pública, escrita só autenticado ─────────
alter table public.menu_items     enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "menu: leitura publica"   on public.menu_items;
drop policy if exists "menu: escrita autenticado" on public.menu_items;
create policy "menu: leitura publica"
  on public.menu_items for select to anon, authenticated using (true);
create policy "menu: escrita autenticado"
  on public.menu_items for all to authenticated using (true) with check (true);

drop policy if exists "settings: leitura publica"    on public.store_settings;
drop policy if exists "settings: escrita autenticado" on public.store_settings;
create policy "settings: leitura publica"
  on public.store_settings for select to anon, authenticated using (true);
create policy "settings: escrita autenticado"
  on public.store_settings for all to authenticated using (true) with check (true);

-- ───────── Storage: bucket público para fotos do cardápio ─────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-images', 'menu-images', true, 3145728, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

drop policy if exists "fotos: leitura publica"     on storage.objects;
drop policy if exists "fotos: upload autenticado"  on storage.objects;
drop policy if exists "fotos: editar autenticado"  on storage.objects;
drop policy if exists "fotos: excluir autenticado" on storage.objects;
create policy "fotos: leitura publica"
  on storage.objects for select to anon, authenticated using (bucket_id = 'menu-images');
create policy "fotos: upload autenticado"
  on storage.objects for insert to authenticated with check (bucket_id = 'menu-images');
create policy "fotos: editar autenticado"
  on storage.objects for update to authenticated using (bucket_id = 'menu-images');
create policy "fotos: excluir autenticado"
  on storage.objects for delete to authenticated using (bucket_id = 'menu-images');

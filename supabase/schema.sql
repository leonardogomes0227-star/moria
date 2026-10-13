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
  paused       boolean not null default false,   -- pausa os pedidos pelo site
  pause_message text not null default 'Estamos com a cozinha lotada no momento. Tente novamente em alguns minutos.',
  payments     jsonb not null default '["Pix","Cartão","Dinheiro"]'::jsonb,
  min_order    numeric(10,2) not null default 0,
  updated_at   timestamptz not null default now()
);

-- Para quem já tinha rodado a versão anterior deste arquivo:
alter table public.store_settings add column if not exists paused boolean not null default false;
alter table public.store_settings add column if not exists pause_message text not null default 'Estamos com a cozinha lotada no momento. Tente novamente em alguns minutos.';
alter table public.store_settings add column if not exists payments jsonb not null default '["Pix","Cartão","Dinheiro"]'::jsonb;
alter table public.store_settings add column if not exists min_order numeric(10,2) not null default 0;

-- ───────── Pedidos (registrados pelo site ao finalizar; gerenciados no painel) ─────────
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  numero           bigint generated always as identity,
  criado_em        timestamptz not null default now(),
  status           text not null default 'novo'
                   check (status in ('novo','preparo','entrega','concluido','cancelado')),
  tipo             text not null check (tipo in ('entrega','retirada')),
  cliente_nome     text not null check (char_length(cliente_nome) between 1 and 120),
  cliente_telefone text not null default '' check (char_length(cliente_telefone) <= 40),
  endereco         text not null default '' check (char_length(endereco) <= 300),
  pagamento        text not null check (pagamento in ('Pix','Cartão','Dinheiro')),
  troco            text not null default '' check (char_length(troco) <= 40),
  obs              text not null default '' check (char_length(obs) <= 300),
  itens            jsonb not null,            -- [{nome, qtd, preco, adicionais[], obs}]
  subtotal         numeric(10,2) not null check (subtotal >= 0),
  entrega          numeric(10,2),             -- null = taxa a combinar
  total            numeric(10,2) not null check (total >= 0)
);
create index if not exists orders_criado_em_idx on public.orders (criado_em desc);

-- ───────── Depoimentos e galeria (editáveis no painel) ─────────
create table if not exists public.reviews (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  texto     text not null,
  nota      integer not null default 5 check (nota between 1 and 5),
  origem    text not null default 'Instagram',
  criado_em timestamptz not null default now()
);

create table if not exists public.gallery_photos (
  id        uuid primary key default gen_random_uuid(),
  src       text not null,
  alt       text not null default '',
  criado_em timestamptz not null default now()
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
alter table public.orders         enable row level security;
alter table public.reviews        enable row level security;
alter table public.gallery_photos enable row level security;

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

-- Pedidos: o público (site) só consegue CRIAR pedido novo; ler/alterar/excluir é só do painel.
drop policy if exists "orders: site cria pedido"      on public.orders;
drop policy if exists "orders: painel gerencia"       on public.orders;
create policy "orders: site cria pedido"
  on public.orders for insert to anon, authenticated with check (status = 'novo');
create policy "orders: painel gerencia"
  on public.orders for all to authenticated using (true) with check (true);

drop policy if exists "reviews: leitura publica"     on public.reviews;
drop policy if exists "reviews: escrita autenticado" on public.reviews;
create policy "reviews: leitura publica"
  on public.reviews for select to anon, authenticated using (true);
create policy "reviews: escrita autenticado"
  on public.reviews for all to authenticated using (true) with check (true);

drop policy if exists "galeria: leitura publica"     on public.gallery_photos;
drop policy if exists "galeria: escrita autenticado" on public.gallery_photos;
create policy "galeria: leitura publica"
  on public.gallery_photos for select to anon, authenticated using (true);
create policy "galeria: escrita autenticado"
  on public.gallery_photos for all to authenticated using (true) with check (true);

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

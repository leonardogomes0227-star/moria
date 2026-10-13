# Moriá Hamburgueria

Site/cardápio digital da **Moriá Hamburgueria** (Rio Verde de Mato Grosso – MS), com pedido direto pelo WhatsApp.
Instagram: [@moria_hamburgueria](https://instagram.com/moria_hamburgueria)

**Stack:** Vite · React 18 · TypeScript (strict) · Tailwind v3 · Framer Motion · Lenis · Three.js (`@react-three/fiber`) · Zustand · React Router · Supabase (opcional).

## Começando

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build de produção em dist/
npm run preview    # serve o build localmente
npm run lint       # ESLint
npm run format     # Prettier
```

Requer Node 20+. Sem nenhuma configuração extra o site funciona por inteiro usando `src/data/menu.ts`.

## Onde editar cada coisa

| O quê                                                                                                                       | Onde                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Nome, slogan, **WhatsApp**, Instagram, **endereço**, link/mapa do Google Maps, **horários**, **taxa de entrega**, mensagens | `src/lib/config.ts` (tudo marcado com `EDITAR` é placeholder)                                                   |
| Cardápio (fallback / seed)                                                                                                  | `src/data/menu.ts`                                                                                              |
| Depoimentos                                                                                                                 | `src/data/reviews.ts`                                                                                           |
| Galeria "Direto da chapa"                                                                                                   | `src/data/gallery.ts` (fotos em `public/gallery/`)                                                              |
| Cores, raios, sombras, espaçamentos                                                                                         | `tailwind.config.ts`                                                                                            |
| SEO (título, descrição, Open Graph, JSON-LD, manifest, robots, sitemap)                                                     | gerados a partir de `config.ts` por `vite-plugin-seo.ts` — ajuste `siteUrl` em `config.ts` para o domínio final |

> O WhatsApp usa o formato `55` + DDD + número (ex.: `5567999999999`).

### Logo

O logo real da Moriá está em `src/assets/logo.png` (o componente `<Logo />` o usa em todo o site; sem esse arquivo ele cai no SVG placeholder). Ícones e favicon: `public/favicon.png`, `public/icon-192.png`, `public/icon-512.png`; imagem de compartilhamento: `public/og.png` (1200×630).

### Fotos e imagens

- **Hero:** `public/hero/burger.webp` (+ `burger-640.webp` para celular). Caminhos e dimensões em `config.hero`. É um recorte da publicação do Instagram, de baixa resolução: troque pela foto original em alta (fundo escuro funciona melhor, a imagem já tem as bordas esmaecidas em transparência).
- **Itens do cardápio:** todos têm imagem. Os hambúrgueres de carne usam recortes da foto do Instagram (`public/menu/burger-*.webp`) e os demais itens usam **ilustrações de estúdio** em SVG (`public/menu/*.svg`), geradas por `node scripts/gen-products.mjs`. Para usar foto real, coloque o arquivo em `public/menu/` e aponte `imagem` em `src/data/menu.ts`, ou envie pelo painel em _Cardápio → Editar → Foto_. Proporção 4:3 (ex.: 1280×960), até 3 MB.
- **Galeria:** `public/gallery/` + `src/data/gallery.ts` (ou pelo painel, em _Conteúdo do site_). Hoje tem a arte do post e recortes da foto de exemplo.

### Hambúrguer 3D (opcional)

O hero mostra a foto real por padrão. Para usar a cena Three.js, defina `hero.mode: '3d'` em `config.ts`: ela exibe um hambúrguer procedural ou, se existir **`public/models/burger.glb`**, o seu modelo (cada filho direto da cena do `.glb` vira uma camada na "explosão" por scroll). A cena só carrega após a primeira interação (ou ~4 s), pausa fora da viewport, limita o DPR a 1.5 e cai para um SVG em dispositivos fracos, com economia de dados, sem WebGL ou com `prefers-reduced-motion`.

## Painel administrativo (`/admin`)

Telas do painel (todas com textos explicativos em português):

| Tela                 | Para quê                                                                                                                                                                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Início**           | Resumo do dia: pedidos, faturamento, ticket médio, vendas dos últimos 7 dias, mais vendidos e o botão **Receber pedidos pelo site** (pausa rápida).                                                                                          |
| **Pedidos**          | Lista os pedidos feitos pelo site. Fluxo: _Novo → Em preparo → Saiu para entrega / Pronto para retirada → Concluído_ (ou Cancelado). Atualiza sozinha a cada 15 s, avisa com bipe, **imprime comanda** (80 mm) e abre o WhatsApp do cliente. |
| **Cardápio**         | Criar, editar, duplicar, excluir, ordenar, ativar/desativar disponibilidade, marcar “mais pedido”, trocar categoria, adicionais e foto.                                                                                                      |
| **Loja**             | Pausar pedidos, aviso de topo, horários, WhatsApp, taxa de entrega, pedido mínimo e formas de pagamento aceitas.                                                                                                                             |
| **Conteúdo do site** | Depoimentos e fotos da galeria.                                                                                                                                                                                                              |
| **Ajuda**            | Passo a passo do dia a dia e perguntas frequentes.                                                                                                                                                                                           |

### Modo demonstração (sem configurar nada)

Sem as variáveis do Supabase, o painel funciona em **modo demonstração**: tudo é salvo no `localStorage` do navegador, com pedidos de exemplo para o dashboard não nascer vazio. Login: **`demo@moria.com`** / **`moria123`** (definido em `config.demo`), escrito em destaque na própria tela de login. No site de demonstração há o botão **“Ver painel do dono”**, que explica o painel e mostra esses dados; no primeiro acesso, o botão **“O que é cada botão?”** abre um guia com a explicação de cada área, e cada botão importante tem um balão explicativo ao passar o mouse. Faça um pedido no site e ele aparece em _Pedidos_; mude um preço e o site muda. “Ajuda → Restaurar dados de demonstração” volta ao início. Os dados **não** vão para outros aparelhos: para produção, use o Supabase abaixo.

## Supabase (produção) — opcional

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No **SQL Editor**, cole e execute `supabase/schema.sql` (pode rodar de novo sem problemas). Ele cria as tabelas `menu_items`, `store_settings`, `orders`, `reviews` e `gallery_photos`, as policies RLS e o bucket público `menu-images`.
   - Cardápio, depoimentos e galeria: leitura pública, escrita só autenticado.
   - Pedidos: o **site só consegue criar** um pedido novo; ler, alterar e excluir é só do painel.
3. Em **Authentication → Users → Add user**, crie o usuário do dono (e-mail e senha). Em **Authentication → Sign In / Providers**, **desative "Allow new users to sign up"**: qualquer usuário autenticado acessa o painel.
4. Em **Project Settings → API**, copie a _Project URL_ e a chave _anon public_.
5. Copie `.env.example` para `.env` e preencha:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
6. Rode `npm run dev`, abra `/admin`, entre e use os botões **“Importar …”** (cardápio, depoimentos, galeria) se quiser partir dos exemplos.

Se o Supabase falhar ou não responder, o site continua com `src/data/*` e `config.ts` — e o pedido segue pelo WhatsApp mesmo que o registro no painel falhe.

## Deploy na Vercel

1. Suba o repositório no GitHub e importe em [vercel.com/new](https://vercel.com/new) (preset _Vite_; build `npm run build`, saída `dist`).
2. Em **Settings → Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (se usar Supabase).
3. `vercel.json` já faz o rewrite de SPA (rotas como `/admin` funcionam ao recarregar).
4. Ajuste `siteUrl` em `src/lib/config.ts` para o domínio final (canonical, Open Graph, sitemap, JSON-LD).

## Estrutura

```
src/
  components/   peças reutilizáveis (Header, Logo, Dialog, CartDrawer, MenuCard…)
    three/      cena 3D (carregada sob demanda)
  sections/     seções da home (Hero, Menu, Hours, Reviews, Gallery, Location, Footer…)
  pages/        Home (+ chunks Sections/Overlays) e Admin (lazy)
  admin/        telas do painel
  data/         menu, reviews, gallery (seeds)
  store/        Zustand: carrinho (persistido) e configurações da loja
  lib/          config central, tipos, formatação, horários, pedido/WhatsApp, Supabase
  hooks/        useMenu, useLenis, useCanRender3D, useInView…
supabase/schema.sql
```

## Qualidade

- Lighthouse mobile (build de produção, emulação padrão, rede/CPU simuladas): Performance ≈ 86–87, Acessibilidade 100, Boas práticas 100, SEO 100, CLS 0.
- Responsivo de 320 a 1920 px (sem rolagem horizontal), foco visível, navegação por teclado, `prefers-reduced-motion` respeitado.
- O status "Aberto agora / Fechado" é calculado no fuso `America/Campo_Grande`, inclusive para expedientes que viram a madrugada.

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

### Trocar o logo

Salve o arquivo como **`src/assets/logo.png`**. O componente `<Logo />` o detecta e passa a usá-lo no lugar do SVG placeholder. Para o favicon/ícones, substitua `public/favicon.svg`, `public/icon-192.png`, `public/icon-512.png` e `public/og.png` (1200×630).

### Trocar as fotos

- **Itens do cardápio:** coloque as imagens em `public/menu/` e use `/menu/arquivo.jpg` em `imagem` (ou envie pelo painel `/admin`, que usa o Supabase Storage). Prefira proporção 4:3 (ex.: 1280×960) em WebP/AVIF/JPG otimizado.
- **Galeria:** troque os itens de `src/data/gallery.ts`.
- Os SVGs de `public/placeholders/` são gerados por `node scripts/gen-placeholders.mjs` e podem ser apagados quando houver fotos reais.

### Hambúrguer 3D

O hero usa um hambúrguer procedural (primitivas do Three.js). Para usar um modelo seu, coloque **`public/models/burger.glb`**: ele é detectado automaticamente. Cada filho direto da cena do `.glb` vira uma "camada" (ordenada de baixo para cima) na animação de explosão por scroll.
A cena 3D só carrega após a primeira interação (ou ~4 s), pausa fora da viewport, limita o DPR a 1.5 e cai para um SVG estático em dispositivos fracos, com economia de dados, sem WebGL ou com `prefers-reduced-motion`.

## Supabase (cardápio editável + painel `/admin`) — opcional

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No **SQL Editor**, cole e execute `supabase/schema.sql`. Ele cria as tabelas `menu_items` e `store_settings`, as policies RLS (leitura pública, escrita só para usuário autenticado) e o bucket público `menu-images` com suas policies.
3. Em **Authentication → Users → Add user**, crie o usuário do dono (e-mail e senha). Em **Authentication → Sign In / Providers**, **desative "Allow new users to sign up"**, pois qualquer usuário autenticado pode editar o cardápio.
4. Em **Project Settings → API**, copie a _Project URL_ e a chave _anon public_.
5. Copie `.env.example` para `.env` e preencha:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
6. Rode `npm run dev`, abra `/admin`, entre e use **"Importar cardápio de exemplo"** se quiser partir do seed.

No painel é possível: criar/editar/excluir itens, ativar/desativar disponibilidade, marcar "Mais pedido", reordenar (setas), trocar categoria, enviar foto e editar horários, WhatsApp, taxa de entrega e o aviso de topo.
Se as variáveis não existirem — ou se a rede/Supabase falhar —, o site continua com `src/data/menu.ts` e `config.ts`.

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

- Lighthouse mobile (build de produção, emulação padrão): Performance ≈ 92, Acessibilidade 100, Boas práticas 100, SEO 100.
- Responsivo de 320 a 1920 px (sem rolagem horizontal), foco visível, navegação por teclado, `prefers-reduced-motion` respeitado.
- O status "Aberto agora / Fechado" é calculado no fuso `America/Campo_Grande`, inclusive para expedientes que viram a madrugada.

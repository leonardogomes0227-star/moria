# Plano de amanhã — apresentar a Moriá ao dono

> Documento de organização. Tudo o que o código já faz está em `docs/ASSISTENTE-WHATSAPP.md`; o roteiro de testes em `docs/ROTEIRO-TESTE-BOT.md`; o envio ao dono em `docs/ENVIAR-PARA-O-DONO.md`.

## 1. Onde estamos (verdade, sem enfeite)

| Parte | Estado |
|---|---|
| Site com cardápio real (31 itens), carrinho e pedido por WhatsApp | ✅ pronto e testado |
| Painel do dono: pedidos, cardápio, custos, fichas, equipe, motoboy, estoque | ✅ pronto e testado (dados de exemplo no navegador) |
| `/demo`, `/teste`, `/robo` e botão "Testar o robô" | ✅ pronto e testado |
| Robô de demonstração (roteiro, sem IA) | ✅ responde pedido, cardápio, recomendação, horário, endereço, kids, picante… |
| Robô com IA (Claude) | 🟡 código e testes com IA simulada prontos; **nunca respondeu de verdade** (falta a chave) |
| Áudio, foto, avisos de status, comandos do dono, resumo diário, sugestão por margem | 🟡 prontos e testados com simulações; **nunca testados com a Meta** |
| Supabase | ⬜ projeto ainda não criado (SQL pronto e validado) |
| Fotos reais dos hambúrgueres, horários, taxa e endereço reais | ⬜ faltam (hoje são exemplo) |

## 2. Checklist da manhã (nesta ordem)

**A. Obrigatório (uns 20 min)**
1. Vercel: confirme que o deploy mais recente da branch `claude/vigilant-feynman-81vtew` terminou.
2. Abra o site e recarregue uma vez (limpa o cardápio antigo guardado no navegador).
3. `npm run check:deploy -- https://moria-livid.vercel.app` → tudo ✅ (⚠️ de IA e `/api/whatsapp` é normal).
4. Faça o roteiro no seu celular: `/demo` → site → painel → robô (peça cardápio, recomendação, "X-Bacon e uma Coca", confirme; veja o pedido no painel).
5. Confirme com o dono: WhatsApp que recebe os pedidos de teste, horários e taxa de entrega. Me passe que eu troco em `src/lib/config.ts`.
6. Mande a mensagem de `docs/ENVIAR-PARA-O-DONO.md` com o link `/demo`.

**B. Opcional, mas melhora muito (10 min): IA de verdade no chat**
Vercel → Environment Variables: `ANTHROPIC_API_KEY` + `DEMO_PUBLIC=1` → Redeploy → `check:deploy` (linha "Robô com IA" ✅) → converse 5 min → ao terminar com o dono, tire `DEMO_PUBLIC`. Defina antes um limite de gasto (US$ 5) no console da Anthropic.

**C. Só se for mostrar dados reais: Supabase**
1. supabase.com → New project (região São Paulo).
2. SQL Editor → cole o `supabase/schema.sql` inteiro → Run (pode repetir).
3. Authentication → Users → Add user (e-mail e senha do dono, "Auto confirm").
4. Project Settings → API: copie URL e chave `anon`.
5. Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (+ `VITE_DEMO=1` para manter os atalhos de teste) → Redeploy.
6. Painel → Cardápio → "Importar cardápio de exemplo" (carrega o cardápio real da Moriá).
Obs.: com Supabase o site começa com o cardápio vazio até a importação.

## 3. O que falar para atrair o dono na ferramenta do WhatsApp
- **Dor que ele já tem:** pagar app todo mês e ainda perder pedido de madrugada ou no pico.
- **Argumento de mercado:** grandes redes já vendem por WhatsApp para depender menos do iFood (Burger King e Habib's; fontes na seção 7). Pedido pelo WhatsApp não tem comissão de marketplace.
- **O que mostrar, nesta ordem (3 minutos):** pedir "X-Bacon e uma Coca" → recomendação → "tem opção vegetariana?" (responde com honestidade) → pedir um atendente → painel mostrando o pedido com a etiqueta WhatsApp → tela Custos (lucro do mês) → tela Assistente (resultados e comandos do dono).
- **Frase de fechamento:** "o robô atende de madrugada, anota certo e você ainda vê quanto sobra de cada lanche".

## 4. Ideias para melhorar a ferramenta (backlog, por impacto)

| # | Ideia | Já existe? | Esforço | Observação |
|---|---|---|---|---|
| 1 | Robô **manda a foto** do lanche quando recomenda (a API do WhatsApp aceita imagem por link) | ❌ | baixo | Muito visual no celular do dono. Precisa de fotos boas. |
| 2 | **Pix copia e cola**: chave Pix nas "Regras da casa" e robô envia ao confirmar | 🟡 (via regras da casa, texto livre) | baixo | Confirmar o pagamento automático exige integração com banco: não prometer. |
| 3 | **Avaliação pós-entrega** (pede nota e vira depoimento no site) | ❌ | médio | Só dentro da janela de 24 h, senão precisa de modelo aprovado. |
| 4 | **Desconto/benefício para quem pede pelo WhatsApp** (ex.: bebida grátis) | ❌ | baixo | É decisão do dono; combina com o argumento "sem comissão". Entra nas Regras da casa. |
| 5 | **Taxa de entrega por bairro** | ❌ | médio | Precisa da tabela de bairros do dono. |
| 6 | **Adicionais** (bacon extra, queijo extra) | ❌ | baixo | O cardápio recebido não tinha adicionais; perguntar se ele cobra. |
| 7 | **Agendar pedido** quando a loja está fechada | ❌ | médio | O robô já avisa que só começa a preparar quando abrir. |
| 8 | **Reativar clientes sumidos** (promo no WhatsApp) | ❌ | médio | Mensagem de marketing é a mais cara, exige modelo aprovado e aceite do cliente. Deixar para depois. |
| 9 | Recuperar pedido abandonado do site | ❌ | alto | Não achei referência de mercado; evitar prometer. |

Já pronto e que vale destacar: áudio, foto de comprovante, memória do cliente ("o mesmo de sempre?"), aviso de status, resumo diário, comandos do dono (`resumo`, `acabou bacon`, `fecha a loja`), limite de gasto, sugestão pela margem.

## 5. Perguntas para fazer ao dono
1. Quantos pedidos por dia, em média? E quanto fatura por mês?
2. Quanto paga hoje no Instadelivery e no outro app (valor da fatura)?
3. Horários reais por dia, taxa de entrega (fixa ou por bairro?) e pedido mínimo.
4. Endereço, link do Google Maps e Instagram.
5. Chave Pix da loja e formas de pagamento aceitas.
6. Cobra adicionais (bacon, queijo, ovo)? Quanto? Tem combos?
7. Quem atende o WhatsApp hoje? Qual número seria do robô (não pode estar ativo no WhatsApp comum)?
8. Quais lanches mais vendem (para eu marcar os destaques de verdade)?
9. Manda 6 a 8 fotos boas dos lanches.
10. Usa cupom, pagamento online ou impressora automática nos apps hoje?

## 6. Dinheiro (resumo da conversa)
- **Proposta:** R$ 2.500 (site + painel completo) e + R$ 1.000 (robô de WhatsApp). Pacote completo sugerido R$ 3.300 a R$ 3.500. 50% de entrada.
- **Custos recorrentes ficam no nome do cliente:** domínio (~R$ 40/ano), Supabase/Vercel (gratuitos no começo), IA (teto mensal no painel, padrão R$ 100), tarifa da Meta.
- **⚠️ Tarifa da Meta: confirme na página oficial antes de falar número ao dono.** O que achei hoje não bate entre si (blogs de fornecedores): uns dizem que a conversa iniciada pelo cliente é grátis e utilidade custa centavos; outros falam em mudanças de cobrança em agosto/outubro de 2026. Não prometa "custo zero" do WhatsApp.
- **Suporte:** 30 dias grátis; depois só por chamado.
- **PDF da proposta:** já foi enviado no chat. A pasta `proposta/` **não** vai para o repositório (tem preço) e some quando este ambiente é encerrado: **baixe o PDF** e guarde no seu computador.

## 7. Fontes consultadas (hoje)
- Exemplos de delivery por WhatsApp: [Tecnoblog — Burger King](https://tecnoblog.net/noticias/para-depender-menos-do-ifood-burger-king-lanca-delivery-via-whatsapp/), [Olhar Digital — Habib's](https://olhardigital.com.br/noticia/habib-s-lanca-servico-de-delivery-via-whatsapp/81277).
- Fluxos de agente para restaurante: [Hora de Codar](https://horadecodar.com.br/agente-restaurantes-whatsapp-n8n/).
- Tarifas da Meta (blogs de fornecedores, valores divergentes): [Eazybe](https://eazybe.com/br/blog/preco-api-whatsapp-business), [Hyperleap](https://hyperleap.ai/whatsapp-pricing-calculator-brazil), [TI Inside](https://tiinside.com.br/13/07/2026/custos-para-conversas-no-whatsapp-business-podem-chegar-a-us-500/), [Whapi](https://whapi.cloud/blog/pt/metas-october-2026-pricing-shock). Valor definitivo: página oficial de preços da Meta.
- Preços do Instadelivery: [Ticket](https://www.ticket.com.br/?p=5300), [BaresSP](https://www.baressp.com.br/fornecedores/fornecedores/instadelivery).

## 8. Onde está cada coisa
- **Código e docs:** branch `claude/vigilant-feynman-81vtew` (tudo enviado).
- **Dados da loja (placeholders "EDITAR"):** `src/lib/config.ts`.
- **Cardápio real:** `src/data/menu.ts` · **Custos de exemplo:** `src/data/financeSeed.ts`.
- **SQL do banco:** `supabase/schema.sql`.
- **Conferir o deploy:** `npm run check:deploy -- <url>` · **Testes:** `npm test`.
- **Versão dos dados de exemplo do navegador:** `DEMO_DATA_VERSION` em `src/lib/data/localRepo.ts` (não mudar depois de mandar o link).

# Mandar a demonstração para o dono (sem precisar mexer depois)

A demonstração funciona sozinha: o site, o painel e o chat do robô rodam no navegador dele, com dados de exemplo. Nada depende de você estar online.

## 1. Antes de mandar (uma vez só)
1. Publique na Vercel (importe o repositório; branch `claude/vigilant-feynman-81vtew` ou a principal).
2. Rode a conferência com o link publicado:
   ```
   npm run check:deploy -- https://SEU-SITE.vercel.app
   ```
   Todas as linhas ✅ = pronto. Os ⚠️ sobre `/api/whatsapp` e "Robô com IA desligado" são normais na demonstração.
3. Abra `/demo` no seu celular e faça o roteiro de 5 minutos uma vez.
4. Confirme com o dono os dados da loja (hoje são exemplo, em `src/lib/config.ts`): WhatsApp para onde vai o pedido de teste, horários e taxa de entrega. O endereço fica só com a cidade até você ter o real.

## 2. Opcional: IA de verdade no chat
**Sem gastar nada:** use uma IA de plano gratuito — veja `docs/IA-GRATIS.md` (variáveis `FREE_LLM_KEY`, `FREE_LLM_URL`, `FREE_LLM_MODEL` e `DEMO_PUBLIC=1`).

Com o Claude:
Na Vercel (Settings → Environment Variables): `ANTHROPIC_API_KEY` e `DEMO_PUBLIC` = `1`, e `VITE_DEMO` = `1` se ligar o Supabase. Faça Redeploy e rode a conferência de novo: a linha "Robô com IA" deve ficar ✅.
- Defina antes um **limite de gasto** no console da Anthropic (US$ 5 sobra).
- Se a IA falhar, der limite ou demorar mais de 25 s, o chat **continua no roteiro sozinho**. O dono não vê erro.
- Depois que ele testar, tire o `DEMO_PUBLIC` para o link não gastar sua chave.

## 3. Mensagem para mandar (copie e cole)
> Fala! Montei uma demonstração de como vai ficar o sistema da Moriá. Abre aqui: **https://SEU-SITE.vercel.app/demo**
>
> Tem 3 partes: o **site** que o cliente vê, o **painel** que você controla (a senha de teste já aparece na tela) e o **robô de atendimento** que anota pedido sozinho (é só tocar em "Testar o robô").
>
> Pode mexer à vontade, é tudo de teste e nada vai para cliente de verdade. Se quiser recomeçar, tem o botão "Restaurar dados de teste" na mesma página. Me conta o que achou! 🔥

## 4. O que ele vai ver (e o que perguntar depois)
- Os dados (pedidos, custos, depoimentos) são de exemplo e ficam só no navegador dele. Se trocar de aparelho, recomeça do zero.
- Ao finalizar um pedido no site, abre o WhatsApp com a mensagem pronta, para o número configurado em `config.whatsapp`. Ele não precisa enviar.
- Depoimentos "Cliente Exemplo" e fotos repetidas dos hambúrgueres são de exemplo: peça as fotos reais.
- Áudio, foto, avisos de status e resumo diário só funcionam no número real, depois da instalação.

## 5. Dados de exemplo antigos no navegador
A demonstração salva os dados de exemplo no navegador de quem abre. Quando você muda os dados de exemplo (cardápio, fichas, pedidos), aumente `DEMO_DATA_VERSION` em `src/lib/data/localRepo.ts`: na próxima visita o navegador descarta o exemplo antigo sozinho. **Não mude depois de mandar o link ao dono**, senão ele perde o que mexeu.

## 6. Se algo der errado
| Sintoma | O que fazer |
|---|---|
| Link não abre | Rode a conferência: ela diz qual página falhou. Costuma ser deploy não terminado. |
| Robô responde "Fala! Aqui é o Mori…" para tudo | É o roteiro: ele entende pedido, cardápio, horário, pagamento e atendente. Frases muito fora disso caem numa resposta genérica. Com a IA ligada isso melhora. |
| Dono diz que "perdeu" os dados | Limpou o navegador ou trocou de aparelho. Use "Restaurar dados de teste". |
| Aparece cardápio antigo | Seu navegador guardou o exemplo velho. Recarregue a página depois do novo deploy (a versão dos dados faz a limpeza), ou use "Restaurar dados de teste" em `/demo`. |
| Gasto da IA subiu | Tire `DEMO_PUBLIC` na Vercel e confira o limite no console da Anthropic. |

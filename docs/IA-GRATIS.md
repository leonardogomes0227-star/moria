# Robô com IA de graça (só para a demonstração)

O chat `/robo` pode usar uma IA de **plano gratuito** no lugar do Claude. Serve para o dono ver um robô que conversa de verdade, sem você gastar nada. Na instalação para valer, use o Claude (melhor em pedidos e em seguir as regras).

## Como ligar (uns 10 minutos, sem cartão)
Escolha **um** serviço. Crie a conta, gere a chave de API e, na Vercel, em Settings → Environment Variables, adicione:

| Variável | Valor |
|---|---|
| `FREE_LLM_KEY` | a chave que você gerou |
| `FREE_LLM_URL` | endereço da API (veja abaixo) |
| `FREE_LLM_MODEL` | nome do modelo (veja abaixo) |
| `DEMO_PUBLIC` | `1` |

Depois, **Redeploy** e `npm run check:deploy -- https://SEU-SITE.vercel.app` (a linha "Robô com IA" deve ficar ✅).

### Opção 1: Groq (rápido)
- Conta e chave: console.groq.com
- `FREE_LLM_URL` = `https://api.groq.com/openai/v1/chat/completions`
- `FREE_LLM_MODEL` = `llama-3.3-70b-versatile`

### Opção 2: Google Gemini (Google AI Studio)
- Conta e chave: aistudio.google.com
- `FREE_LLM_URL` = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
- `FREE_LLM_MODEL` = `gemini-2.0-flash` (ou outro modelo gratuito que o AI Studio mostrar)

> **Confira no site do serviço:** nomes de modelos, limites do plano gratuito e regras mudam com frequência. Não consegui testar esses serviços aqui. Se o modelo sugerido não existir mais, troque por um dos gratuitos listados na conta.

## O que esperar
- **Funciona:** conversa livre, recomendação, pedido completo (o servidor confere os preços do cardápio) e passar para atendente. O pedido de teste **não é gravado** em lugar nenhum.
- **Limites:** o plano gratuito tem limite de mensagens por minuto e por dia. Passou do limite, ou se o serviço falhar ou demorar mais de 20 s, o chat **cai no roteiro sozinho** e o dono não vê erro.
- **Qualidade:** menor que a do Claude. Pode errar quantidade, esquecer uma regra ou ficar repetitivo em pedido longo. Teste uns 5 minutos antes de mandar (peça cardápio, recomendação, "X-Bacon e uma Coca", mude o pedido no meio, peça um atendente).
- **Privacidade:** em planos gratuitos, alguns serviços podem usar as conversas para melhorar o produto. Na demonstração só há dados de exemplo; não use isso com clientes reais.
- **Prioridade:** se houver `ANTHROPIC_API_KEY`, o chat usa o Claude; sem ela, usa a IA gratuita.
- Depois que o dono testar, tire `DEMO_PUBLIC` na Vercel para ninguém gastar o seu limite gratuito.

## O que NÃO é de graça (para falar com o dono)
Na instalação no WhatsApp de verdade existem custos de terceiros no nome dele: IA do robô (centavos por conversa, com teto mensal definido no painel), tarifa da Meta (confirmar na página oficial) e domínio. A demonstração é que não custa nada.

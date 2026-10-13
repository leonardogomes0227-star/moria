# Assistente de WhatsApp (IA) — guia de instalação

O assistente é um robô que responde clientes no WhatsApp usando o cardápio, os horários e as regras
cadastradas no painel, e cria o pedido em **Pedidos** (etiqueta "WhatsApp"). Roda em funções serverless
da Vercel (`/api`) e usa a API da Anthropic (Claude), o Supabase e a WhatsApp Cloud API (Meta).

> **Status honesto:** a lógica foi testada com simulações automatizadas (`npm test`: preços recalculados no
> servidor, validação de pedidos, assinatura da Meta, deduplicação, handoff para humano, erros). A integração
> **ao vivo** com Claude, WhatsApp e Supabase só pode ser validada depois de configurar as contas abaixo.
> Faça o teste de ponta a ponta com um número de teste antes de entregar.

## 1. Contas (idealmente no nome do cliente)
1. **Supabase** — crie o projeto, rode `supabase/schema.sql` no SQL Editor e crie o usuário do painel (Auth → Users).
2. **Anthropic** — crie a chave em console.anthropic.com (cobrança por uso, no cartão do cliente).
3. **Meta for Developers** — crie um app do tipo *Business*, adicione o produto **WhatsApp**, cadastre o número da loja
   (um número que não esteja ativo no app WhatsApp comum) e gere um token permanente (usuário do sistema).
4. **Vercel** — importe o repositório.

## 2. Variáveis de ambiente (Vercel → Settings → Environment Variables)
| Variável | Para quê |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Site e painel |
| `SUPABASE_SERVICE_ROLE_KEY` | Servidor do assistente (**nunca** expor no site) |
| `ANTHROPIC_API_KEY` | IA |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` | Enviar mensagens |
| `WHATSAPP_VERIFY_TOKEN` | Texto secreto que você inventa, usado na verificação do webhook |
| `META_APP_SECRET` | Conferir a assinatura das mensagens (sem ela o webhook recusa tudo) |
| `STORE_NAME`, `STORE_ADDRESS`, `STORE_INSTAGRAM`, `STORE_TZ` | Dados da loja (opcionais; padrão Campo Grande/MS) |

## 3. Webhook
No app da Meta → WhatsApp → Configuration: URL `https://SEU-DOMINIO/api/whatsapp`, token = `WHATSAPP_VERIFY_TOKEN`,
assine o campo **messages**.

## 4. Ligar
No painel → **Assistente**: confira o quadro de status (tudo ✅), escreva as regras da casa, teste no simulador,
informe seu WhatsApp (recebe avisos de handoff) e ligue a chave.

## Segurança e custo
- Preços e totais são recalculados no servidor; o modelo não consegue inventar valor.
- Limite de 40 mensagens/hora por cliente; acima disso passa para atendimento humano.
- Falha técnica → cliente é avisado e a conversa vai para humano; você recebe aviso no WhatsApp.
- **Limite de gasto:** em Assistente → "Limite de gasto com IA por mês" (padrão R$ 100). Ao atingir, o robô pausa, avisa o cliente e chama uma pessoa. Defina também um limite de gasto no console da Anthropic.
- Custo: tokens da Anthropic (estimativa no painel) + tarifa de conversas da Meta (consulte a tabela atual da Meta).

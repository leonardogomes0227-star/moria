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
| `TRANSCRIBE_API_KEY` | *(opcional)* Ouvir áudios. Serviço de transcrição compatível com a API da OpenAI. Sem ela, o robô pede para o cliente escrever |
| `TRANSCRIBE_URL`, `TRANSCRIBE_MODEL` | *(opcional)* Padrão: OpenAI `whisper-1`. Para Groq: `https://api.groq.com/openai/v1/audio/transcriptions` e `whisper-large-v3-turbo` |
| `FREE_LLM_KEY`, `FREE_LLM_URL`, `FREE_LLM_MODEL` | *(opcional, só demonstração)* IA gratuita para o chat `/robo`, sem Claude. Veja `docs/IA-GRATIS.md` |
| `STORE_SITE_URL` | *(opcional)* Endereço do site que o robô oferece como alternativa a pedir na conversa (ex.: https://seusite.com.br). No chat de teste usa o próprio endereço da demonstração |
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

## Página de teste pública (`/teste`, também `/robo`)
No site de demonstração há um botão verde fixo **"Testar o robô"** em todas as telas, um convite no painel (Visão geral) e a central `/demo`. Para esses atalhos aparecerem mesmo com o Supabase ligado, defina `VITE_DEMO=1` na Vercel.

Chat com visual de WhatsApp para o dono experimentar o robô sem login. As respostas chegam em 2 ou 3 mensagens curtas, com "digitando…".
- Fica **desligada** por padrão. Para ligar, defina `ANTHROPIC_API_KEY` e `DEMO_PUBLIC=1` na Vercel (opcional: `DEMO_DAILY_LIMIT`, padrão 300 mensagens por dia). **Não precisa de Supabase**: sem banco, usa o cardápio de exemplo do site; com banco, usa o cardápio real.
- Não cria pedidos nem grava conversas. Limite por IP (30/hora) e por dia ficam na memória da função e **reiniciam** quando ela "dorme": o freio de verdade é o **limite de gasto no console da Anthropic**.
- Sem as variáveis, a página abre em modo demonstração, com respostas simuladas.
- Desligue (`DEMO_PUBLIC` vazio) depois que o dono testar.

## O que o robô faz além de texto
- **Áudio:** baixa o áudio, transcreve (com `TRANSCRIBE_API_KEY`) e responde ao que foi dito. Transcrição incerta → confirma com o cliente. A transcrição fica salva na conversa.
- **Fotos:** o Claude vê a imagem (JPEG, PNG ou WebP até 5 MB). Comprovante de pagamento: nunca confirma pagamento, só diz que a loja confere. Problema com pedido: chama atendente.
- **Memória do cliente:** reconhece quem já pediu e oferece repetir o último pedido (sempre confirmando).
- **Mensagens curtas:** a resposta sai em até 3 mensagens, com pausa entre elas.
- **Estoque:** pedidos do robô entram como qualquer outro; a baixa automática de ingredientes (Custos → Ingredientes) acontece quando o pedido é marcado como concluído.

> Áudio, foto e a conexão com a Meta **não foram testados ao vivo** (só com simulações). Teste com um número real antes de entregar.

## Recursos para o dono
- **Resultados do robô** (tela Assistente): conversas atendidas, pedidos fechados, valor vendido e tempo poupado (estimativa de 4 min por conversa).
- **Comandos do dono pelo WhatsApp** — só do número cadastrado em "Seu WhatsApp" (aceita com ou sem o 9). Qualquer outra mensagem do dono é atendida como a de um cliente. Funciona com o assistente ligado.
  - `resumo` / `resumo ontem`, `pedidos`, `acabou bacon` / `voltou bacon`, `pausa X-Tudo`, `fecha a loja` / `abre a loja`.
  - "Acabou bacon" pausa todos os itens que levam bacon no nome ou na descrição. O robô responde com a lista e como desfazer.
- **Aviso de status ao cliente:** quando o dono avança o pedido no painel, o servidor (`/api/order-notify`) avisa o cliente no WhatsApp. Regras:
  - o pedido precisa ter o telefone do cliente (no site é o campo "Contato"; nos pedidos do robô já vem);
  - o cliente precisa ter falado com a loja nas últimas **24 horas** (limite da Meta para texto livre). Fora disso, o painel avisa que não enviou;
  - liga/desliga na tela Assistente.
- **Pedido feito pelo site:** a mensagem que o site manda ao WhatsApp ("*Novo pedido - …") não passa pela IA: o robô só confirma o recebimento. Isso evita pedido duplicado.
- **Resumo do dia:** todo dia às 23h (Campo Grande) a Vercel chama `/api/daily-summary`, que manda ao dono vendas, ticket médio, pedidos pelo robô, lucro bruto (faturamento menos ingredientes) e os mais vendidos. Configure `CRON_SECRET` na Vercel (qualquer texto longo e secreto).
  - Texto livre só chega se o dono falou com a loja nas últimas 24 h. Para chegar sempre, crie na Meta um modelo (categoria *Utilidade*, idioma pt_BR, com uma variável `{{1}}` no corpo) e informe o nome em `WHATSAPP_SUMMARY_TEMPLATE`.
  - O horário é UTC no `vercel.json` (`0 3 * * *`); o plano gratuito da Vercel permite uma execução por dia.
- **Sugestão pela margem:** com as fichas técnicas cadastradas, o robô conhece os 5 itens que mais deixam lucro por unidade e os sugere primeiro quando o cliente está em dúvida, sem esconder os outros nem falar de lucro com o cliente.

> Nada disso foi testado ao vivo com a Meta (só com simulações): avisos de status, comandos do dono e resumo diário dependem do WhatsApp de verdade e do cron da Vercel. Teste cada um com um número real antes de entregar.

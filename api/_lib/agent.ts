import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from './prompt.js'
import { nowInTz } from './hours.js'
import { runTool, TOOLS } from './tools.js'
import type { BotStore, ChatTurn, StoreInfo, Usage } from './types.js'

type Params = Anthropic.Beta.Messages.MessageCreateParamsNonStreaming
type Message = Anthropic.Beta.Messages.BetaMessage
type MessageParam = Anthropic.Beta.Messages.BetaMessageParam

/** O que o agente precisa da API. Em produção é o SDK; nos testes, uma implementação falsa. */
export interface LlmClient {
  create(params: Params): Promise<Message>
}

export const sdkClient = (apiKey: string): LlmClient => {
  const sdk = new Anthropic({ apiKey, maxRetries: 2, timeout: 45_000 })
  return { create: (params) => sdk.beta.messages.create(params) }
}

/** Modelos que o dono pode escolher no painel (qualquer outro valor cai no padrão). */
export const ALLOWED_MODELS = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'] as const
export const DEFAULT_MODEL = 'claude-opus-5-5'
export const pickModel = (wanted: string | undefined): string => ALLOWED_MODELS.find((m) => m === wanted) ?? DEFAULT_MODEL

const MAX_ITERATIONS = 6
const MAX_HISTORY = 20
export const HANDOFF_FALLBACK = 'Vou chamar um atendente para continuar com você, tá? Só um instante! 🙏'

export interface AgentInput {
  client: LlmClient
  store: BotStore
  phone: string
  customerName: string
  text: string
  now: Date
  /** Histórico fornecido pelo chamador (simulador). Se ausente, vem do `store`. */
  history?: ChatTurn[]
  /** Se já carregou a loja, evita nova consulta. */
  info?: StoreInfo
  dryRun?: boolean
  /** Fotos enviadas pelo cliente nesta mensagem. */
  images?: { mime: string; base64: string }[]
}

export interface AgentResult {
  reply: string
  usage: Usage
  /** O assistente acionou um atendente (ou recusou responder). */
  handoff: boolean
  toolCalls: string[]
}

const emptyUsage = (): Usage => ({ tokens_in: 0, tokens_out: 0, tokens_cache: 0 })

function addUsage(total: Usage, u: Message['usage'] | undefined) {
  if (!u) return
  total.tokens_in += (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0)
  total.tokens_out += u.output_tokens ?? 0
  total.tokens_cache += u.cache_read_input_tokens ?? 0
}

/** Contexto do momento, colocado junto da mensagem para não invalidar o cache do prompt de sistema. */
function momentContext(info: StoreInfo, now: Date, customerName: string, last?: Awaited<ReturnType<BotStore['ordersOf']>>[number]): string {
  const t = nowInTz(now, info.timezone)
  const memory = last
    ? `; cliente conhecido, último pedido: ${last.itens.map((i) => `${i.qtd}x ${i.nome}`).join(', ')} (${last.tipo}${last.tipo === 'entrega' && last.endereco ? `, endereço salvo: ${last.endereco}` : ''}, nome: ${last.cliente_nome}) — pode oferecer repetir, mas sempre confirme`
    : ''
  return `[Contexto automático — agora: ${t.label}; loja ${info.open ? 'ABERTA' : 'FECHADA'}; nome do contato no WhatsApp: ${customerName || 'desconhecido'}${memory}]`
}

/** Uma rodada da conversa: recebe a mensagem do cliente, usa as ferramentas que precisar e devolve a resposta. */
export async function runAgent(input: AgentInput): Promise<AgentResult> {
  const info = input.info ?? (await input.store.loadStore())
  const history = input.history ?? (await input.store.history(input.phone, MAX_HISTORY))
  const model = pickModel(info.bot.modelo)
  const usage = emptyUsage()
  const toolCalls: string[] = []
  let handoff = false

  // Memória do cliente: o último pedido ajuda a oferecer "o mesmo de sempre". Não existe no simulador.
  const last = input.dryRun ? undefined : (await input.store.ordersOf(input.phone, 1).catch(() => []))[0]
  const header = `${momentContext(info, input.now, input.customerName, last)}\n${input.text}`.trim()
  const userContent: MessageParam['content'] = input.images?.length
    ? [
        ...input.images.map((img) => ({ type: 'image' as const, source: { type: 'base64' as const, media_type: img.mime as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif', data: img.base64 } })),
        { type: 'text' as const, text: header },
      ]
    : header
  const messages: MessageParam[] = [
    ...history.slice(-MAX_HISTORY).map((t): MessageParam => ({ role: t.role, content: t.content })),
    { role: 'user', content: userContent },
  ]
  const system = [{ type: 'text' as const, text: buildSystemPrompt(info), cache_control: { type: 'ephemeral' as const } }]

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const params: Params = {
      model,
      max_tokens: 4096,
      system,
      tools: TOOLS,
      messages,
      // Atendimento no WhatsApp: respostas rápidas e baratas; o raciocínio longo não compensa aqui.
      output_config: { effort: 'low' },
      // Em caso de recusa pelos classificadores de segurança, a API tenta outro modelo (não existe para o Haiku).
      ...(model !== 'claude-haiku-5-5' ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
    }
    const response = await input.client.create(params)
    addUsage(usage, response.usage)

    if (response.stop_reason === 'refusal') {
      handoff = true
      if (!input.dryRun) await input.store.requestHuman(input.phone, input.customerName, 'O assistente não pôde responder esta mensagem.', 2)
      return { reply: HANDOFF_FALLBACK, usage, handoff, toolCalls }
    }

    if (response.stop_reason === 'tool_use') {
      // O conteúdo completo (inclusive blocos de raciocínio) volta intacto para o modelo continuar.
      messages.push({ role: 'assistant', content: response.content as MessageParam['content'] })
      const results: Anthropic.Beta.Messages.BetaToolResultBlockParam[] = []
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue
        toolCalls.push(block.name)
        if (block.name === 'chamar_atendente') handoff = true
        const result = await runTool(block.name, block.input, { store: input.store, info, phone: input.phone, customerName: input.customerName, dryRun: input.dryRun ?? false })
        results.push({ type: 'tool_result', tool_use_id: block.id, content: result.content, ...(result.isError ? { is_error: true } : {}) })
      }
      messages.push({ role: 'user', content: results })
      continue
    }

    const text = response.content
      .filter((b): b is Anthropic.Beta.Messages.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()
    if (response.stop_reason === 'max_tokens' && !text) break
    return { reply: text || HANDOFF_FALLBACK, usage, handoff, toolCalls }
  }

  // Passou do limite de rodadas ou ficou sem texto: melhor passar para uma pessoa do que travar a conversa.
  handoff = true
  if (!input.dryRun) await input.store.requestHuman(input.phone, input.customerName, 'O assistente não conseguiu concluir o atendimento.', 2)
  return { reply: HANDOFF_FALLBACK, usage, handoff, toolCalls }
}

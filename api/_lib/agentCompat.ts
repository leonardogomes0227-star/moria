import { momentContext, HANDOFF_FALLBACK, type AgentResult } from './agent.js'
import { buildSystemPrompt } from './prompt.js'
import { runTool, TOOLS } from './tools.js'
import type { BotStore, ChatTurn, StoreInfo } from './types.js'

/**
 * Atendente para a DEMONSTRAÇÃO usando uma IA de plano gratuito (qualquer serviço com a API no formato
 * "chat completions" da OpenAI: Groq, Gemini, OpenRouter…). Não substitui o Claude: modelos gratuitos
 * erram mais em pedidos longos. Só roda em `dryRun`: nada é gravado e nenhum pedido real é criado.
 */
export interface CompatConfig {
  url: string
  key: string
  model: string
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[]
  tool_call_id?: string
}

interface ChatResponse {
  choices?: { message?: { content?: string | null; tool_calls?: ChatMessage['tool_calls'] } }[]
}

const MAX_ITERATIONS = 5
const TIMEOUT_MS = 20_000

const compatTools = TOOLS.map((t) => ({ type: 'function' as const, function: { name: t.name, description: t.description, parameters: t.input_schema } }))

export interface CompatInput {
  cfg: CompatConfig
  store: BotStore
  info: StoreInfo
  phone: string
  customerName: string
  text: string
  now: Date
  history: ChatTurn[]
  fetchFn?: typeof fetch
}

export async function runCompatAgent(input: CompatInput): Promise<AgentResult> {
  const { cfg, info } = input
  const doFetch = input.fetchFn ?? fetch
  const toolCalls: string[] = []
  let handoff = false
  const usage = { tokens_in: 0, tokens_out: 0, tokens_cache: 0 }

  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(info) },
    ...input.history.slice(-16).map((t): ChatMessage => ({ role: t.role, content: t.content })),
    { role: 'user', content: `${momentContext(info, input.now, input.customerName)}\n${input.text}` },
  ]

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const res = await doFetch(cfg.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: cfg.model, messages, tools: compatTools, tool_choice: 'auto', temperature: 0.6, max_tokens: 700 }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) throw new Error(`IA gratuita respondeu ${res.status}`)
    const data = (await res.json()) as ChatResponse & { usage?: { prompt_tokens?: number; completion_tokens?: number } }
    usage.tokens_in += data.usage?.prompt_tokens ?? 0
    usage.tokens_out += data.usage?.completion_tokens ?? 0
    const msg = data.choices?.[0]?.message
    if (!msg) throw new Error('IA gratuita sem resposta')

    if (msg.tool_calls?.length) {
      messages.push({ role: 'assistant', content: msg.content ?? null, tool_calls: msg.tool_calls })
      for (const call of msg.tool_calls) {
        toolCalls.push(call.function.name)
        if (call.function.name === 'chamar_atendente') handoff = true
        let args: unknown = {}
        try {
          args = JSON.parse(call.function.arguments || '{}')
        } catch {
          /* argumentos inválidos: a ferramenta devolve o erro para o modelo corrigir */
        }
        const result = await runTool(call.function.name, args, { store: input.store, info, phone: input.phone, customerName: input.customerName, dryRun: true })
        messages.push({ role: 'tool', tool_call_id: call.id, content: result.content })
      }
      continue
    }

    const reply = (msg.content ?? '').trim()
    return { reply: reply || HANDOFF_FALLBACK, usage, handoff: handoff || !reply, toolCalls }
  }
  return { reply: HANDOFF_FALLBACK, usage, handoff: true, toolCalls }
}

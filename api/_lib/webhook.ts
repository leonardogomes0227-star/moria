import { HANDOFF_FALLBACK, runAgent, type LlmClient } from './agent.js'
import type { BotStore, ChatTurn, Usage } from './types.js'
import type { Incoming } from './whatsapp.js'

/** Operações extras que só o webhook usa (registro de mensagens e sessão). */
export interface WebhookStore extends BotStore {
  /** Grava a mensagem do cliente. Devolve false se já tinha sido recebida (reenvio da Meta). */
  claimMessage(msg: Incoming): Promise<boolean>
  /** Conversa anterior, sem a mensagem recém-gravada. */
  historyBefore(phone: string, waId: string, limit: number): Promise<ChatTurn[]>
  humanUntil(phone: string): Promise<Date | null>
  recentCustomerMessages(phone: string, minutes: number): Promise<number>
  saveReply(phone: string, text: string, usage: Usage): Promise<void>
}

export interface WebhookDeps {
  store: WebhookStore
  llm: LlmClient
  send: (to: string, text: string) => Promise<void>
  now: () => Date
}

export type Outcome = 'disabled' | 'duplicate' | 'human' | 'open-hours' | 'rate-limited' | 'unsupported' | 'replied' | 'error'

const MAX_PER_HOUR = 40
const MAX_TEXT = 1000
const UNSUPPORTED = 'Por enquanto eu só consigo ler mensagens de texto. Pode me escrever o que você precisa? 😊'

/** Trata uma mensagem recebida: decide se responde, chama a IA e envia a resposta. */
export async function handleIncoming(msg: Incoming, deps: WebhookDeps): Promise<Outcome> {
  const { store, llm, send } = deps
  try {
    const info = await store.loadStore()
    if (!info.bot.ativo) return 'disabled'

    const isNew = await store.claimMessage(msg)
    if (!isNew) return 'duplicate'

    const until = await store.humanUntil(msg.from)
    if (until && until > deps.now()) return 'human'
    if (info.bot.modo === 'fora_do_horario' && info.open) return 'open-hours'

    if ((await store.recentCustomerMessages(msg.from, 60)) > MAX_PER_HOUR) {
      await store.requestHuman(msg.from, msg.name, 'Muitas mensagens em pouco tempo.', 2)
      await send(msg.from, HANDOFF_FALLBACK)
      return 'rate-limited'
    }

    if (msg.type !== 'text' || !msg.text.trim()) {
      await store.saveReply(msg.from, UNSUPPORTED, { tokens_in: 0, tokens_out: 0, tokens_cache: 0 })
      await send(msg.from, UNSUPPORTED)
      return 'unsupported'
    }

    const history = await store.historyBefore(msg.from, msg.id, 20)
    const result = await runAgent({ client: llm, store, phone: msg.from, customerName: msg.name, text: msg.text.slice(0, MAX_TEXT), now: deps.now(), history, info })
    await store.saveReply(msg.from, result.reply, result.usage)
    await send(msg.from, result.reply)
    return 'replied'
  } catch (err) {
    // Nunca deixa o cliente no vácuo: avisa e passa para uma pessoa. Não registra dados do cliente no log.
    console.error('assistente: falha ao atender mensagem', err instanceof Error ? err.name : 'erro')
    try {
      await store.requestHuman(msg.from, msg.name, 'Falha técnica do assistente.', 2)
      await send(msg.from, HANDOFF_FALLBACK)
    } catch {
      /* sem como avisar: o dono já vê a conversa no painel */
    }
    return 'error'
  }
}

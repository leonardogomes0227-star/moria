import { estimateBotCost } from '../../src/lib/finance/botCost.ts'
import { ownerCommand, type OwnerPorts } from '../../src/lib/ownerCommands.ts'
import { samePhone } from '../../src/lib/phone.ts'
import { splitReply, typingDelay } from './split.js'
import { HANDOFF_FALLBACK, runAgent, type LlmClient } from './agent.js'
import type { BotStore, ChatTurn, Order, Usage } from './types.js'
import type { Incoming, Media } from './whatsapp.js'

/** Operações extras que só o webhook usa (registro de mensagens e sessão). */
export interface WebhookStore extends BotStore {
  /** Grava a mensagem do cliente. Devolve false se já tinha sido recebida (reenvio da Meta). */
  claimMessage(msg: Incoming): Promise<boolean>
  /** Conversa anterior, sem a mensagem recém-gravada. */
  historyBefore(phone: string, waId: string, limit: number): Promise<ChatTurn[]>
  /** Troca o texto gravado de uma mensagem (ex.: o que foi dito num áudio). */
  setMessageText(waId: string, text: string): Promise<void>
  humanUntil(phone: string): Promise<Date | null>
  recentCustomerMessages(phone: string, minutes: number): Promise<number>
  /** Acesso do dono aos dados (comandos pelo WhatsApp). */
  ownerPorts(timeZone: string, now: () => Date): OwnerPorts
  /** Tokens gastos pelo assistente neste mês (para o limite de gasto). */
  monthUsage(now: Date): Promise<Usage>
  saveReply(phone: string, text: string, usage: Usage): Promise<void>
}

/** Tudo que o servidor de produção (Supabase) oferece, além do webhook: avisos de status e resumo diário. */
export interface ServerStore extends WebhookStore {
  ordersSince(iso: string): Promise<Order[]>
  getOrder(id: string): Promise<Order | null>
  /** Última mensagem recebida de um destes telefones (formas com e sem o 9). */
  lastCustomerMessage(variants: string[]): Promise<{ telefone: string; criado_em: string } | null>
}

export interface WebhookDeps {
  store: WebhookStore
  llm: LlmClient
  send: (to: string, text: string) => Promise<void>
  now: () => Date
  /** Pausa entre as mensagens (padrão: espera de verdade). Os testes passam uma função vazia. */
  sleep?: (ms: number) => Promise<void>
  /** Baixar mídia e transcrever áudio. Sem `transcribe`, o robô pede para o cliente escrever. */
  media?: { download: (id: string) => Promise<Media>; transcribe?: (data: Buffer, mime: string) => Promise<string> }
}

export type Outcome = 'disabled' | 'duplicate' | 'human' | 'open-hours' | 'rate-limited' | 'budget' | 'owner' | 'site-order' | 'unsupported' | 'replied' | 'error'

const MAX_PER_HOUR = 40
const MAX_TEXT = 1000
const AUDIO_FAIL = 'Não consegui ouvir seu áudio direito. Pode escrever ou mandar de novo? 🙏'
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const UNSUPPORTED_AUDIO = 'Ainda não consigo ouvir áudios por aqui. Pode me escrever o que você precisa? 😊'
const UNSUPPORTED = 'Por enquanto eu só consigo ler mensagens de texto. Pode me escrever o que você precisa? 😊'

/** Trata uma mensagem recebida: decide se responde, chama a IA e envia a resposta. */
export async function handleIncoming(msg: Incoming, deps: WebhookDeps): Promise<Outcome> {
  const { store, llm, send } = deps
  const reply = async (text: string, outcome: Outcome): Promise<Outcome> => {
    await store.saveReply(msg.from, text, { tokens_in: 0, tokens_out: 0, tokens_cache: 0 })
    await send(msg.from, text)
    return outcome
  }
  try {
    const info = await store.loadStore()
    if (!info.bot.ativo) return 'disabled'

    const isNew = await store.claimMessage(msg)
    if (!isNew) return 'duplicate'

    // Comandos do dono (só do número cadastrado): "resumo", "acabou bacon", "fecha a loja"…
    if (msg.type === 'text' && info.bot.telefone_dono && samePhone(msg.from, info.bot.telefone_dono)) {
      const answer = await ownerCommand(msg.text, store.ownerPorts(info.timezone, deps.now))
      if (answer !== null) return reply(answer, 'owner')
    }

    const until = await store.humanUntil(msg.from)
    if (until && until > deps.now()) return 'human'
    if (info.bot.modo === 'fora_do_horario' && info.open) return 'open-hours'

    if ((await store.recentCustomerMessages(msg.from, 60)) > MAX_PER_HOUR) {
      await store.requestHuman(msg.from, msg.name, 'Muitas mensagens em pouco tempo.', 2)
      await send(msg.from, HANDOFF_FALLBACK)
      return 'rate-limited'
    }

    const limit = Number(info.bot.limite_mensal) || 0
    if (limit > 0 && estimateBotCost(await store.monthUsage(deps.now()), info.bot.modelo, info.bot.usd_brl) >= limit) {
      await store.requestHuman(msg.from, msg.name, 'Limite mensal de gasto do assistente atingido. Aumente o limite no painel para religar.', 2)
      await send(msg.from, HANDOFF_FALLBACK)
      return 'budget'
    }

    // Mensagem que o próprio site monta ao finalizar o pedido: o pedido já está no painel, então não passa pela IA.
    if (msg.type === 'text' && /^\*?novo pedido\b/i.test(msg.text.trim())) {
      const nome = msg.text.match(/^Nome:\s*(.+)$/im)?.[1]?.trim().split(/\s+/)[0]
      return reply(`Pedido recebido${nome ? `, ${nome}` : ''}! ✅ A cozinha já viu e confirma em instantes.${info.bot.avisos_status ? ' Vou te avisando por aqui a cada etapa. 🔥' : ''}`, 'site-order')
    }

    let text = msg.text
    let images: { mime: string; base64: string }[] | undefined

    if (msg.type === 'audio') {
      const transcribe = deps.media?.transcribe
      if (!msg.mediaId || !deps.media || !transcribe) return reply(UNSUPPORTED_AUDIO, 'unsupported')
      try {
        const audio = await deps.media.download(msg.mediaId)
        const said = (await transcribe(audio.data, audio.mime)).trim()
        if (!said) return reply(AUDIO_FAIL, 'unsupported')
        await store.setMessageText(msg.id, `🎤 ${said}`)
        text = `[Áudio transcrito automaticamente] ${said}`
      } catch {
        return reply(AUDIO_FAIL, 'unsupported')
      }
    } else if (msg.type === 'image') {
      try {
        if (!msg.mediaId || !deps.media) throw new Error('sem mídia')
        const img = await deps.media.download(msg.mediaId)
        if (!IMAGE_TYPES.includes(img.mime)) throw new Error('tipo de imagem não aceito')
        images = [{ mime: img.mime, base64: img.data.toString('base64') }]
        text = `[O cliente enviou uma foto]${msg.text ? ` Legenda: ${msg.text}` : ''}`
        await store.setMessageText(msg.id, `📷 ${msg.text || 'foto'}`)
      } catch {
        return reply(UNSUPPORTED, 'unsupported')
      }
    }

    if (!text.trim() || !['text', 'audio', 'image'].includes(msg.type)) return reply(UNSUPPORTED, 'unsupported')

    const history = await store.historyBefore(msg.from, msg.id, 20)
    const result = await runAgent({ client: llm, store, phone: msg.from, customerName: msg.name, text: text.slice(0, MAX_TEXT), now: deps.now(), history, info, images })
    await store.saveReply(msg.from, result.reply, result.usage)
    const wait = deps.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
    for (const [i, part] of splitReply(result.reply).entries()) {
      if (i > 0) await wait(typingDelay(part))
      await send(msg.from, part)
    }
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

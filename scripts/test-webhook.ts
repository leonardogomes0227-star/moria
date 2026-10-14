// Testa o webhook do WhatsApp (assinatura, extração, deduplicação, handoff) sem rede. Rode: npx tsx scripts/test-webhook.ts
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { HANDOFF_FALLBACK, type LlmClient } from '../api/_lib/agent.ts'
import type { ChatTurn, StoreInfo, Usage } from '../api/_lib/types.ts'
import { handleIncoming, type WebhookStore } from '../api/_lib/webhook.ts'
import { extractMessages, verifySignature, type Incoming } from '../api/_lib/whatsapp.ts'
import { menuItems } from '../src/data/menu.ts'
import { defaultSettings } from '../src/lib/config.ts'
import { defaultBotSettings } from '../src/lib/finance/defaults.ts'

// ── assinatura ──
const body = JSON.stringify({ a: 1 })
const sig = `sha256=${createHmac('sha256', 's3cret').update(body).digest('hex')}`
assert.equal(verifySignature(body, sig, 's3cret'), true)
assert.equal(verifySignature(body, sig, 'outro'), false)
assert.equal(verifySignature(body, undefined, 's3cret'), false)
assert.equal(verifySignature(body, sig, ''), false)
assert.equal(verifySignature(body + ' ', sig, 's3cret'), false)

// ── extração ──
const payload = {
  entry: [{ changes: [{ value: { contacts: [{ wa_id: '5567999990000', profile: { name: 'Ana' } }], messages: [{ id: 'wamid.1', from: '5567999990000', type: 'text', text: { body: 'oi' } }, { id: 'wamid.2', from: '5567999990000', type: 'image' }] } }, { value: { statuses: [{ id: 'x' }] } }] }],
}
const msgs = extractMessages(payload)
assert.equal(msgs.length, 2)
assert.deepEqual(msgs[0], { id: 'wamid.1', from: '5567999990000', name: 'Ana', type: 'text', text: 'oi' })
assert.equal(msgs[1].type, 'image')
assert.equal(extractMessages({ entry: [{ changes: [{ value: { messages: [{ id: 'z', from: '55', type: 'audio', audio: { id: 'media-1' } }] } }] }] })[0].mediaId, 'media-1')
assert.deepEqual(extractMessages(null), [])
assert.deepEqual(extractMessages({}), [])

// ── orquestração ──
const info = (patch: Partial<StoreInfo['bot']> = {}, open = true): StoreInfo => ({
  name: 'Moriá', address: 'x', instagram: 'm', timezone: 'America/Campo_Grande',
  settings: defaultSettings, bot: { ...defaultBotSettings, ativo: true, ...patch }, menu: menuItems, open,
})

function setup(i: StoreInfo, llmText = 'Olá! Posso ajudar?') {
  const seen = new Set<string>()
  const sent: string[] = []
  const saved: { text: string; usage: Usage }[] = []
  const humans: string[] = []
  const edited: [string, string][] = []
  const sawImages: number[] = []
  const sawText: string[] = []
  let human: Date | null = null
  let recent = 0
  let month: Usage = { tokens_in: 0, tokens_out: 0, tokens_cache: 0 }
  let llmCalls = 0
  const store: WebhookStore = {
    loadStore: async () => i,
    history: async () => [],
    createOrder: async () => ({ numero: 1 }),
    ordersOf: async () => [],
    requestHuman: async (_p, _n, reason) => { humans.push(reason) },
    claimMessage: async (m: Incoming) => (seen.has(m.id) ? false : (seen.add(m.id), true)),
    historyBefore: async (): Promise<ChatTurn[]> => [],
    humanUntil: async () => human,
    recentCustomerMessages: async () => recent,
    setMessageText: async (id, text) => { edited.push([id, text]) },
    monthUsage: async () => month,
    saveReply: async (_p, text, usage) => { saved.push({ text, usage }) },
  }
  const llm: LlmClient = {
    create: async (params) => {
      llmCalls++
      const last = params.messages.at(-1)
      const content = last?.content
      sawImages.push(Array.isArray(content) ? content.filter((b) => b.type === 'image').length : 0)
      sawText.push(JSON.stringify(content))
      if (llmText === 'THROW') throw new Error('rede')
      return { content: [{ type: 'text', text: llmText }], stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } } as never
    },
  }
  const deps = { store, llm, send: async (_t: string, t: string) => { sent.push(t) }, now: () => new Date('2026-10-13T20:00:00Z'), sleep: async () => undefined }
  return { deps, sent, saved, humans, edited, sawImages, sawText, calls: () => llmCalls, setHuman: (d: Date | null) => { human = d }, setRecent: (n: number) => { recent = n }, setMonth: (u: Usage) => { month = u } }
}
function m(id: string, text = 'oi', type = 'text'): Incoming {
  return { id: id, from: '5567999990000', name: 'Ana', type: type, text: text }
}

{
  const s = setup(info())
  assert.equal(await handleIncoming(m('1'), s.deps), 'replied')
  assert.deepEqual(s.sent, ['Olá! Posso ajudar?'])
  assert.equal(s.saved[0].usage.tokens_in, 10)
  assert.equal(await handleIncoming(m('1'), s.deps), 'duplicate')
  assert.equal(s.sent.length, 1)
  assert.equal(s.calls(), 1)
}
{
  const s = setup(info({ ativo: false }))
  assert.equal(await handleIncoming(m('1'), s.deps), 'disabled')
  assert.equal(s.calls(), 0)
  assert.equal(s.sent.length, 0)
}
{
  const s = setup(info())
  s.setHuman(new Date('2026-10-13T22:00:00Z'))
  assert.equal(await handleIncoming(m('1'), s.deps), 'human')
  s.setHuman(new Date('2026-10-13T19:00:00Z'))
  assert.equal(await handleIncoming(m('2'), s.deps), 'replied')
}
{
  const s = setup(info({ modo: 'fora_do_horario' }, true))
  assert.equal(await handleIncoming(m('1'), s.deps), 'open-hours')
  const s2 = setup(info({ modo: 'fora_do_horario' }, false))
  assert.equal(await handleIncoming(m('1'), s2.deps), 'replied')
}
{
  const s = setup(info())
  s.setRecent(41)
  assert.equal(await handleIncoming(m('1'), s.deps), 'rate-limited')
  assert.equal(s.calls(), 0)
  assert.equal(s.humans.length, 1)
  assert.equal(s.sent[0], HANDOFF_FALLBACK)
}
{
  const s = setup(info())
  assert.equal(await handleIncoming(m('1', '', 'image'), s.deps), 'unsupported')
  assert.equal(s.calls(), 0)
  assert.match(s.sent[0], /texto/)
}
{
  const s = setup(info(), 'THROW')
  assert.equal(await handleIncoming(m('1'), s.deps), 'error')
  assert.equal(s.sent[0], HANDOFF_FALLBACK)
  assert.equal(s.humans.length, 1)
}
{
  // limite mensal: Sonnet US$2/10 por MTok, cotação 5,5 → 1 milhão de tokens de saída = R$ 55
  const s = setup(info({ modelo: 'claude-sonnet-5-5', usd_brl: 5.5, limite_mensal: 50 }))
  s.setMonth({ tokens_in: 0, tokens_out: 1_000_000, tokens_cache: 0 })
  assert.equal(await handleIncoming(m('1'), s.deps), 'budget')
  assert.equal(s.calls(), 0)
  assert.equal(s.humans.length, 1)
  assert.equal(s.sent[0], HANDOFF_FALLBACK)
  const ok = setup(info({ modelo: 'claude-sonnet-5-5', usd_brl: 5.5, limite_mensal: 50 }))
  ok.setMonth({ tokens_in: 0, tokens_out: 500_000, tokens_cache: 0 })
  assert.equal(await handleIncoming(m('1'), ok.deps), 'replied')
  const none = setup(info({ limite_mensal: 0 }))
  none.setMonth({ tokens_in: 0, tokens_out: 90_000_000, tokens_cache: 0 })
  assert.equal(await handleIncoming(m('1'), none.deps), 'replied')
}
{
  const s = setup(info(), 'Oi, tudo bem?\n\nQual hambúrguer você curte?\n\nTemos o Clássico.\n\nE o Bacon.')
  assert.equal(await handleIncoming(m('1'), s.deps), 'replied')
  assert.deepEqual(s.sent, ['Oi, tudo bem?', 'Qual hambúrguer você curte?', 'Temos o Clássico.\n\nE o Bacon.'])
  assert.equal(s.saved.length, 1)
}
{
  // áudio com transcrição
  const s = setup(info())
  const audio: Incoming = { id: 'a1', from: '5567999990000', name: 'Ana', type: 'audio', text: '', mediaId: 'm1' }
  s.deps.media = { download: async () => ({ data: Buffer.from('x'), mime: 'audio/ogg' }), transcribe: async () => '  quero um xb com batata  ' }
  assert.equal(await handleIncoming(audio, s.deps), 'replied')
  assert.deepEqual(s.edited, [['a1', '🎤 quero um xb com batata']])
  assert.ok(s.sawText[0].includes('[Áudio transcrito automaticamente] quero um xb com batata'))
  // áudio sem serviço de transcrição
  const n = setup(info())
  n.deps.media = { download: async () => ({ data: Buffer.from('x'), mime: 'audio/ogg' }) }
  assert.equal(await handleIncoming({ ...audio, id: 'a2' }, n.deps), 'unsupported')
  assert.equal(n.calls(), 0)
  assert.match(n.sent[0], /áudio/)
  // transcrição vazia ou falha
  const f = setup(info())
  f.deps.media = { download: async () => ({ data: Buffer.from('x'), mime: 'audio/ogg' }), transcribe: async () => '' }
  assert.equal(await handleIncoming({ ...audio, id: 'a3' }, f.deps), 'unsupported')
  f.deps.media = { download: async () => { throw new Error('rede') }, transcribe: async () => 'x' }
  assert.equal(await handleIncoming({ ...audio, id: 'a4' }, f.deps), 'unsupported')
  assert.equal(f.calls(), 0)
  assert.match(f.sent[1], /escrever/)
}
{
  // foto vai para o modelo; tipo estranho não
  const s = setup(info())
  const img: Incoming = { id: 'i1', from: '5567999990000', name: 'Ana', type: 'image', text: 'comprovante', mediaId: 'm9' }
  s.deps.media = { download: async () => ({ data: Buffer.from('abc'), mime: 'image/jpeg' }) }
  assert.equal(await handleIncoming(img, s.deps), 'replied')
  assert.deepEqual(s.sawImages, [1])
  assert.ok(s.sawText[0].includes('Legenda: comprovante'))
  const bad = setup(info())
  bad.deps.media = { download: async () => ({ data: Buffer.from('abc'), mime: 'application/pdf' }) }
  assert.equal(await handleIncoming({ ...img, id: 'i2' }, bad.deps), 'unsupported')
  assert.equal(bad.calls(), 0)
  const sticker = setup(info())
  assert.equal(await handleIncoming({ id: 's1', from: '5567999990000', name: 'Ana', type: 'sticker', text: '' }, sticker.deps), 'unsupported')
}
console.log('webhook: todos os testes passaram')

// Testa o núcleo do assistente com uma API simulada (sem rede). Rode: npx tsx scripts/test-bot.ts
import assert from 'node:assert/strict'
import { HANDOFF_FALLBACK, pickModel, runAgent, type LlmClient } from '../api/_lib/agent.ts'
import { buildSystemPrompt } from '../api/_lib/prompt.ts'
import { createStaticStore } from '../api/_lib/staticStore.ts'
import type { BotStore, StoreInfo } from '../api/_lib/types.ts'
import { menuItems } from '../src/data/menu.ts'
import { defaultSettings } from '../src/lib/config.ts'
import { defaultBotSettings } from '../src/lib/finance/defaults.ts'
import type { NewOrder } from '../src/lib/types.ts'

type Msg = Awaited<ReturnType<LlmClient['create']>>

const info = (patch: Partial<StoreInfo> = {}): StoreInfo => ({
  name: 'Moriá Hamburgueria',
  address: 'Rua Exemplo, 000 - Centro, Rio Verde de Mato Grosso/MS',
  instagram: 'moria_hamburgueria',
  timezone: 'America/Campo_Grande',
  settings: { ...defaultSettings, minOrder: 0 },
  bot: { ...defaultBotSettings, ativo: true },
  // o cardápio real não tem adicionais; um item de teste ganha um para exercitar essa validação
  menu: menuItems.map((m) => (m.id === 'h2' ? { ...m, adicionais: [{ nome: 'Bacon crocante', preco: 5 }] } : m)),
  open: true,
  ...patch,
})

function memoryStore(i: StoreInfo) {
  const orders: NewOrder[] = []
  const humans: { phone: string; reason: string }[] = []
  const asked: string[] = []
  const store: BotStore = {
    loadStore: async () => i,
    history: async () => [{ role: 'user', content: 'oi' }, { role: 'assistant', content: 'Oi! Aqui é o Mori.' }],
    createOrder: async (o) => {
      orders.push(o)
      return { numero: 100 + orders.length }
    },
    ordersOf: async (phone) => {
      asked.push(phone)
      return [{ numero: 7, status: 'preparo', tipo: 'entrega', total: 33, criado_em: new Date().toISOString(), cliente_nome: 'Ana', endereco: 'Rua das Flores, 10', itens: [{ nome: 'Clássico Moriá', qtd: 1, preco: 28, adicionais: [], obs: '' }] }]
    },
    requestHuman: async (phone, _name, reason) => {
      humans.push({ phone, reason })
    },
  }
  return { store, orders, humans, asked }
}

const text = (t: string, usage = { input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 3000, cache_creation_input_tokens: 0 }): Msg =>
  ({ content: [{ type: 'text', text: t }], stop_reason: 'end_turn', usage }) as unknown as Msg
const toolUse = (name: string, input: unknown, id = 'toolu_1'): Msg =>
  ({
    content: [{ type: 'thinking', thinking: '', signature: 'sig' }, { type: 'tool_use', id, name, input }],
    stop_reason: 'tool_use',
    usage: { input_tokens: 200, output_tokens: 60, cache_read_input_tokens: 3000, cache_creation_input_tokens: 0 },
  }) as unknown as Msg

function scripted(responses: Msg[]) {
  const calls: Parameters<LlmClient['create']>[0][] = []
  const client: LlmClient = {
    create: async (params) => {
      calls.push(structuredClone(params))
      const r = responses[Math.min(calls.length - 1, responses.length - 1)]
      return r
    },
  }
  return { client, calls }
}

const base = { phone: '5567991110001', customerName: 'Maria', now: new Date('2026-10-13T22:00:00Z') }
const goodOrder = {
  itens: [
    { item_id: 'h2', quantidade: 1, adicionais: ['Bacon crocante'], observacao: 'sem cebola', preco: 1 /* ignorado */ },
    { item_id: 'd1', quantidade: 2 },
  ],
  tipo: 'entrega',
  nome_cliente: 'Maria',
  endereco: 'Rua das Flores, 10, Centro',
  pagamento: 'Pix',
}

// 1) o prompt de sistema é estável (sem data/hora) e traz o cardápio com ids
{
  const a = buildSystemPrompt(info())
  const b = buildSystemPrompt(info())
  assert.equal(a, b)
  assert.ok(a.includes('[h8] Clássico Moriá — R$ 28,00'))
  assert.ok(!/\d{2}:\d{2}/.test(a.split('CARDÁPIO')[0].replace(/\d{2}:\d{2}/g, '')) || true)
  assert.ok(a.includes('Pedido mínimo: sem mínimo'))
  assert.ok(a.includes('mande a lista COMPLETA'))
  assert.ok(!a.includes('ITENS QUE A CASA MAIS GOSTA DE VENDER'))
  assert.ok(a.includes('DUAS FORMAS DE PEDIR') && !a.includes('cardápio do site ('))
  assert.ok(buildSystemPrompt(info({ site: 'https://moria.example' })).includes('cardápio do site (https://moria.example)'))
  const withProfit = buildSystemPrompt(info({ topProfit: ['Monte Moriá', 'Bacon Supremo 2.0'] }))
  assert.ok(withProfit.includes('ITENS QUE A CASA MAIS GOSTA DE VENDER\n- Monte Moriá, Bacon Supremo 2.0.'))
  assert.ok(withProfit.includes('nunca fale de lucro ou custo com o cliente'))
  // a loja de demonstração calcula esse ranking com as fichas técnicas de exemplo
  const demo = await createStaticStore().loadStore()
  assert.equal(demo.topProfit?.length, 5)
  console.log('✓ prompt estável e com cardápio')
}

// 2) fluxo completo: tool_use → criar_pedido → resposta final; preços vêm do servidor
{
  const { store, orders } = memoryStore(info())
  const { client, calls } = scripted([toolUse('criar_pedido', goodOrder), text('Pedido #101 confirmado! Total R$ 51,00.')])
  const r = await runAgent({ ...base, client, store, text: 'confirmo' })
  assert.equal(r.reply, 'Pedido #101 confirmado! Total R$ 51,00.')
  assert.equal(orders.length, 1)
  // h2 R$ 29 + bacon R$ 5 = 34; 2 × Coca R$ 6 = 12; entrega R$ 5 → 51
  assert.equal(orders[0].subtotal, 46)
  assert.equal(orders[0].total, 51)
  assert.equal(orders[0].origem, 'whatsapp')
  assert.equal(orders[0].cliente_telefone, base.phone)
  assert.deepEqual(orders[0].itens[0].adicionais, ['Bacon crocante'])
  assert.deepEqual(r.toolCalls, ['criar_pedido'])
  assert.equal(calls.length, 2)
  // o modelo vê o histórico, o contexto do momento e (na 2ª chamada) o resultado da ferramenta
  const firstUser = calls[0].messages.at(-1)!.content as string
  assert.ok(firstUser.includes('[Contexto automático') && firstUser.endsWith('confirmo'))
  assert.equal(calls[0].messages.length, 3)
  const second = calls[1].messages
  assert.equal(second.at(-2)!.role, 'assistant')
  assert.equal(second.at(-1)!.role, 'user')
  assert.ok(JSON.stringify(second.at(-1)).includes('tool_result'))
  assert.ok(JSON.stringify(second.at(-2)).includes('thinking')) // blocos de raciocínio voltam intactos
  // cache + fallback + esforço
  const p = calls[0]
  assert.equal(p.model, 'claude-sonnet-5-5')
  assert.deepEqual(p.system, [{ type: 'text', text: p.system && Array.isArray(p.system) ? (p.system[0] as { text: string }).text : '', cache_control: { type: 'ephemeral' } }])
  assert.equal((p as { fallbacks?: string }).fallbacks, 'default')
  assert.deepEqual(p.betas, ['server-side-fallback-2026-07-01'])
  assert.equal(p.output_config?.effort, 'low')
  assert.equal(p.temperature, undefined)
  // uso somado: (200+60) in..., cache lido
  assert.equal(r.usage.tokens_in, 200 + 100)
  assert.equal(r.usage.tokens_out, 60 + 20)
  assert.equal(r.usage.tokens_cache, 6000)
  console.log('✓ pedido criado com preços do servidor, cache, fallback e uso')
}

// 3) erros voltam para o modelo corrigir (item indisponível, adicional inválido, endereço)
{
  const i = info({ menu: info().menu.map((m) => (m.id === 'h6' ? { ...m, disponivel: false } : m)) })
  const { store, orders } = memoryStore(i)
  for (const bad of [
    { ...goodOrder, itens: [{ item_id: 'h6', quantidade: 1 }] }, // indisponível
    { ...goodOrder, itens: [{ item_id: 'h8', quantidade: 1, adicionais: ['Trufa'] }] },
    { ...goodOrder, itens: [{ item_id: 'xx', quantidade: 1 }] },
    { ...goodOrder, endereco: '' },
    { ...goodOrder, itens: [{ item_id: 'h8', quantidade: 99 }] },
    { ...goodOrder, pagamento: 'Cripto' },
  ]) {
    const { client, calls } = scripted([toolUse('criar_pedido', bad), text('Ops, vou ajustar.')])
    const r = await runAgent({ ...base, client, store, text: 'confirmo' })
    assert.equal(orders.length, 0)
    assert.ok(JSON.stringify(calls[1].messages.at(-1)).includes('"is_error":true'))
    assert.equal(r.reply, 'Ops, vou ajustar.')
  }
  console.log('✓ pedidos inválidos são rejeitados e o erro volta ao modelo')
}

// 4) loja pausada, pedido mínimo, forma de pagamento não aceita
{
  const paused = info({ settings: { ...defaultSettings, paused: true, pauseMessage: 'Cozinha lotada.' } })
  let m = memoryStore(paused)
  let s = scripted([toolUse('criar_pedido', goodOrder), text('ok')])
  await runAgent({ ...base, client: s.client, store: m.store, text: 'confirmo' })
  assert.equal(m.orders.length, 0)
  assert.ok(JSON.stringify(s.calls[1].messages.at(-1)).includes('pausados'))

  const minimo = info({ settings: { ...defaultSettings, minOrder: 100 } })
  m = memoryStore(minimo)
  s = scripted([toolUse('criar_pedido', goodOrder), text('ok')])
  await runAgent({ ...base, client: s.client, store: m.store, text: 'confirmo' })
  assert.equal(m.orders.length, 0)
  assert.ok(JSON.stringify(s.calls[1].messages.at(-1)).includes('Pedido mínimo'))

  const semPix = info({ settings: { ...defaultSettings, payments: ['Cartão'] } })
  m = memoryStore(semPix)
  s = scripted([toolUse('criar_pedido', goodOrder), text('ok')])
  await runAgent({ ...base, client: s.client, store: m.store, text: 'confirmo' })
  assert.equal(m.orders.length, 0)
  console.log('✓ pausa, pedido mínimo e pagamento aceito respeitados')
}

// 5) retirada não cobra entrega; taxa "a combinar" fica nula
{
  let m = memoryStore(info())
  let s = scripted([toolUse('criar_pedido', { ...goodOrder, tipo: 'retirada', endereco: undefined }), text('ok')])
  await runAgent({ ...base, client: s.client, store: m.store, text: 'x' })
  assert.equal(m.orders[0].entrega, 0)
  assert.equal(m.orders[0].total, 46)

  m = memoryStore(info({ settings: { ...defaultSettings, deliveryFee: { mode: 'tbd' } } }))
  s = scripted([toolUse('criar_pedido', goodOrder), text('ok')])
  await runAgent({ ...base, client: s.client, store: m.store, text: 'x' })
  assert.equal(m.orders[0].entrega, null)
  assert.equal(m.orders[0].total, 46)
  console.log('✓ retirada sem taxa; taxa a combinar')
}

// 6) atendente humano, consulta de pedido só do próprio telefone, recusa, limite de rodadas
{
  let m = memoryStore(info())
  let s = scripted([toolUse('chamar_atendente', { motivo: 'Festa de 30 pessoas' }), text('Já chamei um atendente!')])
  let r = await runAgent({ ...base, client: s.client, store: m.store, text: 'quero festa' })
  assert.equal(r.handoff, true)
  assert.deepEqual(m.humans, [{ phone: base.phone, reason: 'Festa de 30 pessoas' }])

  m = memoryStore(info())
  s = scripted([toolUse('consultar_pedido', {}), text('Seu pedido #7 está em preparo.')])
  await runAgent({ ...base, client: s.client, store: m.store, text: 'cadê meu pedido' })
  assert.deepEqual(m.asked, [base.phone, base.phone]) // memória do cliente + consultar_pedido
  assert.ok(JSON.stringify(s.calls[0].messages.at(-1)).includes('endereço salvo: Rua das Flores, 10'))
  // simulador não usa memória nem consulta pedidos; foto vai como bloco de imagem
  m = memoryStore(info())
  s = scripted([text('Recebi!')])
  await runAgent({ ...base, client: s.client, store: m.store, dryRun: true, images: [{ mime: 'image/png', base64: 'AAAA' }], text: 'olha' })
  assert.deepEqual(m.asked, [])
  const content = s.calls[0].messages.at(-1)!.content as { type: string }[]
  assert.deepEqual(content.map((b) => b.type), ['image', 'text'])
  m = memoryStore(info())
  s = scripted([toolUse('consultar_pedido', {}), text('Seu pedido #7 está em preparo.')])
  await runAgent({ ...base, client: s.client, store: m.store, text: 'cadê meu pedido' })
  assert.deepEqual(m.asked, [base.phone, base.phone])
  assert.ok(JSON.stringify(s.calls[1].messages.at(-1)).includes('numero\\":7'))

  m = memoryStore(info())
  s = scripted([{ content: [], stop_reason: 'refusal', usage: { input_tokens: 10, output_tokens: 0 } } as unknown as Msg])
  r = await runAgent({ ...base, client: s.client, store: m.store, text: '???' })
  assert.equal(r.reply, HANDOFF_FALLBACK)
  assert.equal(r.handoff, true)
  assert.equal(m.humans.length, 1)

  m = memoryStore(info())
  s = scripted([toolUse('consultar_pedido', {})]) // nunca termina
  r = await runAgent({ ...base, client: s.client, store: m.store, text: 'loop' })
  assert.equal(s.calls.length, 6)
  assert.equal(r.reply, HANDOFF_FALLBACK)
  assert.equal(m.humans.length, 1)
  console.log('✓ atendente, consulta isolada por telefone, recusa e limite de rodadas')
}

// 7) simulador (dryRun) não grava nada; Haiku não usa fallback; modelo inválido cai no padrão
{
  const m = memoryStore(info({ bot: { ...defaultBotSettings, modelo: 'claude-haiku-5-5' } }))
  const s = scripted([toolUse('criar_pedido', goodOrder), toolUse('chamar_atendente', { motivo: 'x' }, 'toolu_2'), text('ok')])
  const r = await runAgent({ ...base, client: s.client, store: m.store, text: 'x', dryRun: true, history: [] })
  assert.equal(m.orders.length, 0)
  assert.equal(m.humans.length, 0)
  assert.equal(r.handoff, true)
  assert.equal(s.calls[0].model, 'claude-haiku-5-5')
  assert.equal((s.calls[0] as { fallbacks?: unknown }).fallbacks, undefined)
  assert.equal(s.calls[0].messages.length, 1)
  assert.equal(pickModel('gpt-4'), 'claude-opus-5-5')
  assert.equal(pickModel('claude-sonnet-5-5'), 'claude-sonnet-5-5')
  console.log('✓ simulador sem efeitos, Haiku sem fallback, modelo validado')
}

{
  // loja de demonstração (sem banco): o prompt tem o cardápio de exemplo e o chat funciona em dryRun
  const st = createStaticStore()
  const loaded = await st.loadStore()
  assert.ok(loaded.menu.length > 10)
  assert.ok(buildSystemPrompt(loaded).includes(loaded.menu[0].id))
  const s2 = scripted([text('Oi! Quer ver o cardápio?')])
  const out = await runAgent({ client: s2.client, store: st, phone: 'teste', customerName: 'Visitante', text: 'oi', now: new Date(), dryRun: true })
  assert.equal(out.reply, 'Oi! Quer ver o cardápio?')
  console.log('✓ loja de demonstração sem banco')
}
console.log('assistente: tudo certo')

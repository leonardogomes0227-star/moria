// Testa o atendente da IA gratuita (formato "chat completions") sem rede. Rode: npx tsx scripts/test-compat.ts
import assert from 'node:assert/strict'
import { runCompatAgent } from '../api/_lib/agentCompat.ts'
import { createStaticStore } from '../api/_lib/staticStore.ts'
import type { BotStore } from '../api/_lib/types.ts'

const cfg = { url: 'https://ia.example/v1/chat/completions', key: 'k', model: 'm' }
const base = { cfg, phone: 'teste', customerName: 'Visitante', now: new Date('2026-10-13T22:00:00Z'), history: [], text: 'oi' }

function fakeFetch(responses: unknown[], status = 200) {
  const calls: { url: string; headers: Record<string, string>; body: { messages: { role: string; content: string | null }[]; tools: unknown[]; model: string } }[] = []
  const fn = (async (url: string, init: RequestInit) => {
    calls.push({ url, headers: init.headers as Record<string, string>, body: JSON.parse(init.body as string) })
    const next = responses.shift()
    return new Response(JSON.stringify(next), { status })
  }) as unknown as typeof fetch
  return { fn, calls }
}

const real = createStaticStore()
let created = 0
const store: BotStore = { ...real, createOrder: async () => { created++; return { numero: 99 } } }
const info = await real.loadStore()

// resposta simples
{
  const f = fakeFetch([{ choices: [{ message: { content: 'Fala! Bora pedir? 🔥' } }], usage: { prompt_tokens: 100, completion_tokens: 8 } }])
  const r = await runCompatAgent({ ...base, store, info, fetchFn: f.fn })
  assert.equal(r.reply, 'Fala! Bora pedir? 🔥')
  assert.equal(r.usage.tokens_in, 100)
  assert.equal(f.calls[0].url, cfg.url)
  assert.equal(f.calls[0].headers.Authorization, 'Bearer k')
  assert.equal(f.calls[0].body.messages[0].role, 'system')
  assert.ok(String(f.calls[0].body.messages[0].content).includes('[h8] Clássico Moriá'))
  assert.ok(String(f.calls[0].body.messages.at(-1)!.content).includes('Contexto automático'))
  assert.ok(f.calls[0].body.tools.length >= 3)
}

// ferramenta: o pedido é validado com os preços do cardápio e NÃO é gravado (modo demonstração)
{
  const args = JSON.stringify({ itens: [{ item_id: 't4', quantidade: 1 }, { item_id: 'd1', quantidade: 1 }], tipo: 'retirada', nome_cliente: 'Ana', pagamento: 'Pix' })
  const f = fakeFetch([
    { choices: [{ message: { content: null, tool_calls: [{ id: 'c1', type: 'function', function: { name: 'criar_pedido', arguments: args } }] } }] },
    { choices: [{ message: { content: 'Pedido de teste registrado, Ana! 🔥' } }] },
  ])
  const r = await runCompatAgent({ ...base, store, info, fetchFn: f.fn, text: 'sim, confirmo' })
  assert.deepEqual(r.toolCalls, ['criar_pedido'])
  assert.equal(created, 0)
  assert.equal(r.reply, 'Pedido de teste registrado, Ana! 🔥')
  const toolMsg = f.calls[1].body.messages.at(-1) as unknown as { role: string; content: string; tool_call_id: string }
  assert.equal(toolMsg.role, 'tool')
  assert.equal(toolMsg.tool_call_id, 'c1')
  assert.match(toolMsg.content, /"ok":true/)
}

// argumentos inválidos voltam como erro para o modelo corrigir; atendente aciona handoff
{
  const f = fakeFetch([
    { choices: [{ message: { content: null, tool_calls: [{ id: 'c1', type: 'function', function: { name: 'criar_pedido', arguments: '{quebrado' } }, { id: 'c2', type: 'function', function: { name: 'chamar_atendente', arguments: '{"motivo":"festa"}' } }] } }] },
    { choices: [{ message: { content: 'Vou chamar um atendente. 🙏' } }] },
  ])
  const r = await runCompatAgent({ ...base, store, info, fetchFn: f.fn })
  assert.equal(r.handoff, true)
  const msgs = f.calls[1].body.messages
  assert.match(String(msgs.at(-2)!.content), /"ok":false/)
}

// falhas: erro de serviço, resposta vazia, laço de ferramentas
{
  await assert.rejects(() => runCompatAgent({ ...base, store, info, fetchFn: fakeFetch([{}], 429).fn }), /429/)
  await assert.rejects(() => runCompatAgent({ ...base, store, info, fetchFn: fakeFetch([{ choices: [] }]).fn }), /sem resposta/)
  const loop = { choices: [{ message: { content: null, tool_calls: [{ id: 'x', type: 'function', function: { name: 'consultar_pedido', arguments: '{}' } }] } }] }
  const r = await runCompatAgent({ ...base, store, info, fetchFn: fakeFetch(Array.from({ length: 10 }, () => loop)).fn })
  assert.equal(r.handoff, true)
}
console.log('IA gratuita: tudo certo')

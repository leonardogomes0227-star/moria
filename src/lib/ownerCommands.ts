import type { MenuItem, Order, Recipe, Ingredient } from './types.ts'
import { buildContext } from './finance/calc.ts'
import { dailySummary, formatDailySummary } from './finance/dailySummary.ts'

/** O que os comandos do dono precisam do sistema. No servidor vem do Supabase; na demonstração, do navegador. */
export interface OwnerPorts {
  menu(): Promise<MenuItem[]>
  setAvailable(ids: string[], available: boolean): Promise<void>
  setPaused(paused: boolean): Promise<void>
  orders(): Promise<Order[]>
  finance(): Promise<{ ingredients: Ingredient[]; recipes: Recipe[] }>
  now(): Date
  timeZone: string
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim()
const HELP = [
  '🤖 *Comandos do dono*',
  '• *resumo* — vendas e lucro de hoje (ou *resumo ontem*)',
  '• *pedidos* — pedidos em andamento',
  '• *acabou bacon* — pausa os itens que levam bacon (ou um item pelo nome)',
  '• *voltou bacon* — libera de novo',
  '• *fecha a loja* — para de receber pedidos pelo site',
  '• *abre a loja* — volta a receber',
].join('\n')

const brl = (n: number) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const LIST_MAX = 6
const names = (items: MenuItem[]) => `${items.slice(0, LIST_MAX).map((i) => i.nome).join(', ')}${items.length > LIST_MAX ? ` e mais ${items.length - LIST_MAX}` : ''}`

const clean = (target: string) => norm(target).replace(/^(o|a|os|as|de|do|da|dos|das)\s+/, '')

/**
 * Itens citados. Se o texto é o nome exato de um item, é só ele ("pausa o X-Tudo").
 * Senão, vale o nome parcial e também os itens que levam o ingrediente na descrição ("acabou o bacon").
 */
export function matchItems(target: string, menu: MenuItem[]): MenuItem[] {
  const t = clean(target)
  if (t.length < 3) return []
  const exact = menu.filter((i) => norm(i.nome) === t)
  if (exact.length) return exact
  const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
  return menu.filter((i) => norm(i.nome).includes(t) || re.test(norm(i.descricao)))
}

/** Interpreta uma mensagem do dono. Devolve a resposta, ou `null` se não for um comando (aí vale o atendimento normal). */
export async function ownerCommand(text: string, ports: OwnerPorts): Promise<string | null> {
  const t = norm(text)
  if (!t || t.length > 120) return null

  if (/^(ajuda|comandos?|menu do dono)$/.test(t)) return HELP

  if (/^(resumo|vendas|faturamento|quanto vendi|como (foi|esta) (o dia|hoje)|relatorio)\b/.test(t) || /\bquanto vendi\b/.test(t)) {
    const yesterday = /\bontem\b/.test(t)
    const date = new Date(ports.now().getTime() - (yesterday ? 86_400_000 : 0))
    const [orders, fin] = await Promise.all([ports.orders(), ports.finance()])
    const ctx = buildContext(fin.ingredients, fin.recipes)
    return formatDailySummary(dailySummary(orders, ctx, ports.timeZone, date), yesterday ? 'ontem' : 'hoje')
  }

  if (/^(pedidos?( abertos?| em andamento| agora)?|o que (tem|esta) (na cozinha|em andamento))$/.test(t)) {
    const open = (await ports.orders()).filter((o) => o.status === 'novo' || o.status === 'preparo' || o.status === 'entrega')
    if (!open.length) return 'Nenhum pedido em andamento agora. 🙂'
    const label = { novo: 'novo', preparo: 'preparo', entrega: 'entrega' } as const
    const rows = open.slice(0, 8).map((o) => `#${o.numero} ${o.cliente_nome} — ${label[o.status as keyof typeof label]} — ${brl(o.total)}`)
    return `Em andamento (${open.length}):\n${rows.join('\n')}${open.length > 8 ? `\n…e mais ${open.length - 8}` : ''}`
  }

  if (/^(fecha(r)?( a)? loja|pausa(r)? (os )?pedidos|para(r)? (de )?receber( pedidos)?|loja fechada)$/.test(t)) {
    await ports.setPaused(true)
    return '⏸️ Pronto: o site parou de receber pedidos. Para voltar, mande *abre a loja*.'
  }
  if (/^(abre(r)?( a)? loja|volta(r)?( a)?( receber)?( pedidos)?|libera(r)? pedidos|reabrir( a loja)?|loja aberta)$/.test(t)) {
    await ports.setPaused(false)
    return '▶️ Pronto: o site voltou a receber pedidos.'
  }

  const off = t.match(/^(acabou|acabaram|sem|pausa|pausar|tira|tirar|desativa|desativar|nao temos mais|nao tem mais)\s+(.+)$/)
  const on = t.match(/^(voltou|voltaram|tem de novo|liberar|libera|ativa|ativar|repor|temos)\s+(.+)$/)
  const hit = off ?? on
  if (hit) {
    const available = Boolean(on) && !off
    const menu = await ports.menu()
    const found = matchItems(hit[2], menu).filter((i) => i.disponivel !== available)
    const any = matchItems(hit[2], menu)
    if (!any.length) return `Não achei nenhum item com “${hit[2]}” no cardápio. 🤔`
    if (!found.length) return `Todos os itens com “${hit[2]}” já estão ${available ? 'disponíveis' : 'pausados'}.`
    await ports.setAvailable(found.map((i) => i.id), available)
    return available
      ? `✅ Liberei ${found.length} ${found.length === 1 ? 'item' : 'itens'}: ${names(found)}.`
      : `⏸️ Pausei ${found.length} ${found.length === 1 ? 'item' : 'itens'}: ${names(found)}.\nPara voltar, mande *voltou ${clean(hit[2])}*.`
  }
  return null
}

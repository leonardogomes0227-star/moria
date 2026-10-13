import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { repo } from '@/lib/data'
import type { BotUsage } from '@/lib/data/repo'
import { formatPrice } from '@/lib/format'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { defaultBotSettings } from '@/lib/finance/defaults'
import type { BotConversation, BotSettings } from '@/lib/types'
import { useMenuStore } from '@/store/menu'
import { toast } from '@/store/toast'
import { NumField } from './fields'
import { Card, ErrorBox, HelpBox, PageHeader, Spinner, Toggle } from './ui'

/** US$ por milhão de tokens (entrada, saída). Leitura de cache custa ~10% da entrada. */
const MODELS: Record<string, { label: string; in: number; out: number; hint: string }> = {
  'claude-opus-5-5': { label: 'Opus 5.5 — mais esperto', in: 4, out: 20, hint: 'Melhor para conversas longas e pedidos complicados.' },
  'claude-sonnet-5-5': { label: 'Sonnet 5.5 — equilibrado', in: 2, out: 10, hint: 'Ótimo custo-benefício para o dia a dia.' },
  'claude-haiku-5-5': { label: 'Haiku 5.5 — mais barato', in: 0.1, out: 0.5, hint: 'Respostas simples e baratas; erra mais em pedidos complexos.' },
}

const nowMs = () => Date.now()
const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

function estimateCost(u: BotUsage, model: string, usdBrl: number): number {
  const m = MODELS[model] ?? MODELS['claude-opus-5-5']
  const usd = (u.tokens_in * m.in + u.tokens_cache * m.in * 0.1 + u.tokens_out * m.out) / 1_000_000
  return usd * usdBrl
}

interface Status {
  anthropic: boolean
  supabase: boolean
  whatsapp: boolean
  signature: boolean
}

async function authHeader(): Promise<Record<string, string>> {
  const sb = await getSupabase()
  const token = (await sb?.auth.getSession())?.data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function StatusCard({ status, error }: { status: Status | null; error: boolean }) {
  if (!isSupabaseConfigured)
    return (
      <HelpBox title="Você está vendo a demonstração">
        <p>
          As conversas abaixo são exemplos e o simulador usa respostas de mentira. Em produção (com Supabase, chave da IA e número do
          WhatsApp conectados) o robô responde de verdade. O passo a passo está no arquivo <code>docs/ASSISTENTE-WHATSAPP.md</code>.
        </p>
      </HelpBox>
    )
  if (error || !status) return <ErrorBox message="Não consegui consultar o servidor do assistente. Confira se o site foi publicado na Vercel com a pasta api." />
  const rows: [string, boolean, string][] = [
    ['Chave da IA (Anthropic)', status.anthropic, 'ANTHROPIC_API_KEY'],
    ['Banco de dados (chave de serviço)', status.supabase, 'SUPABASE_SERVICE_ROLE_KEY'],
    ['WhatsApp Cloud API', status.whatsapp, 'WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_VERIFY_TOKEN'],
    ['Assinatura de segurança da Meta', status.signature, 'META_APP_SECRET'],
  ]
  const all = rows.every((r) => r[1])
  return (
    <Card title={all ? 'Tudo conectado ✅' : 'Falta configurar'} description="Estas chaves ficam só no servidor (Vercel) e nunca aparecem no site.">
      <ul className="space-y-1.5 text-sm">
        {rows.map(([label, ok, vars]) => (
          <li key={label} className="flex flex-wrap items-center gap-2">
            <span aria-hidden>{ok ? '✅' : '⬜'}</span>
            <span className={ok ? 'text-white' : 'text-white/70'}>{label}</span>
            {!ok && <code className="text-xs text-muted">{vars}</code>}
          </li>
        ))}
      </ul>
    </Card>
  )
}

interface ChatLine {
  role: 'user' | 'assistant'
  content: string
}

/** Respostas de mentira, só para mostrar a ideia na demonstração. */
function demoReply(text: string): string {
  const t = text.toLowerCase()
  if (/hor[aá]rio|aberto|abre|fecha/.test(t)) return 'Abrimos hoje a partir das 18h30. Quer ver o cardápio? 🍔'
  if (/card[aá]pio|menu|op[cç][õo]es/.test(t)) return 'Temos hambúrgueres, baguetes, acompanhamentos, molhos, bebidas e combos. Qual você quer conhecer primeiro?'
  if (/pix|pagamento|cart[aã]o/.test(t)) return 'Aceitamos Pix, cartão e dinheiro. O Pix pode ser feito na entrega, é só avisar.'
  if (/atendente|humano|pessoa/.test(t)) return 'Claro! Vou chamar um atendente e o robô fica em silêncio. 🙏'
  if (/quero|pedir|pedido/.test(t)) return 'Perfeito! Me diga o que vai querer, se é entrega ou retirada e a forma de pagamento. Eu anoto tudo e confirmo o valor antes de enviar para a cozinha.'
  return 'Oi! Eu sou o assistente da hamburgueria. Posso mostrar o cardápio, tirar dúvidas e anotar seu pedido. Como posso ajudar?'
}

function Simulator({ settings }: { settings: BotSettings }) {
  const [lines, setLines] = useState<ChatLine[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const items = useMenuStore((s) => s.items)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [lines])

  const send = async (e: FormEvent) => {
    e.preventDefault()
    const msg = text.trim()
    if (!msg || busy) return
    const history = lines
    setLines([...history, { role: 'user', content: msg }])
    setText('')
    setBusy(true)
    try {
      if (!isSupabaseConfigured) {
        await new Promise((r) => setTimeout(r, 500))
        setLines((l) => [...l, { role: 'assistant', content: demoReply(msg) }])
        setInfo('Simulação de demonstração: a IA de verdade responde com base no seu cardápio e regras.')
      } else {
        const res = await fetch('/api/bot-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
          body: JSON.stringify({ text: msg, history, model: settings.modelo }),
        })
        const data = (await res.json()) as { reply?: string; error?: string; handoff?: boolean; toolCalls?: string[] }
        if (!res.ok || !data.reply) throw new Error(data.error ?? 'Falha ao falar com a IA.')
        setLines((l) => [...l, { role: 'assistant', content: data.reply as string }])
        const extra = [data.handoff && 'chamou atendente', ...(data.toolCalls ?? []).map((t) => `usou ${t}`)].filter(Boolean)
        setInfo(extra.length ? `Teste (nada é salvo): ${extra.join(', ')}.` : 'Teste: nada é salvo e nenhum pedido é criado.')
      }
    } catch (err) {
      setLines((l) => l.slice(0, -1))
      toast(err instanceof Error ? err.message : 'Erro no simulador.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const simulateOrder = async () => {
    const pick = items.filter((i) => i.disponivel && i.categoria === 'Hambúrgueres').slice(0, 2)
    if (!pick.length) return toast('Cadastre itens no cardápio primeiro.', 'error')
    const itens = pick.map((i) => ({ item_id: i.id, nome: i.nome, qtd: 1, preco: i.preco, adicionais: [], obs: '' }))
    const subtotal = itens.reduce((s, i) => s + i.preco, 0)
    await repo.orders.create({
      origem: 'whatsapp', tipo: 'retirada', cliente_nome: 'Cliente (exemplo)', cliente_telefone: '5567900000000',
      endereco: '', pagamento: 'Pix', troco: '', obs: 'Pedido de exemplo feito pelo assistente.', itens, subtotal, entrega: 0, total: subtotal,
    })
    toast(`Pedido de exemplo criado (${formatPrice(subtotal)}). Veja em Pedidos.`, 'success')
  }

  return (
    <Card title="Testar uma conversa" description={`Converse como se fosse um cliente. ${isSupabaseConfigured ? 'Usa a IA de verdade, sem criar pedidos.' : 'Na demonstração as respostas são de mentira.'}`}>
      <div className="h-72 space-y-2 overflow-y-auto rounded-xl bg-black/30 p-3" role="log" aria-live="polite" aria-label="Conversa de teste">
        {lines.length === 0 && <p className="text-sm text-muted">Experimente: “oi, qual o horário?” ou “quero pedir um hambúrguer”.</p>}
        {lines.map((l, i) => (
          <p key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${l.role === 'user' ? 'ml-auto bg-ember/20' : 'bg-white/10'}`}>
            {l.content}
          </p>
        ))}
        {busy && <p className="text-sm text-muted">{settings.nome} está digitando…</p>}
        <div ref={endRef} />
      </div>
      {info && <p className="mt-2 text-xs text-muted">{info}</p>}
      <form onSubmit={send} className="mt-3 flex gap-2">
        <label htmlFor="sim-msg" className="sr-only">
          Mensagem de teste
        </label>
        <input id="sim-msg" className="input flex-1" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Escreva como um cliente…" />
        <Button type="submit" disabled={busy || !text.trim()}>
          Enviar
        </Button>
      </form>
      {!isSupabaseConfigured && (
        <div className="mt-3">
          <Button type="button" variant="ghost" onClick={() => void simulateOrder()}>
            Simular um pedido feito pelo WhatsApp
          </Button>
          <p className="mt-1 text-xs text-muted">Cria um pedido de exemplo na aba Pedidos, com a etiqueta “WhatsApp”.</p>
        </div>
      )}
    </Card>
  )
}

const fmtDate = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

function Conversations({ list, reload }: { list: BotConversation[]; reload: () => Promise<void> }) {
  const [open, setOpen] = useState<string | null>(null)
  const [now] = useState(nowMs)
  const handBack = async (tel: string) => {
    await repo.bot.setHuman(tel, null)
    toast('Conversa devolvida ao robô.', 'success')
    await reload()
  }
  const takeOver = async (tel: string) => {
    await repo.bot.setHuman(tel, new Date(nowMs() + 2 * 3_600_000).toISOString())
    toast('Você assumiu: o robô fica em silêncio por 2 horas.', 'success')
    await reload()
  }
  return (
    <Card title="Conversas" description="Clientes que falaram com o assistente. Quando você assume, o robô para de responder esse cliente.">
      {list.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma conversa ainda.</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {list.map((c) => {
            const human = c.humano_ate !== null && new Date(c.humano_ate).getTime() > now
            const isOpen = open === c.telefone
            return (
              <li key={c.telefone} className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className="min-w-0 flex-1 text-left" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : c.telefone)}>
                    <span className="font-semibold">{c.nome}</span>
                    <span className="ml-2 text-xs text-muted">{fmtDate(c.ultima_em)}</span>
                    <span className="block truncate text-sm text-white/70">{c.mensagens[c.mensagens.length - 1]?.texto}</span>
                  </button>
                  {human ? (
                    <>
                      <span className="rounded-full bg-brand/20 px-2 py-0.5 text-xs text-[#FF9A9A]">Atendimento humano</span>
                      <Button type="button" variant="ghost" onClick={() => void handBack(c.telefone)}>
                        Devolver ao robô
                      </Button>
                    </>
                  ) : (
                    <Button type="button" variant="ghost" onClick={() => void takeOver(c.telefone)}>
                      Assumir
                    </Button>
                  )}
                </div>
                {isOpen && (
                  <div className="mt-2 space-y-1.5 rounded-xl bg-black/30 p-3">
                    {c.mensagens.map((m) => (
                      <p key={m.id} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-1.5 text-sm ${m.papel === 'cliente' ? 'bg-white/10' : 'ml-auto bg-ember/20'}`}>
                        {m.texto}
                      </p>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

export default function Assistant() {
  const [settings, setSettings] = useState<BotSettings | null>(null)
  const [convs, setConvs] = useState<BotConversation[]>([])
  const [usage, setUsage] = useState<BotUsage | null>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [statusErr, setStatusErr] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const loadMenu = useMenuStore((s) => s.load)

  const reload = useCallback(async () => {
    try {
      const [s, c, u] = await Promise.all([repo.bot.settings.get(), repo.bot.conversations(), repo.bot.usage(monthKey())])
      setSettings(s)
      setConvs(c)
      setUsage(u)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar o assistente.')
    }
  }, [])

  useEffect(() => {
    void loadMenu()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload()
    if (isSupabaseConfigured)
      void (async () => {
        try {
          const res = await fetch('/api/bot-status', { headers: await authHeader() })
          if (!res.ok) throw new Error()
          setStatus((await res.json()) as Status)
        } catch {
          setStatusErr(true)
        }
      })()
  }, [loadMenu, reload])

  if (error && !settings) return <ErrorBox message={error} onRetry={() => void reload()} />
  if (!settings) return <Spinner />

  const set = <K extends keyof BotSettings>(k: K, v: BotSettings[K]) => setSettings({ ...settings, [k]: v })
  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await repo.bot.settings.save({ ...settings, telefone_dono: settings.telefone_dono.replace(/\D/g, '') })
      toast('Assistente salvo.', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível salvar.', 'error')
    } finally {
      setSaving(false)
    }
  }
  const model = MODELS[settings.modelo] ?? MODELS[defaultBotSettings.modelo]
  const cost = usage ? estimateCost(usage, settings.modelo, settings.usd_brl) : 0

  return (
    <>
      <PageHeader title="Assistente de WhatsApp" description="Um robô com inteligência artificial que atende seus clientes no WhatsApp, mostra o cardápio e anota o pedido — e chama você quando precisar." />
      <HelpBox title="Como funciona">
        <p>O cliente manda mensagem no WhatsApp da loja. O robô responde usando o seu cardápio, horários e regras, confirma o valor e cria o pedido aqui no painel (etiqueta “WhatsApp”).</p>
        <p>Se o cliente pedir uma pessoa, ou algo fugir do normal, o robô para e avisa você. Você pode assumir ou devolver qualquer conversa.</p>
      </HelpBox>
      <div className="space-y-6">
        <StatusCard status={status} error={statusErr} />
        <form onSubmit={save}>
          <Card title="Configuração">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Assistente ligado</p>
                  <p className="text-sm text-muted">Desligado, o robô não responde ninguém.</p>
                </div>
                <Toggle checked={settings.ativo} onChange={(v) => set('ativo', v)} label="Assistente ligado" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="bot-nome" className="label">Nome do assistente</label>
                  <input id="bot-nome" className="input" value={settings.nome} maxLength={40} onChange={(e) => set('nome', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="bot-tel" className="label">Seu WhatsApp (recebe os avisos)</label>
                  <input id="bot-tel" className="input" inputMode="numeric" placeholder="5567999999999" value={settings.telefone_dono} onChange={(e) => set('telefone_dono', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="bot-modo" className="label">Quando responder</label>
                  <select id="bot-modo" className="input" value={settings.modo} onChange={(e) => set('modo', e.target.value as BotSettings['modo'])}>
                    <option value="sempre">Sempre (24 horas)</option>
                    <option value="fora_do_horario">Só quando a loja está fechada</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="bot-modelo" className="label">Inteligência</label>
                  <select id="bot-modelo" className="input" value={settings.modelo} onChange={(e) => set('modelo', e.target.value)}>
                    {Object.entries(MODELS).map(([id, m]) => (
                      <option key={id} value={id}>{m.label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-muted">{model.hint}</p>
                </div>
              </div>
              <div>
                <label htmlFor="bot-inst" className="label">Regras da casa (opcional)</label>
                <textarea id="bot-inst" className="input min-h-28" maxLength={2000} value={settings.instrucoes} onChange={(e) => set('instrucoes', e.target.value)} placeholder="Ex.: Chave Pix: CNPJ 00.000.000/0001-00. Terça tem 10% no combo. Não entregamos depois das 23h." />
                <p className="mt-1 text-xs text-muted">Escreva do seu jeito. O robô segue essas regras, mas nunca muda preços do cardápio.</p>
              </div>
              <NumField id="bot-usd" label="Cotação do dólar (só para estimar custo)" prefix="R$" value={settings.usd_brl} onChange={(v) => set('usd_brl', v)} className="max-w-48" />
              <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar assistente'}</Button>
            </div>
          </Card>
        </form>
        <Simulator settings={settings} />
        <Card title="Gasto com IA neste mês" description="Estimativa pelo consumo real de tokens e pela cotação acima.">
          <p className="text-3xl font-bold">{formatPrice(cost)}</p>
          <p className="mt-1 text-sm text-muted">{usage?.mensagens ?? 0} mensagens do cliente respondidas · modelo {model.label.split(' —')[0]}</p>
        </Card>
        <Conversations list={convs} reload={reload} />
      </div>
    </>
  )
}

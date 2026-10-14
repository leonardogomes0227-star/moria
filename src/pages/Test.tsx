import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { WaText } from '@/components/WaText'
import { config } from '@/lib/config'
import { repo } from '@/lib/data'
import { createDemoAgent } from '@/lib/demoAgent'
import { openStatus } from '@/lib/hours'
import { useMenuStore } from '@/store/menu'
import { useSettings } from '@/store/settings'

interface Msg {
  from: 'cliente' | 'robo'
  text: string
}

const SUGGESTIONS = ['Oi, qual o horário?', 'Quero ver o cardápio', 'Quero um X-Bacon e uma Coca', 'Quero falar com uma pessoa']
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const typingMs = (t: string) => Math.min(2200, Math.max(700, t.length * 22))

/** Página pública para o dono experimentar o robô de atendimento, com visual de WhatsApp. */
export default function Test() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [live, setLive] = useState<boolean | null>(null)
  const [notice, setNotice] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const agentRef = useRef<ReturnType<typeof createDemoAgent> | null>(null)

  useEffect(() => {
    document.title = `Teste o atendente · ${config.name}`
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.append(meta)
    return () => meta.remove()
  }, [])
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [msgs, typing])

  const send = async (raw: string) => {
    const t = raw.trim()
    if (!t || typing) return
    const history = msgs.map((m) => ({ role: m.from === 'cliente' ? 'user' : 'assistant', content: m.text }))
    setMsgs((m) => [...m, { from: 'cliente', text: t }])
    setText('')
    setTyping(true)
    setNotice('')
    let parts: string[]
    let order = false
    let handoff = false
    try {
      const res = await fetch('/api/demo-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: t, history }) })
      if (res.status === 404 || res.status === 503 || res.status === 405) throw new Error('offline')
      const data = (await res.json()) as { parts?: string[]; error?: string; orderCreated?: boolean }
      if (!res.ok || !data.parts?.length) {
        setNotice(data.error ?? 'Não consegui responder agora.')
        setTyping(false)
        return
      }
      setLive(true)
      parts = data.parts
      order = Boolean(data.orderCreated)
    } catch {
      setLive(false)
      await wait(600)
      await useMenuStore.getState().load()
      const { settings } = useSettings.getState()
      agentRef.current ??= createDemoAgent(useMenuStore.getState().items, settings, openStatus(settings.hours).label)
      const turn = agentRef.current.reply(t)
      parts = turn.parts
      handoff = Boolean(turn.handoff)
      if (turn.order) {
        order = true
        if (repo.mode === 'local') await repo.orders.create(turn.order).catch(() => undefined)
      }
    }
    for (const [i, p] of parts.entries()) {
      if (i > 0) setTyping(true)
      await wait(typingMs(p))
      setMsgs((m) => [...m, { from: 'robo', text: p }])
      setTyping(false)
    }
    if (order) setNotice('✅ Pedido de teste registrado. No painel da loja ele aparece em Pedidos, com a etiqueta WhatsApp.')
    else if (handoff) setNotice('🙋 O robô passou a conversa para uma pessoa e o dono recebe um aviso no WhatsApp.')
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    void send(text)
  }

  return (
    <main className="mx-auto flex h-[100dvh] max-w-xl flex-col bg-[#0b141a] text-white">
      <header className="flex items-center gap-3 border-b border-white/10 bg-[#202c33] px-4 py-3">
        <Link to="/" aria-label="Voltar ao site" className="shrink-0">
          <Logo size={40} showText={false} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{config.name}</p>
          <p className="text-xs text-[#8696a0]" aria-live="polite">
            {typing ? 'digitando…' : 'online · atendente virtual'}
          </p>
        </div>
        <Link to="/demo" className="shrink-0 rounded-pill border border-white/15 px-3 py-1.5 text-xs text-[#8696a0] hover:bg-white/10">
          Ver o resto
        </Link>
      </header>
      <p className="bg-[#182229] px-4 py-2 text-center text-xs text-[#8696a0]">
        {live === false ? 'Demonstração do fluxo de atendimento. Com a IA ligada, o robô entende conversa livre, áudio e foto.' : 'Conversa de teste: nenhum pedido real é feito.'}
      </p>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4" role="log" aria-live="polite" aria-label="Conversa">
        {msgs.length === 0 && (
          <div className="mx-auto mt-6 max-w-xs space-y-2 text-center">
            <p className="text-sm text-[#8696a0]">Converse como se fosse um cliente. Experimente:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => void send(s)} className="rounded-full border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <p key={i} className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[15px] leading-snug ${m.from === 'cliente' ? 'ml-auto rounded-br-sm bg-[#005c4b]' : 'rounded-bl-sm bg-[#202c33]'}`}>
            <WaText text={m.text} />
          </p>
        ))}
        {typing && (
          <p className="w-16 rounded-2xl rounded-bl-sm bg-[#202c33] px-3 py-2 text-center text-lg leading-none tracking-widest text-[#8696a0]" aria-hidden>
            •••
          </p>
        )}
        {notice && <p className="mx-auto max-w-xs rounded-lg bg-white/10 px-3 py-2 text-center text-xs">{notice}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="flex gap-2 bg-[#202c33] p-3">
        <label htmlFor="t-msg" className="sr-only">
          Mensagem
        </label>
        <input id="t-msg" value={text} onChange={(e) => setText(e.target.value)} maxLength={400} autoComplete="off" placeholder="Digite uma mensagem" className="min-w-0 flex-1 rounded-full bg-[#2a3942] px-4 py-2.5 text-[15px] outline-none placeholder:text-[#8696a0] focus-visible:ring-2 focus-visible:ring-[#15803D]" />
        <button type="submit" disabled={!text.trim() || typing} className="rounded-full bg-[#15803D] px-5 font-semibold disabled:opacity-50">
          Enviar
        </button>
      </form>
    </main>
  )
}

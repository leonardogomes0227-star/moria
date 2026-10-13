import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BellIcon, HelpIcon, MoreIcon } from '@/components/Icons'
import { Dialog } from '@/components/Dialog'
import { Logo } from '@/components/Logo'
import { Toaster } from '@/components/Toaster'
import { fetchSettings } from '@/lib/api'
import { repo } from '@/lib/data'
import type { Order } from '@/lib/types'
import { toast } from '@/store/toast'
import { useSettings } from '@/store/settings'
import { signOut } from './auth'
import { Guide } from './Guide'
import { SECTIONS as NAV } from './guide'
import { beep, isSoundOn, setSoundOn } from './notify'
import { Spinner } from './ui'
import { useLoad } from './useLoad'

export interface AdminContext {
  orders: Order[]
  ordersError: string
  reloadOrders: () => Promise<void>
}

const POLL_MS = 15_000
const GUIDE_KEY = 'moria-admin:guide'

export function AdminLayout({ email }: { email: string }) {
  const setSettings = useSettings((s) => s.setSettings)
  const [ready, setReady] = useState(false)
  const [sound, setSound] = useState(isSoundOn)
  const [moreOpen, setMoreOpen] = useState(false)
  const { pathname } = useLocation()
  const { data, error, reload } = useLoad(() => repo.orders.list(), POLL_MS)
  const orders = data ?? []
  const newCount = orders.filter((o) => o.status === 'novo').length
  const previousNew = useRef<number | null>(null)
  const [guideOpen, setGuideOpen] = useState(() => {
    try {
      return localStorage.getItem(GUIDE_KEY) !== 'seen'
    } catch {
      return false
    }
  })

  const closeGuide = () => {
    setGuideOpen(false)
    try {
      localStorage.setItem(GUIDE_KEY, 'seen')
    } catch {
      /* sem armazenamento: o guia reabre na próxima visita */
    }
  }

  // As configurações atuais precisam estar carregadas antes de qualquer tela editá-las.
  useEffect(() => {
    let cancelled = false
    void fetchSettings().then((remote) => {
      if (remote && !cancelled) setSettings(remote)
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [setSettings])

  // Avisa quando chega pedido novo (aviso visual + bipe + contador no título da aba).
  useEffect(() => {
    if (data === null) return
    if (previousNew.current !== null && newCount > previousNew.current) {
      toast('Novo pedido recebido!', 'info')
      if (sound) beep()
    }
    previousNew.current = newCount
  }, [newCount, data, sound])

  useEffect(() => {
    document.title = newCount > 0 ? `(${newCount}) Painel | Moriá` : 'Painel | Moriá'
  }, [newCount])

  const context: AdminContext = { orders, ordersError: error, reloadOrders: reload }

  const guideButton = (
    <button
      type="button"
      onClick={() => setGuideOpen(true)}
      className="flex w-full items-center gap-2 rounded-xl border border-ember/50 bg-ember/10 px-3 py-2.5 text-left text-sm font-semibold text-ember hover:bg-ember/20"
    >
      <HelpIcon size={18} className="shrink-0" /> O que é cada botão?
    </button>
  )

  return (
    <div className="admin-root min-h-svh lg:flex">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-line bg-surface/70 p-5 lg:flex">
        <div className="sticky top-5 flex h-[calc(100svh-2.5rem)] flex-col">
          <Logo size={48} />
          <p className="mb-4 mt-3 text-xs uppercase tracking-widest text-muted">
            Painel da loja
          </p>
          {guideButton}
          <nav aria-label="Painel" className="mt-4 flex-1 space-y-1">
            {NAV.map(({ to, label, title, short, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    isActive
                      ? 'bg-brand text-white shadow-glow'
                      : 'text-white/80 hover:bg-white/5'
                  }`
                }
              >
                <Icon size={22} className="shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-tight">
                    {label === 'Site' ? title : label}
                  </span>
                  <span className="block truncate text-xs opacity-75">{short}</span>
                </span>
                {to === '/admin/pedidos' && newCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-bold text-brand">
                    {newCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="space-y-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setSound(!sound)
                setSoundOn(!sound)
              }}
              aria-pressed={sound}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-white/75 hover:bg-white/5"
            >
              <BellIcon size={18} className="shrink-0" />
              <span>
                Som de novo pedido: <strong>{sound ? 'ligado' : 'desligado'}</strong>
              </span>
            </button>
            <a
              href="/"
              className="block rounded-xl px-3 py-2 text-white/75 hover:bg-white/5"
            >
              Ver o site ↗
            </a>
            <p className="truncate px-3 text-xs text-muted" title={email}>
              {email}
            </p>
            <button
              type="button"
              onClick={() => void signOut()}
              className="block w-full rounded-xl border border-line px-3 py-2 text-left hover:bg-white/5"
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 pb-24 lg:pb-0">
        <header className="flex items-center justify-between gap-2 border-b border-line bg-surface/70 px-4 py-3 lg:hidden">
          <Logo size={36} showText={false} />
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="flex items-center gap-1.5 rounded-pill border border-ember/50 bg-ember/10 px-3 py-1.5 text-sm font-semibold text-ember"
          >
            <HelpIcon size={16} /> O que é cada botão?
          </button>
          <div className="flex items-center gap-1 text-sm">
            <a href="/" className="rounded-pill px-2 py-1.5 text-muted hover:text-white">
              Site
            </a>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-pill border border-line px-3 py-1.5"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {ready ? <Outlet key={pathname} context={context} /> : <Spinner />}
        </main>
      </div>

      <nav
        aria-label="Painel"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-bg/95 backdrop-blur lg:hidden"
      >
        {NAV.filter((n) => n.primary).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${isActive ? 'text-ember' : 'text-white/70'}`
            }
          >
            <Icon size={22} />
            {label}
            {to === '/admin/pedidos' && newCount > 0 && (
              <span className="absolute right-[22%] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {newCount}
              </span>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-white/70"
        >
          <MoreIcon size={22} />
          Mais
        </button>
      </nav>
      <Dialog open={moreOpen} onClose={() => setMoreOpen(false)} title="Mais opções">
        <ul className="space-y-2 p-4">
          {NAV.filter((n) => !n.primary).map(({ to, title, short, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-line bg-bg p-4"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-white">
                  <Icon size={22} />
                </span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="block text-sm text-muted">{short}</span>
                </span>
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false)
                setSound(!sound)
                setSoundOn(!sound)
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-line bg-bg p-4 text-left"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
                <BellIcon size={22} />
              </span>
              <span>
                <span className="block font-bold">Som de novo pedido</span>
                <span className="block text-sm text-muted">
                  {sound ? 'Ligado: toque para desligar' : 'Desligado: toque para ligar'}
                </span>
              </span>
            </button>
          </li>
        </ul>
      </Dialog>
      <Guide open={guideOpen} onClose={closeGuide} />
      <Toaster />
    </div>
  )
}

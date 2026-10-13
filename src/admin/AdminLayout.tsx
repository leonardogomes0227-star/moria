import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BellIcon,
  BurgerIcon,
  HelpIcon,
  HomeIcon,
  ImageIcon,
  ReceiptIcon,
  SettingsIcon,
} from '@/components/Icons'
import { Logo } from '@/components/Logo'
import { Toaster } from '@/components/Toaster'
import { fetchSettings } from '@/lib/api'
import { repo } from '@/lib/data'
import type { Order } from '@/lib/types'
import { toast } from '@/store/toast'
import { useSettings } from '@/store/settings'
import { signOut } from './auth'
import { beep, isSoundOn, setSoundOn } from './notify'
import { Spinner } from './ui'
import { useLoad } from './useLoad'

export interface AdminContext {
  orders: Order[]
  ordersError: string
  reloadOrders: () => Promise<void>
}

const NAV = [
  { to: '/admin', label: 'Início', icon: HomeIcon, end: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ReceiptIcon },
  { to: '/admin/cardapio', label: 'Cardápio', icon: BurgerIcon },
  { to: '/admin/loja', label: 'Loja', icon: SettingsIcon },
  { to: '/admin/conteudo', label: 'Site', icon: ImageIcon },
  { to: '/admin/ajuda', label: 'Ajuda', icon: HelpIcon },
]

const POLL_MS = 15_000

export function AdminLayout({ email }: { email: string }) {
  const setSettings = useSettings((s) => s.setSettings)
  const [ready, setReady] = useState(false)
  const [sound, setSound] = useState(isSoundOn)
  const { pathname } = useLocation()
  const { data, error, reload } = useLoad(() => repo.orders.list(), POLL_MS)
  const orders = data ?? []
  const newCount = orders.filter((o) => o.status === 'novo').length
  const previousNew = useRef<number | null>(null)

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

  return (
    <div className="admin-root min-h-svh lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface/70 p-5 lg:flex">
        <div className="sticky top-5 flex h-[calc(100svh-2.5rem)] flex-col">
          <Logo size={48} />
          <p className="mb-6 mt-3 text-xs uppercase tracking-widest text-muted">
            Painel da loja
          </p>
          <nav aria-label="Painel" className="flex-1 space-y-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors ${
                    isActive
                      ? 'bg-brand text-white shadow-glow'
                      : 'text-white/75 hover:bg-white/5'
                  }`
                }
              >
                <Icon size={20} />
                <span className="flex-1">
                  {label === 'Site' ? 'Conteúdo do site' : label}
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
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-white/75 hover:bg-white/5"
            >
              <BellIcon size={18} /> Som de novo pedido:{' '}
              <strong>{sound ? 'ligado' : 'desligado'}</strong>
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
        <header className="flex items-center justify-between border-b border-line bg-surface/70 px-4 py-3 lg:hidden">
          <Logo size={36} />
          <div className="flex items-center gap-2 text-sm">
            <a href="/" className="rounded-pill px-3 py-1.5 text-muted hover:text-white">
              Ver site
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
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-line bg-bg/95 backdrop-blur lg:hidden"
      >
        {NAV.map(({ to, label, icon: Icon, end }) => (
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
      </nav>
      <Toaster />
    </div>
  )
}

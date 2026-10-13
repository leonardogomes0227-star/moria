import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoginForm } from '@/admin/LoginForm'
import { MenuManager } from '@/admin/MenuManager'
import { SettingsForm } from '@/admin/SettingsForm'
import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'
import { useSession } from '@/hooks/useSession'
import { fetchSettings } from '@/lib/api'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { useSettings } from '@/store/settings'

type Tab = 'cardapio' | 'config'

function NotConfigured() {
  return (
    <main className="grid min-h-svh place-items-center px-4">
      <div className="card max-w-md space-y-3 p-7 text-center">
        <Logo className="justify-center" />
        <h1 className="text-2xl">Supabase não configurado</h1>
        <p className="text-muted">
          Defina <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no{' '}
          <code>.env</code> (veja o README) para usar o painel. Enquanto isso, o site usa{' '}
          <code>src/data/menu.ts</code>.
        </p>
        <Link to="/" className="inline-block text-ember underline">
          Voltar ao site
        </Link>
      </div>
    </main>
  )
}

function Dashboard() {
  const [tab, setTab] = useState<Tab>('cardapio')
  const setSettings = useSettings((s) => s.setSettings)
  const [ready, setReady] = useState(false)

  // Formulário de configurações parte dos valores atuais do banco.
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

  return (
    <div className="min-h-svh">
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between">
          <Logo size={36} />
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted hover:text-white">
              Ver site
            </Link>
            <Button
              variant="ghost"
              className="!px-4 !py-2 text-sm"
              onClick={() => void getSupabase().then((sb) => sb?.auth.signOut())}
            >
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="container-x max-w-3xl space-y-6 py-8">
        <h1 className="text-3xl">Painel</h1>
        <div role="tablist" aria-label="Seções do painel" className="flex gap-2">
          {(
            [
              ['cardapio', 'Cardápio'],
              ['config', 'Configurações'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-pill px-5 py-2 font-semibold ${tab === id ? 'bg-brand' : 'bg-white/5 hover:bg-white/10'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === 'cardapio' ? (
          <MenuManager />
        ) : ready ? (
          <SettingsForm />
        ) : (
          <p className="text-muted">Carregando…</p>
        )}
      </main>
    </div>
  )
}

export default function Admin() {
  const session = useSession()

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex,nofollow'
    document.head.appendChild(meta)
    document.title = 'Painel | Moriá Hamburgueria'
    return () => meta.remove()
  }, [])

  if (!isSupabaseConfigured) return <NotConfigured />
  if (session === undefined) return <p className="p-8 text-muted">Carregando…</p>
  return session ? <Dashboard /> : <LoginForm />
}

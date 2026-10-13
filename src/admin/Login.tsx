import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'
import { config } from '@/lib/config'
import { isSupabaseConfigured } from '@/lib/supabase'
import { signIn } from './auth'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setError((await signIn(email, password)) ?? '')
    setBusy(false)
  }

  return (
    <main className="admin-root grid min-h-svh place-items-center px-4 py-10">
      <div className="w-full max-w-sm space-y-4">
        <form onSubmit={submit} className="card space-y-5 p-7">
          <Logo size={56} />
          <div>
            <h1 className="text-2xl">Painel administrativo</h1>
            <p className="mt-1 text-sm text-muted">
              Entre para gerenciar pedidos, cardápio e as configurações da loja.
            </p>
          </div>
          <div>
            <label htmlFor="adm-email" className="label">
              E-mail
            </label>
            <input
              id="adm-email"
              type="email"
              required
              autoComplete="username"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="adm-pass" className="label">
              Senha
            </label>
            <input
              id="adm-pass"
              type="password"
              required
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-[#FF9A9A]">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        {!isSupabaseConfigured && (
          <div className="rounded-2xl border border-ember/40 bg-ember/10 p-4 text-sm">
            <p className="font-semibold text-ember">Modo demonstração</p>
            <p className="mt-1 text-white/80">
              O banco de dados ainda não foi conectado: tudo que você fizer fica salvo só
              neste navegador. Para testar, use:
            </p>
            <p className="mt-2 font-mono text-white">
              {config.demo.email}
              <br />
              {config.demo.password}
            </p>
            <button
              type="button"
              className="mt-3 font-semibold text-ember underline"
              onClick={() => {
                setEmail(config.demo.email)
                setPassword(config.demo.password)
              }}
            >
              Preencher automaticamente
            </button>
          </div>
        )}
        <p className="text-center text-sm">
          <Link to="/" className="text-muted hover:text-white">
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </main>
  )
}

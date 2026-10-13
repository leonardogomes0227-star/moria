import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { DemoCredentials } from '@/components/DemoCredentials'
import { Logo } from '@/components/Logo'
import { config } from '@/lib/config'
import { isSupabaseConfigured } from '@/lib/supabase'
import { signIn } from './auth'

export function Login() {
  const [params] = useSearchParams()
  const prefill = !isSupabaseConfigured && params.get('demo') === '1'
  const [email, setEmail] = useState(prefill ? config.demo.email : '')
  const [password, setPassword] = useState(prefill ? config.demo.password : '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e?: FormEvent, creds = { email, password }) => {
    e?.preventDefault()
    setBusy(true)
    setError('')
    setError((await signIn(creds.email, creds.password)) ?? '')
    setBusy(false)
  }

  return (
    <main className="admin-root grid min-h-svh place-items-center px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <form onSubmit={(e) => void submit(e)} className="card space-y-5 p-7">
          <Logo size={56} />
          <div>
            <h1 className="text-2xl">Painel do dono</h1>
            <p className="mt-1 text-sm text-muted">
              Área para gerenciar <strong className="text-white">pedidos</strong>,{' '}
              <strong className="text-white">cardápio</strong>,{' '}
              <strong className="text-white">horários</strong> e{' '}
              <strong className="text-white">preços</strong> da hamburgueria. Entre com
              seu e-mail e senha.
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
            {busy ? 'Entrando…' : 'Entrar no painel'}
          </Button>
        </form>

        {!isSupabaseConfigured && (
          <section
            aria-label="Acesso de demonstração"
            className="card space-y-4 border-ember/50 p-6"
          >
            <div>
              <p className="font-script text-xl text-ember">acesso de demonstração</p>
              <p className="mt-1 text-sm text-white/80">
                Este é um painel de teste: tudo que você fizer fica salvo só neste
                navegador. Use os dados abaixo para entrar:
              </p>
            </div>
            <DemoCredentials />
            <Button
              variant="ghost"
              className="w-full"
              disabled={busy}
              onClick={() => void submit(undefined, config.demo)}
            >
              Entrar com um clique (usa esses dados)
            </Button>
          </section>
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

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'
import { getSupabase } from '@/lib/supabase'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const supabase = await getSupabase()
    if (!supabase) return
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError('E-mail ou senha inválidos.')
    setBusy(false)
  }

  return (
    <main className="grid min-h-svh place-items-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-5 p-7">
        <Logo />
        <h1 className="text-2xl">Painel administrativo</h1>
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
          <p role="alert" className="text-sm text-[#FF8A8A]">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </main>
  )
}

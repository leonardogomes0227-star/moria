import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { config } from '@/lib/config'
import { isSupabaseConfigured } from '@/lib/supabase'
import { DemoCredentials } from './DemoCredentials'
import { Dialog } from './Dialog'
import { CloseIcon, SettingsIcon } from './Icons'

const SEEN_KEY = 'moria-demo:invite'

const FEATURES = [
  [
    'Pedidos',
    'cada pedido do site chega aqui, com bipe, comanda para imprimir e botão para avisar o cliente.',
  ],
  [
    'Cardápio',
    'muda preço, foto e descrição, liga/desliga item que acabou e cria produtos novos.',
  ],
  [
    'Loja',
    'horários, taxa de entrega, pedido mínimo, formas de pagamento e aviso do topo.',
  ],
  ['Início', 'vendas do dia, ticket médio e os itens que mais saem.'],
]

/**
 * Só no modo demonstração: botão fixo + convite que explica o painel do dono
 * e mostra, logo abaixo, o e-mail e a senha de teste.
 */
export function AdminDemoButton() {
  const [open, setOpen] = useState(false)
  const [invite, setInvite] = useState(false)

  useEffect(() => {
    if (isSupabaseConfigured) return
    try {
      if (sessionStorage.getItem(SEEN_KEY) === '1') return
    } catch {
      /* sem sessionStorage: mostra o convite */
    }
    const id = window.setTimeout(() => setInvite(true), 7000)
    return () => window.clearTimeout(id)
  }, [])

  if (isSupabaseConfigured) return null

  const dismissInvite = () => {
    setInvite(false)
    try {
      sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* sem sessionStorage: o convite pode reaparecer */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 hidden items-center gap-2 rounded-pill border border-ember/60 bg-bg/90 px-4 py-2.5 text-sm font-semibold shadow-glow backdrop-blur transition-colors hover:bg-ember/20 sm:inline-flex"
      >
        <SettingsIcon size={18} className="text-ember" />
        Ver painel do dono{' '}
        <span className="text-xs font-normal text-muted">(demonstração)</span>
      </button>

      <AnimatePresence>
        {invite && !open && (
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-x-3 bottom-24 z-40 rounded-2xl border border-ember/50 bg-bg/95 p-4 shadow-glow backdrop-blur sm:bottom-20 sm:left-4 sm:right-auto sm:w-80"
            aria-label="Convite para conhecer o painel do dono"
          >
            <button
              type="button"
              onClick={dismissInvite}
              aria-label="Fechar convite"
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"
            >
              <CloseIcon size={16} />
            </button>
            <p className="font-script text-lg text-ember">👋 quer ver os bastidores?</p>
            <p className="mt-1 pr-6 text-sm text-white/85">
              Você está vendo o site que o <strong>cliente</strong> vê. Existe também um
              painel para o <strong>dono</strong> controlar pedidos, cardápio e preços.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  dismissInvite()
                  setOpen(true)
                }}
                className="rounded-pill bg-brand px-4 py-2 text-sm font-semibold hover:bg-brand-light"
              >
                Conhecer o painel
              </button>
              <button
                type="button"
                onClick={dismissInvite}
                className="rounded-pill px-3 py-2 text-sm text-muted hover:text-white"
              >
                Agora não
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Painel do dono (demonstração)"
        variant="center"
      >
        <div className="space-y-5 p-5">
          <p className="text-white/85">
            Além do site que o cliente vê, a {config.name} tem um{' '}
            <strong>painel administrativo</strong>. Nele o dono controla tudo sozinho, sem
            depender de ninguém:
          </p>
          <ul className="space-y-2">
            {FEATURES.map(([title, text]) => (
              <li
                key={title}
                className="rounded-xl border border-line bg-surface-2 p-3 text-sm"
              >
                <strong className="text-ember">{title}:</strong>{' '}
                <span className="text-white/80">{text}</span>
              </li>
            ))}
          </ul>
          <div>
            <p className="mb-2 font-script text-lg text-ember">dados de acesso (teste)</p>
            <DemoCredentials />
          </div>
          <a
            href="/admin?demo=1"
            className="flex w-full items-center justify-center gap-2 rounded-pill bg-brand px-6 py-3.5 text-lg font-semibold hover:bg-brand-light"
          >
            Entrar no painel agora →
          </a>
          <p className="text-center text-xs text-muted">
            Modo demonstração: o que você mexer fica salvo só neste navegador. Faça um
            pedido no site e veja ele aparecer lá.
          </p>
        </div>
      </Dialog>
    </>
  )
}

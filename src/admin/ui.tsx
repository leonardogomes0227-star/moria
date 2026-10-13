import type { ReactNode } from 'react'
import { HelpIcon } from '@/components/Icons'
import type { OrderStatus, OrderType } from '@/lib/types'
import { statusLabel } from './orderStatus'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-3xl">{title}</h1>
        <p className="mt-1 text-muted">{description}</p>
      </div>
      {actions}
    </div>
  )
}

/** Caixa de ajuda: explica, em linguagem simples, o que a tela faz. */
export function HelpBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="mb-6 flex gap-3 rounded-2xl border border-ember/30 bg-ember/5 p-4 text-sm text-white/85">
      <HelpIcon size={20} className="mt-0.5 shrink-0 text-ember" />
      <div className="space-y-1">
        <p className="font-semibold text-ember">{title}</p>
        <div className="space-y-1 text-white/80">{children}</div>
      </div>
    </aside>
  )
}

export function Card({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="card p-5 sm:p-6">
      {title && <h2 className="text-xl">{title}</h2>}
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className={title ? 'mt-4' : ''}>{children}</div>
    </section>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#1FA855]' : 'bg-white/20'}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`}
      />
    </button>
  )
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  novo: 'bg-brand/20 text-[#FF9A9A]',
  preparo: 'bg-ember/20 text-[#FFB27A]',
  entrega: 'bg-[#2563EB]/20 text-[#9DBBFF]',
  concluido: 'bg-[#1FA855]/20 text-[#7BE3A2]',
  cancelado: 'bg-white/10 text-muted',
}

export function StatusBadge({ status, tipo }: { status: OrderStatus; tipo: OrderType }) {
  return (
    <span
      className={`inline-flex rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}
    >
      {statusLabel(status, tipo)}
    </span>
  )
}

export function Spinner({ label = 'Carregando…' }: { label?: string }) {
  return (
    <p className="py-10 text-center text-muted" role="status">
      {label}
    </p>
  )
}

export function ErrorBox({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <p
      role="alert"
      className="mb-4 rounded-xl border border-brand/50 bg-brand/10 px-4 py-3 text-sm text-[#FF9A9A]"
    >
      {message}{' '}
      {onRetry && (
        <button type="button" className="font-semibold underline" onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </p>
  )
}

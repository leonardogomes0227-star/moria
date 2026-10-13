import { config } from '@/lib/config'
import { CopyButton } from './CopyButton'

/** Bloco com e-mail e senha da demonstração, em letras grandes e com botão de copiar. */
export function DemoCredentials() {
  const rows = [
    { label: 'E-mail', value: config.demo.email },
    { label: 'Senha', value: config.demo.password },
  ]
  return (
    <dl className="space-y-2 rounded-2xl border-2 border-dashed border-ember/60 bg-ember/10 p-4">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-sm font-semibold uppercase tracking-wider text-ember">
            {r.label}
          </dt>
          <dd className="flex items-center gap-3">
            <code className="select-all rounded-lg bg-black/40 px-3 py-1.5 font-mono text-lg font-bold text-white">
              {r.value}
            </code>
            <CopyButton text={r.value} label={r.label.toLowerCase()} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

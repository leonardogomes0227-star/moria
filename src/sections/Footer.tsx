import { InstagramIcon, WhatsappIcon } from '@/components/Icons'
import { Logo } from '@/components/Logo'
import { DAY_NAMES, config } from '@/lib/config'
import { formatHours } from '@/lib/hours'
import { whatsappUrl } from '@/lib/whatsapp'
import { useSettings } from '@/store/settings'

export function Footer() {
  const { hours, whatsapp } = useSettings((s) => s.settings)
  const summary = hours
    .map((h, day) => ({ day, h }))
    .filter(({ h }) => h)
    .map(({ day, h }) => `${DAY_NAMES[day].slice(0, 3)} ${formatHours(h)}`)

  return (
    <footer className="border-t border-line bg-surface/60 pb-24 pt-12 sm:pb-12">
      <div className="container-x grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted">{config.slogan}</p>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-widest text-ember">
            Contato
          </h2>
          <ul className="space-y-2 text-white/90">
            <li>
              <a
                href={config.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-ember"
              >
                <InstagramIcon size={20} /> @{config.instagram.handle}
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl(whatsapp, config.messages.headerWhatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-ember"
              >
                <WhatsappIcon size={20} /> WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-widest text-ember">
            Horários
          </h2>
          <ul className="space-y-1 text-sm text-muted">
            {summary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-x mt-10 flex flex-col items-center justify-between gap-2 border-t border-line pt-6 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {config.name}
        </p>
        <p className="text-xs">
          Site por{' '}
          <a
            href={config.credit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:text-white hover:underline"
          >
            {config.credit.label}
          </a>
        </p>
      </div>
    </footer>
  )
}

import { ClockIcon } from '@/components/Icons'
import { OpenBadge } from '@/components/OpenBadge'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { useOpenNow } from '@/hooks/useOpenNow'
import { DAY_NAMES } from '@/lib/config'
import { formatHours } from '@/lib/hours'
import { useSettings } from '@/store/settings'

export function Hours() {
  const hours = useSettings((s) => s.settings.hours)
  const { today } = useOpenNow()

  return (
    <Section id="funcionamento" eyebrow="Funcionamento" title="Horário de atendimento">
      <Reveal>
        <div className="card mx-auto max-w-xl p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-lg font-semibold">
              <ClockIcon /> Horários
            </span>
            <OpenBadge />
          </div>
          <dl className="divide-y divide-line">
            {hours.map((h, day) => (
              <div
                key={DAY_NAMES[day]}
                className={`flex justify-between py-3 ${day === today ? 'font-semibold text-white' : 'text-muted'}`}
              >
                <dt>
                  {DAY_NAMES[day]}
                  {day === today && <span className="ml-2 text-xs text-ember">hoje</span>}
                </dt>
                <dd>{formatHours(h)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </Section>
  )
}

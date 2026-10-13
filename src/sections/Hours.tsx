import { useEffect, useState } from 'react'
import { ClockIcon } from '@/components/Icons'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { DAY_NAMES } from '@/lib/config'
import { formatHours, isOpenNow, nowInStoreTz } from '@/lib/hours'
import { useSettings } from '@/store/settings'

export function Hours() {
  const hours = useSettings((s) => s.settings.hours)
  const [tick, setTick] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setTick(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const open = isOpenNow(hours, tick)
  const today = nowInStoreTz(tick).day

  return (
    <Section id="funcionamento" eyebrow="Funcionamento" title="Horário de atendimento">
      <Reveal>
        <div className="card mx-auto max-w-xl p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-lg font-semibold">
              <ClockIcon /> Horários
            </span>
            <span
              role="status"
              className={`inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-sm font-bold ${
                open ? 'bg-[#1FA855]/15 text-[#4ADE80]' : 'bg-brand/15 text-[#FF8A8A]'
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${open ? 'animate-pulse bg-[#4ADE80]' : 'bg-[#FF6B6B]'}`}
              />
              {open ? 'Aberto agora' : 'Fechado'}
            </span>
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

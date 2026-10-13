import type { WeekHours } from '../../src/lib/types.ts'

/** Cópia enxuta de src/lib/hours.ts (o servidor não importa código do site). */
const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

export function nowInTz(date: Date, timeZone: string): { day: number; minutes: number; label: string } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '0'
  const day = WEEKDAYS[get('weekday')] ?? 0
  const minutes = Number(get('hour')) * 60 + Number(get('minute'))
  return { day, minutes, label: `${DAY_NAMES[day]}, ${get('hour')}:${get('minute')}` }
}

export function isOpenAt(hours: WeekHours, date: Date, timeZone: string): boolean {
  const { day, minutes } = nowInTz(date, timeZone)
  const today = hours[day]
  const overnight = (h: { open: string; close: string }) => toMinutes(h.close) <= toMinutes(h.open)
  if (today) {
    const open = toMinutes(today.open)
    const close = toMinutes(today.close)
    if (overnight(today) ? minutes >= open : minutes >= open && minutes < close) return true
  }
  const yesterday = hours[(day + 6) % 7]
  return !!yesterday && overnight(yesterday) && minutes < toMinutes(yesterday.close)
}

export const describeHours = (hours: WeekHours): string =>
  hours.map((h, i) => `${DAY_NAMES[i]}: ${h ? `${h.open} às ${h.close}` : 'fechado'}`).join('; ')

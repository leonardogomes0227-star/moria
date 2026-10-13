import { config } from './config'
import type { DayHours, WeekHours } from './types'

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

const WEEKDAYS: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

/** Dia da semana e minutos desde 00:00 na timezone da loja. */
export function nowInStoreTz(date = new Date()): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: config.timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0'
  return {
    day: WEEKDAYS[get('weekday')] ?? 0,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}

const isOvernight = (h: DayHours) => toMinutes(h.close) <= toMinutes(h.open)

export function isOpenNow(hours: WeekHours, date = new Date()): boolean {
  const { day, minutes } = nowInStoreTz(date)
  const today = hours[day]
  if (today) {
    const open = toMinutes(today.open)
    const close = toMinutes(today.close)
    if (isOvernight(today) ? minutes >= open : minutes >= open && minutes < close)
      return true
  }
  // Expediente de ontem que atravessou a meia-noite
  const yesterday = hours[(day + 6) % 7]
  return !!yesterday && isOvernight(yesterday) && minutes < toMinutes(yesterday.close)
}

export const formatHours = (h: DayHours | null): string =>
  h
    ? `${h.open.replace(':00', 'h').replace(':', 'h')} às ${h.close.replace(':00', 'h').replace(':', 'h')}`
    : 'Fechado'

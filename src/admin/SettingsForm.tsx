import { useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { saveSettings } from '@/lib/adminApi'
import { DAY_NAMES } from '@/lib/config'
import type { DeliveryFee, StoreSettings } from '@/lib/types'
import { useSettings } from '@/store/settings'

export function SettingsForm() {
  const current = useSettings((s) => s.settings)
  const setSettings = useSettings((s) => s.setSettings)
  const [form, setForm] = useState<StoreSettings>(current)
  const [fee, setFee] = useState(
    current.deliveryFee.mode === 'fixed'
      ? String(current.deliveryFee.amount).replace('.', ',')
      : '',
  )
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const setDay = (day: number, value: StoreSettings['hours'][number]) =>
    setForm((f) => ({ ...f, hours: f.hours.map((h, i) => (i === day ? value : h)) }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const whatsapp = form.whatsapp.replace(/\D/g, '')
    if (!/^55\d{10,11}$/.test(whatsapp))
      return setStatus({
        ok: false,
        text: 'WhatsApp deve estar no formato 55DDDNÚMERO (somente números).',
      })
    const amount = Number(fee.replace(',', '.'))
    const deliveryFee: DeliveryFee =
      form.deliveryFee.mode === 'tbd'
        ? { mode: 'tbd' }
        : { mode: 'fixed', amount: Number.isFinite(amount) && amount >= 0 ? amount : 0 }
    const next = { ...form, whatsapp, deliveryFee }
    setBusy(true)
    try {
      await saveSettings(next)
      setSettings(next)
      setStatus({ ok: true, text: 'Configurações salvas.' })
    } catch (err) {
      setStatus({
        ok: false,
        text: err instanceof Error ? err.message : 'Falha ao salvar.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="card space-y-4 p-5" aria-labelledby="cfg-geral">
        <h2 id="cfg-geral" className="text-xl">
          Geral
        </h2>
        <div>
          <label htmlFor="cfg-wa" className="label">
            WhatsApp (55 + DDD + número)
          </label>
          <input
            id="cfg-wa"
            inputMode="numeric"
            className="input"
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="cfg-notice" className="label">
            Aviso de topo (deixe vazio para ocultar)
          </label>
          <input
            id="cfg-notice"
            className="input"
            maxLength={120}
            placeholder="Hoje fechamos às 23h"
            value={form.notice}
            onChange={(e) => setForm({ ...form, notice: e.target.value })}
          />
        </div>
        <fieldset>
          <legend className="label">Taxa de entrega</legend>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="fee"
                className="accent-[#D61F1F]"
                checked={form.deliveryFee.mode === 'fixed'}
                onChange={() =>
                  setForm({ ...form, deliveryFee: { mode: 'fixed', amount: 0 } })
                }
              />{' '}
              Valor fixo
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="fee"
                className="accent-[#D61F1F]"
                checked={form.deliveryFee.mode === 'tbd'}
                onChange={() => setForm({ ...form, deliveryFee: { mode: 'tbd' } })}
              />{' '}
              A combinar
            </label>
            {form.deliveryFee.mode === 'fixed' && (
              <input
                aria-label="Valor da taxa (R$)"
                inputMode="decimal"
                className="input w-40"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            )}
          </div>
        </fieldset>
      </section>

      <section className="card p-5" aria-labelledby="cfg-horas">
        <h2 id="cfg-horas" className="mb-4 text-xl">
          Horário de funcionamento
        </h2>
        <p className="mb-4 text-sm text-muted">
          Se o fechamento for antes da abertura (ex.: 18:00 → 00:30), conta como madrugada
          do dia seguinte.
        </p>
        <ul className="space-y-3">
          {form.hours.map((h, day) => (
            <li key={DAY_NAMES[day]} className="flex flex-wrap items-center gap-3">
              <span className="w-24 font-medium">{DAY_NAMES[day]}</span>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[#D61F1F]"
                  checked={h === null}
                  onChange={(e) =>
                    setDay(
                      day,
                      e.target.checked ? null : { open: '18:00', close: '23:00' },
                    )
                  }
                />{' '}
                Fechado
              </label>
              {h && (
                <>
                  <input
                    type="time"
                    aria-label={`${DAY_NAMES[day]}: abre`}
                    className="input w-40"
                    value={h.open}
                    onChange={(e) => setDay(day, { ...h, open: e.target.value })}
                  />
                  <span className="text-muted">às</span>
                  <input
                    type="time"
                    aria-label={`${DAY_NAMES[day]}: fecha`}
                    className="input w-40"
                    value={h.close}
                    onChange={(e) => setDay(day, { ...h, close: e.target.value })}
                  />
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {status && (
        <p role="status" className={status.ok ? 'text-[#4ADE80]' : 'text-[#FF8A8A]'}>
          {status.text}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        {busy ? 'Salvando…' : 'Salvar configurações'}
      </Button>
    </form>
  )
}

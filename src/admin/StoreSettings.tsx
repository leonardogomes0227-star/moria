import { useState } from 'react'
import { Button } from '@/components/Button'
import { DAY_NAMES } from '@/lib/config'
import { repo } from '@/lib/data'
import {
  PAYMENT_METHODS,
  type DeliveryFee,
  type PaymentMethod,
  type StoreSettings as Settings,
} from '@/lib/types'
import { toast } from '@/store/toast'
import { useSettings } from '@/store/settings'
import { Card, HelpBox, PageHeader, Toggle } from './ui'

const toNumber = (v: string) => {
  const n = Number(v.replace(/[^\d,.-]/g, '').replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export default function StoreSettings() {
  const current = useSettings((s) => s.settings)
  const setSettings = useSettings((s) => s.setSettings)
  const [form, setForm] = useState<Settings>(current)
  const [fee, setFee] = useState(
    current.deliveryFee.mode === 'fixed'
      ? String(current.deliveryFee.amount).replace('.', ',')
      : '',
  )
  const [min, setMin] = useState(
    current.minOrder ? String(current.minOrder).replace('.', ',') : '',
  )
  const [busy, setBusy] = useState(false)

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setForm((f) => ({ ...f, [key]: value }))
  const setDay = (day: number, value: Settings['hours'][number]) =>
    set(
      'hours',
      form.hours.map((h, i) => (i === day ? value : h)),
    )
  const togglePayment = (p: PaymentMethod, on: boolean) =>
    set(
      'payments',
      PAYMENT_METHODS.filter((m) => (m === p ? on : form.payments.includes(m))),
    )

  const firstOpen = form.hours.find((h) => h !== null)
  const copyToAll = () =>
    firstOpen &&
    set(
      'hours',
      form.hours.map((h) => (h === null ? null : { ...firstOpen })),
    )

  const save = async () => {
    const whatsapp = form.whatsapp.replace(/\D/g, '')
    if (!/^55\d{10,11}$/.test(whatsapp))
      return toast(
        'WhatsApp inválido. Use 55 + DDD + número, só números (ex.: 5567998022571).',
        'error',
      )
    if (form.payments.length === 0)
      return toast('Deixe pelo menos uma forma de pagamento ativa.', 'error')
    const deliveryFee: DeliveryFee =
      form.deliveryFee.mode === 'tbd'
        ? { mode: 'tbd' }
        : { mode: 'fixed', amount: toNumber(fee) }
    const next: Settings = {
      ...form,
      whatsapp,
      deliveryFee,
      minOrder: toNumber(min),
      notice: form.notice.trim(),
    }
    setBusy(true)
    try {
      await repo.settings.save(next)
      setSettings(next)
      setForm(next)
      toast('Configurações salvas. O site já está atualizado.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Falha ao salvar.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Loja"
        description="Horários, entrega, pagamentos e avisos. Tudo que o cliente vê no site e no carrinho."
      />
      <HelpBox title="Atenção">
        <p>
          Nada é salvo até você clicar em <strong>Salvar configurações</strong> (botão no
          final da página).
        </p>
      </HelpBox>

      <div className="space-y-5">
        <Card
          title="Receber pedidos pelo site"
          description="Use para pausar rapidamente (cozinha lotada, acabou o gás…). Vale na hora, independente do horário."
        >
          <label className="flex items-center gap-3 font-medium">
            <Toggle
              label="Receber pedidos pelo site"
              checked={!form.paused}
              onChange={(v) => set('paused', !v)}
            />
            {form.paused
              ? 'Pausado: o cliente não consegue finalizar'
              : 'Recebendo pedidos'}
          </label>
          {form.paused && (
            <div className="mt-4">
              <label htmlFor="st-pause" className="label">
                Mensagem mostrada ao cliente
              </label>
              <input
                id="st-pause"
                className="input"
                maxLength={160}
                value={form.pauseMessage}
                onChange={(e) => set('pauseMessage', e.target.value)}
              />
            </div>
          )}
        </Card>

        <Card
          title="Aviso de topo"
          description="Faixa vermelha no topo do site. Ótimo para avisos do dia. Deixe vazio para esconder."
        >
          <label htmlFor="st-notice" className="label">
            Texto do aviso
          </label>
          <input
            id="st-notice"
            className="input"
            maxLength={120}
            placeholder="Ex.: Hoje fechamos às 23h"
            value={form.notice}
            onChange={(e) => set('notice', e.target.value)}
          />
        </Card>

        <Card
          title="Horário de funcionamento"
          description="Aparece na seção “Horários” e define o selo “Aberto agora / Fechado”. Se o fechamento for antes da abertura (ex.: 18:00 → 00:30), conta como madrugada do dia seguinte."
        >
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
          <button
            type="button"
            onClick={copyToAll}
            className="mt-4 text-sm font-semibold text-ember underline"
          >
            Copiar o primeiro horário para todos os dias abertos
          </button>
        </Card>

        <Card
          title="WhatsApp dos pedidos"
          description="Número que recebe as mensagens dos pedidos (e o botão “Pedir no WhatsApp”)."
        >
          <label htmlFor="st-wa" className="label">
            Número com DDI e DDD
          </label>
          <input
            id="st-wa"
            inputMode="numeric"
            className="input max-w-sm"
            placeholder="5567998022571"
            value={form.whatsapp}
            onChange={(e) => set('whatsapp', e.target.value)}
          />
          <p className="mt-1 text-xs text-muted">
            Formato: 55 + DDD + número, só dígitos.
          </p>
        </Card>

        <Card
          title="Entrega e pedido mínimo"
          description="Como a taxa aparece no carrinho e o valor mínimo para fechar um pedido."
        >
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
                    set('deliveryFee', { mode: 'fixed', amount: toNumber(fee) })
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
                  onChange={() => set('deliveryFee', { mode: 'tbd' })}
                />{' '}
                A combinar pelo WhatsApp
              </label>
              {form.deliveryFee.mode === 'fixed' && (
                <input
                  aria-label="Valor da taxa (R$)"
                  inputMode="decimal"
                  className="input w-32"
                  placeholder="5,00"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                />
              )}
            </div>
          </fieldset>
          <div className="mt-5">
            <label htmlFor="st-min" className="label">
              Pedido mínimo (R$) — deixe vazio para não ter mínimo
            </label>
            <input
              id="st-min"
              inputMode="decimal"
              className="input w-40"
              placeholder="0,00"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
          </div>
        </Card>

        <Card
          title="Formas de pagamento aceitas"
          description="O cliente só vê no carrinho as opções marcadas aqui."
        >
          <div className="flex flex-wrap gap-5">
            {PAYMENT_METHODS.map((p) => (
              <label key={p} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[#D61F1F]"
                  checked={form.payments.includes(p)}
                  onChange={(e) => togglePayment(p, e.target.checked)}
                />{' '}
                {p}
              </label>
            ))}
          </div>
        </Card>

        <div className="sticky bottom-20 z-10 flex justify-end lg:bottom-4">
          <Button onClick={() => void save()} disabled={busy} className="shadow-glow">
            {busy ? 'Salvando…' : 'Salvar configurações'}
          </Button>
        </div>
      </div>
    </>
  )
}

import { useMemo, useRef, useState } from 'react'
import { config } from '@/lib/config'
import { formatPrice } from '@/lib/format'
import { repo } from '@/lib/data'
import {
  buildOrderMessage,
  buildOrderRecord,
  computeTotals,
  validateCheckout,
  type CheckoutErrors,
} from '@/lib/order'
import { whatsappUrl } from '@/lib/whatsapp'
import type { OrderType } from '@/lib/types'
import { lineTotal, unitPrice, useCart } from '@/store/cart'
import { useSettings } from '@/store/settings'
import { Button } from './Button'
import { Dialog } from './Dialog'
import { TrashIcon, WhatsappIcon } from './Icons'
import { QuantityStepper } from './QuantityStepper'

const TYPES: { value: OrderType; label: string }[] = [
  { value: 'entrega', label: 'Entrega' },
  { value: 'retirada', label: 'Retirada' },
]

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div
      className={`flex justify-between ${strong ? 'text-lg font-bold text-white' : 'text-muted'}`}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function Segmented<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string
  legend: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <fieldset>
      <legend className="label">{legend}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ember ${
              value === o.value
                ? 'border-brand bg-brand/20 text-white'
                : 'border-line bg-bg text-white/80'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function CartDrawer() {
  const { lines, checkout, isOpen, setOpen, setQty, remove, setCheckout, finishOrder } =
    useCart()
  const { deliveryFee, whatsapp, paused, pauseMessage, payments, minOrder } = useSettings(
    (s) => s.settings,
  )
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [sent, setSent] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLTextAreaElement>(null)

  const totals = useMemo(
    () => computeTotals(lines, checkout, deliveryFee),
    [lines, checkout, deliveryFee],
  )

  const close = () => {
    setOpen(false)
    setSent(false)
    setErrors({})
  }

  const submit = () => {
    const found = validateCheckout(lines, checkout, minOrder)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      if (found.nome) nameRef.current?.focus()
      else if (found.endereco) addressRef.current?.focus()
      return
    }
    // O registro no painel nunca bloqueia o pedido: se falhar, o WhatsApp abre do mesmo jeito.
    void repo.orders
      .create(buildOrderRecord(lines, checkout, totals))
      .catch(() => undefined)
    const url = whatsappUrl(whatsapp, buildOrderMessage(lines, checkout, totals))
    const win = window.open(url, '_blank')
    if (!win) window.location.href = url // popup bloqueado (comum em in-app browsers)
    finishOrder()
    setSent(true)
    setOpen(true)
  }

  const deliveryText =
    checkout.tipo === 'retirada'
      ? 'Retirada (grátis)'
      : totals.delivery === null
        ? config.messages.deliveryTbd
        : formatPrice(totals.delivery)

  return (
    <Dialog open={isOpen} onClose={close} title="Seu pedido">
      {sent ? (
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#1FA855]/20 text-[#4ADE80]">
            <WhatsappIcon size={34} />
          </span>
          <h3 className="text-2xl">Pedido enviado!</h3>
          <p className="text-muted">
            Abrimos o WhatsApp com o seu pedido pronto. Só enviar a mensagem para
            confirmar com a gente.
          </p>
          <Button onClick={close}>Voltar ao cardápio</Button>
        </div>
      ) : lines.length === 0 ? (
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-muted">{config.messages.emptyCart}</p>
          <Button
            onClick={() => {
              close()
              document.getElementById('cardapio')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Ver cardápio
          </Button>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="space-y-6 p-5"
        >
          <ul className="divide-y divide-line">
            {lines.map((l) => (
              <li key={l.key} className="space-y-2 py-3 first:pt-0">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-semibold">{l.nome}</p>
                    {l.adicionais.length > 0 && (
                      <p className="text-sm text-muted">
                        + {l.adicionais.map((a) => a.nome).join(', ')}
                      </p>
                    )}
                    {l.obs && <p className="text-sm italic text-muted">Obs: {l.obs}</p>}
                  </div>
                  <p className="shrink-0 font-semibold">{formatPrice(lineTotal(l))}</p>
                </div>
                <div className="flex items-center justify-between">
                  <QuantityStepper
                    value={l.qtd}
                    min={0}
                    onChange={(q) => setQty(l.key, q)}
                    label={`Quantidade de ${l.nome}`}
                  />
                  <span className="text-xs text-muted">
                    {formatPrice(unitPrice(l))} un.
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(l.key)}
                    aria-label={`Remover ${l.nome}`}
                    className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-brand-light"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <Segmented
            name="tipo"
            legend="Como quer receber?"
            options={TYPES}
            value={checkout.tipo}
            onChange={(tipo) => setCheckout({ tipo })}
          />

          {paused && (
            <p
              role="alert"
              className="rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember"
            >
              {pauseMessage}
            </p>
          )}

          <div>
            <label htmlFor="ck-nome" className="label">
              Seu nome
            </label>
            <input
              ref={nameRef}
              id="ck-nome"
              className="input"
              autoComplete="name"
              value={checkout.nome}
              onChange={(e) => setCheckout({ nome: e.target.value })}
              aria-invalid={Boolean(errors.nome)}
              aria-describedby={errors.nome ? 'ck-nome-erro' : undefined}
            />
            {errors.nome && (
              <p id="ck-nome-erro" role="alert" className="mt-1 text-sm text-[#FF8A8A]">
                {errors.nome}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="ck-tel" className="label">
              WhatsApp para contato (opcional)
            </label>
            <input
              id="ck-tel"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="input"
              placeholder="(67) 90000-0000"
              value={checkout.telefone}
              onChange={(e) => setCheckout({ telefone: e.target.value })}
            />
          </div>

          {checkout.tipo === 'entrega' && (
            <div>
              <label htmlFor="ck-end" className="label">
                Endereço de entrega
              </label>
              <textarea
                ref={addressRef}
                id="ck-end"
                rows={2}
                className="input resize-none"
                autoComplete="street-address"
                placeholder="Rua, número, bairro e ponto de referência"
                value={checkout.endereco}
                onChange={(e) => setCheckout({ endereco: e.target.value })}
                aria-invalid={Boolean(errors.endereco)}
                aria-describedby={errors.endereco ? 'ck-end-erro' : undefined}
              />
              {errors.endereco && (
                <p id="ck-end-erro" role="alert" className="mt-1 text-sm text-[#FF8A8A]">
                  {errors.endereco}
                </p>
              )}
            </div>
          )}

          <Segmented
            name="pagamento"
            legend="Forma de pagamento"
            options={payments.map((p) => ({ value: p, label: p }))}
            value={checkout.pagamento}
            onChange={(pagamento) => setCheckout({ pagamento })}
          />
          {checkout.pagamento === 'Dinheiro' && (
            <div>
              <label htmlFor="ck-troco" className="label">
                Troco para quanto? (opcional)
              </label>
              <input
                id="ck-troco"
                className="input"
                inputMode="decimal"
                placeholder="Ex.: R$ 50,00"
                value={checkout.troco}
                onChange={(e) => setCheckout({ troco: e.target.value })}
              />
            </div>
          )}

          <div>
            <label htmlFor="ck-obs" className="label">
              Observações gerais (opcional)
            </label>
            <textarea
              id="ck-obs"
              rows={2}
              maxLength={300}
              className="input resize-none"
              value={checkout.obs}
              onChange={(e) => setCheckout({ obs: e.target.value })}
            />
          </div>

          <dl className="space-y-1.5 rounded-2xl border border-line bg-bg p-4">
            <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
            <Row label="Entrega" value={deliveryText} />
            <Row
              label="Total"
              strong
              value={
                totals.delivery === null
                  ? `${formatPrice(totals.total)} + entrega`
                  : formatPrice(totals.total)
              }
            />
          </dl>

          {errors.carrinho && (
            <p role="alert" className="text-sm text-[#FF8A8A]">
              {errors.carrinho}
            </p>
          )}
          <Button type="submit" variant="whatsapp" className="w-full" disabled={paused}>
            <WhatsappIcon size={20} /> Finalizar pelo WhatsApp
          </Button>
        </form>
      )}
    </Dialog>
  )
}

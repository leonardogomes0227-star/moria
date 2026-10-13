import { MinusIcon, PlusIcon } from './Icons'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  label: string
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  label,
}: QuantityStepperProps) {
  const btn =
    'grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:opacity-40'
  return (
    <div className="inline-flex items-center gap-3" role="group" aria-label={label}>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
      >
        <MinusIcon size={18} />
      </button>
      <span className="min-w-6 text-center font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        aria-label="Aumentar quantidade"
      >
        <PlusIcon size={18} />
      </button>
    </div>
  )
}

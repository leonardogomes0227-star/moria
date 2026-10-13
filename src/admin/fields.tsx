import { useState } from 'react'
import { fmtNum, parseNum } from './numbers'

interface NumFieldProps {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  hint?: string
  suffix?: string
  prefix?: string
  className?: string
}

/** Campo numérico com vírgula: guarda o texto digitado e devolve o número. Use `key` para recarregar o valor. */
export function NumField({
  id,
  label,
  value,
  onChange,
  hint,
  suffix,
  prefix,
  className = '',
}: NumFieldProps) {
  const [text, setText] = useState(value === 0 ? '' : fmtNum(value))
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            {prefix}
          </span>
        )}
        <input
          id={id}
          inputMode="decimal"
          className={`input ${prefix ? 'pl-12' : ''} ${suffix ? 'pr-14' : ''}`}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            onChange(parseNum(e.target.value))
          }}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  )
}

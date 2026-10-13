import { useState } from 'react'
import { toast } from '@/store/toast'
import { CheckIcon, CopyIcon } from './Icons'

/** Copia um texto para a área de transferência, com confirmação visual. */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      window.setTimeout(() => setDone(false), 1600)
    } catch {
      toast('Não foi possível copiar. Selecione o texto e copie manualmente.', 'error')
    }
  }
  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={`Copiar ${label}`}
      className="inline-flex items-center gap-1.5 rounded-pill border border-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/10"
    >
      {done ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      {done ? 'Copiado' : 'Copiar'}
    </button>
  )
}

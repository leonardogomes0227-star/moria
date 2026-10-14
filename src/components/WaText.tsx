import { Fragment } from 'react'

/** Texto de conversa com o negrito do WhatsApp: *assim* vira negrito. */
export function WaText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*\n]+\*)/g).map((part, i) =>
        part.length > 2 && part.startsWith('*') && part.endsWith('*') ? <strong key={i}>{part.slice(1, -1)}</strong> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  )
}

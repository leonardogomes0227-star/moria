const WORDS = [
  'Defumado na brasa',
  'Baguetes exclusivas',
  'Molho artesanal',
  'Carnes selecionadas',
  'Pedido pelo WhatsApp',
]

/** Faixa rolante decorativa (o conteúdo já aparece nas seções). */
export function Marquee() {
  const row = WORDS.flatMap((w) => [w, '✦'])
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y border-brand-light/30 bg-brand py-3"
    >
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-display text-lg font-bold uppercase tracking-widest sm:text-xl">
        {[...row, ...row, ...row, ...row].map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
    </div>
  )
}

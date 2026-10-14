const WORDS = [
  'Defumado na brasa',
  'Brioche selado',
  'Geleias artesanais',
  'Hambúrguer de 160g',
  'Peça pelo WhatsApp',
]

/** Faixa rolante decorativa e levemente inclinada (o conteúdo já aparece nas seções). */
export function Marquee() {
  const row = WORDS.flatMap((w) => [w, '✦'])
  return (
    <div aria-hidden="true" className="relative z-10 overflow-hidden py-3">
      <div className="-mx-6 -rotate-1 overflow-hidden border-y-4 border-bg bg-brand py-3 shadow-glow">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-display text-2xl uppercase tracking-wider sm:text-3xl">
          {[...row, ...row, ...row, ...row].map((w, i) => (
            <span key={i} className={w === '✦' ? 'text-white/70' : ''}>
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

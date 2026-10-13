import { InstagramIcon } from '@/components/Icons'
import { Reveal } from '@/components/Reveal'
import { config } from '@/lib/config'

/** Faixa de convite para o Instagram: grande parte do tráfego do site vem de lá. */
export function InstagramCta() {
  return (
    <section aria-label="Instagram" className="py-10">
      <div className="container-x">
        <Reveal>
          <a
            href={config.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 overflow-hidden rounded-[2rem] border border-line bg-surface p-8 text-center transition-colors hover:border-brand/60 sm:flex-row sm:justify-between sm:text-left"
          >
            <span className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                <InstagramIcon size={28} />
              </span>
              <span>
                <span className="block font-display text-2xl font-bold">
                  Siga a brasa no Instagram
                </span>
                <span className="block text-muted">
                  Bastidores, novidades e promoções em @{config.instagram.handle}
                </span>
              </span>
            </span>
            <span className="shimmer-text animate-shimmer font-display text-xl font-bold">
              @{config.instagram.handle} →
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}

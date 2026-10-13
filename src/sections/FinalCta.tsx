import { Button } from '@/components/Button'
import { WhatsappIcon } from '@/components/Icons'
import { Reveal } from '@/components/Reveal'
import { config } from '@/lib/config'
import { scrollToId } from '@/lib/scroll'
import { whatsappUrl } from '@/lib/whatsapp'
import { useSettings } from '@/store/settings'

/** Último empurrão antes do rodapé: foto grande + dois caminhos de pedido. */
export function FinalCta() {
  const whatsapp = useSettings((s) => s.settings.whatsapp)
  return (
    <section
      aria-labelledby="final-title"
      className="relative isolate overflow-hidden py-20"
    >
      <img
        src="/gallery/post.webp"
        alt=""
        width={780}
        height={1078}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_60%] opacity-40"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-bg via-bg/70 to-bg"
      />
      <div className="container-x">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="-rotate-2 font-script text-2xl text-ember">bateu a fome?</p>
          <h2 id="final-title" className="mt-1 text-6xl leading-[0.92] sm:text-8xl">
            Peça agora o seu{' '}
            <span className="shimmer-text animate-shimmer">artesanal</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
            Escolha no cardápio e envie pelo WhatsApp. Sem app, sem cadastro, sem
            complicação.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              magnetic
              className="px-9 py-4 text-lg"
              onClick={() => scrollToId('cardapio')}
            >
              Ver o cardápio
            </Button>
            <Button
              variant="whatsapp"
              className="px-9 py-4 text-lg"
              href={whatsappUrl(whatsapp, config.messages.headerWhatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappIcon size={22} /> Pedir no WhatsApp
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

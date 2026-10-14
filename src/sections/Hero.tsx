import { Button } from '@/components/Button'
import { Embers } from '@/components/Embers'
import { HeroScene } from '@/components/HeroScene'
import { FlameIcon, PinIcon, WhatsappIcon } from '@/components/Icons'
import { OpenBadge } from '@/components/OpenBadge'
import { config } from '@/lib/config'
import { scrollToId } from '@/lib/scroll'
import { whatsappUrl } from '@/lib/whatsapp'
import { useSettings } from '@/store/settings'

/** Atraso (s) de cada bloco na animação de entrada em cascata. */
const stagger = (n: number) => ({ animationDelay: `${0.1 + n * 0.12}s` })

export function Hero() {
  const { whatsapp, payments } = useSettings((s) => s.settings)
  const trust = [
    { icon: <PinIcon size={18} />, text: 'Entrega e retirada' },
    { icon: <WhatsappIcon size={18} />, text: 'Pedido pronto no WhatsApp' },
    { icon: <FlameIcon size={18} />, text: payments.join(' · ') },
  ]
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="grill relative isolate overflow-hidden bg-bg pt-20"
    >
      {/* Faixa diagonal de marca + brilho */}
      <div
        aria-hidden="true"
        className="absolute -right-[18%] top-0 -z-10 hidden h-full w-[62%] -skew-x-12 bg-gradient-to-b from-brand via-[#7d1111] to-bg opacity-70 lg:block"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_70%_40%,rgba(255,106,26,0.22),transparent_70%)]"
      />
      <Embers count={26} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-96 w-96 animate-drift rounded-full bg-[radial-gradient(closest-side,rgba(214,31,31,0.3),transparent)]"
      />

      <div className="container-x relative grid min-h-[calc(100svh-5rem)] items-center gap-4 pb-14 pt-4 lg:grid-cols-[1.02fr_1fr] lg:gap-8">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <div style={stagger(0)} className="animate-fade-up">
            <OpenBadge
              detailed
              className="border border-line bg-surface/80 backdrop-blur"
            />
          </div>
          <h1
            id="hero-title"
            style={stagger(1)}
            className="mt-5 animate-fade-up text-[clamp(2.8rem,15vw,4.6rem)] leading-[0.92] sm:text-[6.6rem] lg:text-[5.6rem] xl:text-[7rem]"
          >
            <span className="whitespace-nowrap">O autêntico</span>
            <br />
            sabor
            <br className="sm:hidden" />{' '}
            <span className="relative inline-block">
              <span className="shimmer-text animate-shimmer">defumado</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full text-ember"
              >
                <path
                  d="M2 9c40-8 80 4 120-2s90-6 176 0"
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p
            style={stagger(2)}
            className="mx-auto mt-6 max-w-xl animate-fade-up text-lg text-white/85 lg:mx-0 lg:text-xl"
          >
            Hambúrgueres de 160g assados na brasa, no pão brioche selado, direto de
            Rio Verde de MS. Monte o pedido em 1 minuto e envie pelo WhatsApp.
          </p>
          <div
            style={stagger(3)}
            className="mt-8 flex animate-fade-up flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Button
              magnetic
              className="px-8 py-4 text-lg"
              onClick={() => scrollToId('cardapio')}
            >
              Fazer pedido agora
            </Button>
            <Button
              variant="whatsapp"
              className="px-8 py-4 text-lg"
              href={whatsappUrl(whatsapp, config.messages.headerWhatsapp)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappIcon size={22} /> Falar no WhatsApp
            </Button>
          </div>
          <ul
            style={stagger(4)}
            className="mt-8 flex animate-fade-up flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/75 lg:justify-start"
          >
            {trust.map((t) => (
              <li key={t.text} className="flex items-center gap-2">
                <span className="text-ember">{t.icon}</span>
                {t.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 lg:order-2">
          <HeroScene />
        </div>
      </div>
    </section>
  )
}

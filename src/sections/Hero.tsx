import { Button } from '@/components/Button'
import { Embers } from '@/components/Embers'
import { HeroScene } from '@/components/HeroScene'
import { config } from '@/lib/config'
import { scrollToId } from '@/lib/scroll'

/** Atraso (s) de cada bloco na animação de entrada em cascata. */
const stagger = (n: number) => ({ animationDelay: `${0.1 + n * 0.12}s` })

export function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-smoke-gradient pt-24"
    >
      <Embers count={22} />
      {/* Fumaça: manchas de brilho à deriva (só transform, barato) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-10 h-96 w-96 animate-drift rounded-full bg-[radial-gradient(closest-side,rgba(214,31,31,0.28),transparent)]"
      />
      <div
        aria-hidden="true"
        style={{ animationDelay: '-7s' }}
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 animate-drift rounded-full bg-[radial-gradient(closest-side,rgba(255,106,26,0.18),transparent)]"
      />

      <div className="container-x relative grid min-h-[calc(100svh-6rem)] items-center gap-6 pb-10 lg:grid-cols-2">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p
            style={stagger(0)}
            className="mb-3 inline-block animate-fade-up rounded-pill border border-ember/40 bg-ember/10 px-4 py-1 text-sm font-semibold text-ember"
          >
            Rio Verde de MS · Artesanal
          </p>
          <h1
            id="hero-title"
            style={stagger(1)}
            className="animate-fade-up text-5xl leading-[1.05] sm:text-6xl xl:text-7xl"
          >
            O autêntico sabor{' '}
            <span className="shimmer-text animate-shimmer">defumado</span>
          </h1>
          <p
            style={stagger(2)}
            className="mx-auto mt-5 max-w-xl animate-fade-up text-lg text-white/80 lg:mx-0"
          >
            Baguetes exclusivas, molho artesanal e carnes selecionadas. Monte seu pedido e
            envie direto pelo WhatsApp de {config.name}.
          </p>
          <div
            style={stagger(3)}
            className="mt-8 flex animate-fade-up flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Button magnetic onClick={() => scrollToId('cardapio')}>
              Fazer pedido
            </Button>
            <Button variant="ghost" onClick={() => scrollToId('cardapio')}>
              Ver cardápio
            </Button>
          </div>
          <p style={stagger(4)} className="mt-6 animate-fade-up text-sm text-muted">
            Role para ver o cardápio ↓
          </p>
        </div>

        <div className="order-1 lg:order-2">
          <HeroScene />
        </div>
      </div>
    </section>
  )
}

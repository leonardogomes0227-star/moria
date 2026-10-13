import { Button } from '@/components/Button'
import { PinIcon } from '@/components/Icons'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { config, fullAddress } from '@/lib/config'

export function Location() {
  return (
    <Section
      id="localizacao"
      eyebrow="Venha nos visitar"
      title="Localização"
      className="bg-surface/40"
    >
      <div className="grid items-stretch gap-6 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <div className="card flex h-full flex-col justify-center gap-5 p-7">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient">
              <PinIcon size={26} />
            </span>
            <address className="text-lg not-italic leading-relaxed text-white/90">
              {fullAddress()}
            </address>
            <Button href={config.mapsUrl} target="_blank" rel="noopener noreferrer">
              Como chegar
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-3">
          <iframe
            title={`Mapa: ${config.name}`}
            src={config.mapsEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="h-72 w-full rounded-card border border-line sm:h-96 lg:h-full lg:min-h-80"
          />
        </Reveal>
      </div>
    </Section>
  )
}

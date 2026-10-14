import { useEffect, type ReactNode } from 'react'
import { Button } from '@/components/Button'
import { DemoCredentials } from '@/components/DemoCredentials'
import { BotIcon, BurgerIcon, CoinIcon } from '@/components/Icons'
import { Logo } from '@/components/Logo'
import { config } from '@/lib/config'
import { repo } from '@/lib/data'
import { toast } from '@/store/toast'

interface StepProps {
  n: number
  icon: ReactNode
  title: string
  subtitle: string
  todo: string[]
  action: ReactNode
  extra?: ReactNode
  /** Destaque (ex.: "mais fácil de testar"). */
  badge?: string
}

function Step({ n, icon, title, subtitle, todo, action, extra, badge }: StepProps) {
  return (
    <section className={`card relative flex flex-col gap-4 p-6 ${badge ? 'border-[#15803D] shadow-[0_0_30px_rgba(21,128,61,.25)]' : ''}`}>
      {badge && <span className="absolute right-4 top-4 rounded-pill bg-[#15803D] px-3 py-1 text-xs font-bold uppercase tracking-wide">{badge}</span>}
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-lg font-bold" aria-hidden>
          {n}
        </span>
        <span className="text-ember" aria-hidden>
          {icon}
        </span>
      </div>
      <div>
        <h2 className="text-2xl">{title}</h2>
        <p className="mt-1 text-muted">{subtitle}</p>
      </div>
      <ul className="space-y-2 text-sm text-white/85">
        {todo.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="text-ember" aria-hidden>
              →
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      {extra}
      <div className="mt-auto pt-2">{action}</div>
    </section>
  )
}

/** Central de demonstração: reúne site, painel e robô, com o que fazer em cada um. */
export default function Demo() {
  useEffect(() => {
    document.title = `Conheça o sistema · ${config.name}`
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.append(meta)
    return () => meta.remove()
  }, [])

  const reset = () => {
    if (!window.confirm('Apagar o que você mexeu e voltar aos dados de exemplo?')) return
    repo.resetDemo?.()
    toast('Dados de teste restaurados.')
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 max-w-3xl">
        <Logo size={56} />
        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-ember">Demonstração para o dono</p>
        <h1 className="mt-2 text-4xl sm:text-6xl">
          Veja como vai ficar <span className="text-brand-light">a sua loja.</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          Aqui estão as três partes do sistema, já funcionando. É tudo de teste: pode clicar, pedir, mudar preço e apagar à vontade. Nada disso vai para clientes de verdade.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Step
          n={1}
          icon={<BurgerIcon size={28} />}
          title="O site do cliente"
          subtitle="Como o seu cliente vê o cardápio e faz o pedido."
          todo={['Role a página e veja o cardápio com fotos.', 'Adicione um hambúrguer, uma batata e uma bebida ao carrinho.', 'Finalize: o pedido chega pronto no WhatsApp e também no painel.']}
          action={
            <Button href="/" magnetic>
              Abrir o site
            </Button>
          }
        />
        <Step
          n={2}
          icon={<CoinIcon size={28} />}
          title="O painel do dono"
          subtitle="Onde você acompanha os pedidos e vê o lucro de verdade."
          todo={['Em Pedidos, o pedido que você fez aparece, e você avança com um botão.', 'Em Custos, veja faturamento, custo dos ingredientes, equipe, motoboy e lucro do mês.', 'Em Cardápio, mude um preço e veja o site mudar.']}
          extra={
            <div>
              <p className="mb-2 text-sm font-semibold">Para entrar, use:</p>
              <DemoCredentials />
            </div>
          }
          action={
            <Button href="/admin?demo=1" magnetic>
              Abrir o painel
            </Button>
          }
        />
        <Step
          n={3}
          badge="Mais fácil de testar"
          icon={<BotIcon size={28} />}
          title="O robô de atendimento"
          subtitle="Atende o cliente no WhatsApp e anota o pedido sozinho."
          todo={['Peça “um X-Bacon e uma Coca”.', 'Tente pedir desconto ou um item que não existe: ele não inventa.', 'Peça para falar com uma pessoa e veja o robô passar o atendimento.']}
          extra={<p className="text-xs text-muted">Aqui você vê o fluxo de atendimento. Com a IA ligada, ele também entende conversa livre, áudio e foto.</p>}
          action={
            <Button href="/teste" magnetic>
              Conversar com o robô
            </Button>
          }
        />
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card p-6">
          <h2 className="text-2xl">Roteiro de 5 minutos</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-white/85">
            <li>Abra o <strong>site</strong> e faça um pedido de teste.</li>
            <li>Entre no <strong>painel</strong> e veja o pedido em <em>Pedidos</em>. Avance até concluir.</li>
            <li>Abra <em>Custos</em> e olhe quanto sobrou no mês, produto por produto.</li>
            <li>Converse com o <strong>robô</strong> e peça um pedido pelo “WhatsApp”.</li>
            <li>Volte ao painel: o pedido do robô aparece com a etiqueta <em>WhatsApp</em>.</li>
          </ol>
        </div>
        <div className="card flex flex-col gap-3 p-6">
          <h2 className="text-2xl">Mexeu demais?</h2>
          <p className="text-sm text-muted">Os dados de teste ficam só neste aparelho. Se quiser recomeçar, restaure os exemplos.</p>
          <Button variant="ghost" onClick={reset} className="mt-auto">
            Restaurar dados de teste
          </Button>
        </div>
      </section>
    </main>
  )
}

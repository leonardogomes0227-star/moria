import { Link } from 'react-router-dom'
import { Dialog } from '@/components/Dialog'
import { SECTIONS } from './guide'

interface GuideProps {
  open: boolean
  onClose: () => void
}

/** “O que é cada botão?”: explica o painel inteiro em uma tela. Abre sozinho no primeiro acesso. */
export function Guide({ open, onClose }: GuideProps) {
  return (
    <Dialog open={open} onClose={onClose} title="O que é cada botão?">
      <div className="space-y-5 p-5">
        <p className="text-white/80">
          Este é o painel do dono da hamburgueria. Cada botão do menu abre uma área. Veja,
          em poucas palavras, para que serve cada uma:
        </p>
        <ol className="space-y-4">
          {SECTIONS.map((s) => (
            <li key={s.to} className="rounded-2xl border border-line bg-bg p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white">
                  <s.icon size={22} />
                </span>
                <div className="flex-1">
                  <p className="font-bold">{s.title}</p>
                  <p className="text-sm text-muted">{s.short}</p>
                </div>
                <Link
                  to={s.to}
                  onClick={onClose}
                  className="rounded-pill border border-line px-3 py-1.5 text-sm font-semibold hover:bg-white/5"
                >
                  Abrir
                </Link>
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-white/80">
                {s.does.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="rounded-xl border border-ember/30 bg-ember/5 p-3 text-sm text-white/85">
          <strong className="text-ember">Dica:</strong> passe o mouse (ou foque com o
          teclado) sobre qualquer botão para ver um balão explicando o que ele faz. Para
          rever este guia, use o botão “O que é cada botão?” no topo.
        </p>
      </div>
    </Dialog>
  )
}

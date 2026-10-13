import { useOutletContext } from 'react-router-dom'
import { config } from '@/lib/config'
import { repo } from '@/lib/data'
import { toast } from '@/store/toast'
import type { AdminContext } from './AdminLayout'
import { Card, PageHeader } from './ui'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Como mudo o preço de um produto?',
    a: 'Vá em Cardápio, clique em “Editar” no item, altere o preço e salve. O site atualiza na hora.',
  },
  {
    q: 'Acabou um produto. O que faço?',
    a: 'Em Cardápio, desligue a chave “Disponível” do item. Ele fica esmaecido no site e o cliente não consegue pedir.',
  },
  {
    q: 'Como fecho a loja mais cedo hoje?',
    a: 'Em Loja, escreva um aviso de topo (ex.: “Hoje fechamos às 22h”). Se quiser parar de receber pedidos agora, desligue “Receber pedidos pelo site”.',
  },
  {
    q: 'O cliente pagou? Como sei?',
    a: 'O pagamento (Pix, cartão ou dinheiro) é combinado pelo WhatsApp, como já funciona hoje. O painel mostra a forma escolhida e o troco, mas não processa pagamentos.',
  },
  {
    q: 'O pedido chegou no painel, mas o cliente não mandou a mensagem no WhatsApp?',
    a: 'Pode acontecer se ele fechou o WhatsApp antes de enviar. Use “Chamar cliente” (se ele informou o telefone) para confirmar antes de preparar.',
  },
  {
    q: 'Como troco a foto principal e o logo?',
    a: 'São arquivos do projeto: logo em src/assets/logo.png e foto do topo em public/hero/burger.webp. Peça ao desenvolvedor ou substitua os arquivos e publique de novo.',
  },
  {
    q: 'Quais tamanhos de foto usar no cardápio?',
    a: 'Horizontais (proporção 4:3), com pelo menos 800 × 600 px, bem iluminadas e com o produto centralizado. Até 3 MB.',
  },
  {
    q: 'Posso ter mais de um usuário no painel?',
    a: 'Sim: no Supabase, em Authentication → Users, crie quantos usuários precisar. Todos têm o mesmo acesso.',
  },
]

export default function Help() {
  const { orders } = useOutletContext<AdminContext>()
  const demo = repo.mode === 'local'
  return (
    <>
      <PageHeader
        title="Ajuda"
        description="Passo a passo das tarefas do dia a dia. Qualquer pessoa da equipe consegue usar."
      />

      {demo && (
        <div className="mb-6 rounded-2xl border border-ember/40 bg-ember/10 p-5 text-sm">
          <p className="font-semibold text-ember">Você está no modo demonstração</p>
          <p className="mt-1 text-white/85">
            Os dados deste painel ficam salvos só neste navegador (há {orders.length}{' '}
            pedidos, vários de exemplo). Faça um pedido no site e ele aparece em
            “Pedidos”; mude um preço e o site muda. Em produção, tudo isso passa a ser
            salvo no banco de dados e funciona em qualquer celular ou computador.
          </p>
          <button
            type="button"
            className="mt-3 rounded-pill border border-ember/60 px-4 py-2 font-semibold text-ember hover:bg-ember/10"
            onClick={() => {
              if (!window.confirm('Apagar tudo e voltar aos dados de exemplo?')) return
              repo.resetDemo?.()
              toast('Dados restaurados.')
              window.location.reload()
            }}
          >
            Restaurar dados de demonstração
          </button>
        </div>
      )}

      <div className="space-y-5">
        <Card
          title="1. O caminho de um pedido"
          description="Do clique do cliente até a entrega."
        >
          <ol className="list-decimal space-y-2 pl-5 text-white/85">
            <li>
              O cliente escolhe os itens no site e clica em{' '}
              <strong>Finalizar pelo WhatsApp</strong>.
            </li>
            <li>
              O pedido é registrado aqui em <strong>Pedidos</strong> (status “Novo”) e a
              conversa abre no WhatsApp da loja ({config.name}) com tudo pronto.
            </li>
            <li>
              Você clica em <strong>Aceitar e iniciar preparo</strong> e, se quiser,{' '}
              <strong>Imprime a comanda</strong> para a cozinha.
            </li>
            <li>
              Quando sair para entrega (ou ficar pronto para retirada), clique no botão
              seguinte. Ao final, <strong>Concluir pedido</strong>.
            </li>
            <li>
              Se algo der errado, use <strong>Cancelar</strong>: o pedido não conta no
              faturamento.
            </li>
          </ol>
        </Card>
        <Card title="2. Rotina de abertura" description="Sugestão para começar o dia.">
          <ul className="list-disc space-y-1 pl-5 text-white/85">
            <li>
              Em <strong>Cardápio</strong>, confira se algum item está indisponível por
              engano.
            </li>
            <li>
              Em <strong>Loja</strong>, escreva o aviso do dia (se houver) e confirme os
              horários.
            </li>
            <li>
              Deixe a página <strong>Pedidos</strong> aberta com o som ligado (menu
              lateral) para ouvir cada pedido novo.
            </li>
          </ul>
        </Card>
        <Card title="3. Perguntas frequentes">
          <div className="divide-y divide-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-3">
                <summary className="cursor-pointer list-none font-medium marker:hidden">
                  <span className="mr-2 inline-block text-ember transition-transform group-open:rotate-90">
                    ▸
                  </span>
                  {f.q}
                </summary>
                <p className="mt-2 pl-5 text-white/75">{f.a}</p>
              </details>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

import { config } from '@/lib/config'
import { formatPrice } from '@/lib/format'
import type { Order } from '@/lib/types'

const when = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    timeZone: config.timezone,
    dateStyle: 'short',
    timeStyle: 'short',
  })

/** Comanda para a cozinha: só aparece ao imprimir (CSS `print:`), em largura de bobina (80 mm). */
export function Comanda({ order }: { order: Order }) {
  return (
    <div className="print-area hidden bg-white p-3 font-mono text-[12px] leading-snug text-black print:block">
      <p className="text-center text-base font-bold">{config.name.toUpperCase()}</p>
      <p className="text-center">
        Pedido #{order.numero} · {when(order.criado_em)}
      </p>
      <hr className="my-2 border-dashed border-black" />
      <p className="font-bold">{order.tipo === 'entrega' ? 'ENTREGA' : 'RETIRADA'}</p>
      <p>Cliente: {order.cliente_nome}</p>
      {order.cliente_telefone && <p>Contato: {order.cliente_telefone}</p>}
      {order.endereco && <p>Endereço: {order.endereco}</p>}
      <hr className="my-2 border-dashed border-black" />
      {order.itens.map((l, i) => (
        <div key={i} className="mb-1">
          <p className="font-bold">
            {l.qtd}x {l.nome}
          </p>
          {l.adicionais.length > 0 && <p> + {l.adicionais.join(', ')}</p>}
          {l.obs && <p> OBS: {l.obs}</p>}
        </div>
      ))}
      {order.obs && <p className="mt-1">OBS GERAL: {order.obs}</p>}
      <hr className="my-2 border-dashed border-black" />
      <p>Subtotal: {formatPrice(order.subtotal)}</p>
      <p>Entrega: {order.entrega === null ? 'a combinar' : formatPrice(order.entrega)}</p>
      <p className="text-base font-bold">TOTAL: {formatPrice(order.total)}</p>
      <p>
        Pagamento: {order.pagamento}
        {order.troco ? ` (troco p/ ${order.troco})` : ''}
      </p>
    </div>
  )
}

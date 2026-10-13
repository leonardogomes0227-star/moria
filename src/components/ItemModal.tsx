import { useState } from 'react'
import { formatPrice } from '@/lib/format'
import type { MenuItem } from '@/lib/types'
import { addToCart } from '@/lib/cartActions'
import { Button } from './Button'
import { Dialog } from './Dialog'
import { MenuImage } from './MenuImage'
import { QuantityStepper } from './QuantityStepper'

interface ItemModalProps {
  item: MenuItem | null
  onClose: () => void
}

function ItemForm({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const [qtd, setQtd] = useState(1)
  const [obs, setObs] = useState('')

  const addons = item.adicionais.filter((a) => selected.includes(a.nome))
  const unit = item.preco + addons.reduce((n, a) => n + a.preco, 0)

  const submit = () => {
    addToCart({
      itemId: item.id,
      nome: item.nome,
      preco: item.preco,
      adicionais: addons,
      qtd,
      obs,
    })
    onClose()
  }

  return (
    <div>
      <MenuImage src={item.imagem} alt={item.nome} categoria={item.categoria} />
      <div className="space-y-5 p-5">
        <div>
          <h3 className="text-2xl">{item.nome}</h3>
          <p className="mt-1 text-muted">{item.descricao}</p>
          <p className="mt-2 text-lg font-bold">{formatPrice(item.preco)}</p>
        </div>

        {item.adicionais.length > 0 && (
          <fieldset>
            <legend className="label">Adicionais (opcional)</legend>
            <div className="space-y-2">
              {item.adicionais.map((a) => (
                <label
                  key={a.nome}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-bg px-4 py-3 has-[:checked]:border-ember"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[#D61F1F]"
                      checked={selected.includes(a.nome)}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked
                            ? [...prev, a.nome]
                            : prev.filter((n) => n !== a.nome),
                        )
                      }
                    />
                    {a.nome}
                  </span>
                  <span className="text-sm text-muted">+ {formatPrice(a.preco)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div>
          <label htmlFor="item-obs" className="label">
            Observações
          </label>
          <textarea
            id="item-obs"
            rows={2}
            maxLength={200}
            className="input resize-none"
            placeholder="Ex.: sem cebola, ponto da carne..."
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <QuantityStepper
            value={qtd}
            onChange={setQtd}
            label={`Quantidade de ${item.nome}`}
          />
          <Button
            onClick={submit}
            disabled={!item.disponivel}
            className="flex-1 whitespace-nowrap px-4"
          >
            Adicionar · {formatPrice(unit * qtd)}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ItemModal({ item, onClose }: ItemModalProps) {
  return (
    <Dialog
      open={item !== null}
      onClose={onClose}
      title={item?.nome ?? 'Item'}
      variant="center"
    >
      {/* key reinicia o formulário a cada item aberto */}
      {item && <ItemForm key={item.id} item={item} onClose={onClose} />}
    </Dialog>
  )
}

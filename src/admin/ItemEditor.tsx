import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { PlusIcon, TrashIcon } from '@/components/Icons'
import { MenuImage } from '@/components/MenuImage'
import { repo, type MenuDraft } from '@/lib/data'
import { CATEGORIES, type Addon, type Category, type MenuItem } from '@/lib/types'

interface ItemEditorProps {
  /** `null` = fechado; `'new'` = criação. */
  item: MenuItem | 'new' | null
  defaultCategory: Category
  onClose: () => void
  onSave: (draft: MenuDraft) => Promise<void>
}

const blank = (categoria: Category): MenuDraft => ({
  categoria,
  nome: '',
  descricao: '',
  preco: 0,
  imagem: '',
  destaque: false,
  disponivel: true,
  adicionais: [],
})

function EditorForm({
  initial,
  onClose,
  onSave,
}: {
  initial: MenuDraft
  onClose: () => void
  onSave: ItemEditorProps['onSave']
}) {
  const [draft, setDraft] = useState<MenuDraft>(initial)
  const [price, setPrice] = useState(String(initial.preco).replace('.', ','))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof MenuDraft>(key: K, value: MenuDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))
  const toNumber = (v: string) => Number(v.replace(',', '.'))

  const setAddon = (index: number, patch: Partial<Addon>) =>
    set(
      'adicionais',
      draft.adicionais.map((a, i) => (i === index ? { ...a, ...patch } : a)),
    )

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      set('imagem', await repo.uploadImage(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload.')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const preco = toNumber(price)
    if (!draft.nome.trim()) return setError('Informe o nome do item.')
    if (!Number.isFinite(preco) || preco < 0) return setError('Preço inválido.')
    setBusy(true)
    setError('')
    try {
      await onSave({
        ...draft,
        nome: draft.nome.trim(),
        preco,
        adicionais: draft.adicionais
          .filter((a) => a.nome.trim())
          .map((a) => ({ nome: a.nome.trim(), preco: Number(a.preco) || 0 })),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 p-5">
      <div>
        <label htmlFor="ie-nome" className="label">
          Nome
        </label>
        <input
          id="ie-nome"
          className="input"
          value={draft.nome}
          onChange={(e) => set('nome', e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="ie-desc" className="label">
          Descrição
        </label>
        <textarea
          id="ie-desc"
          rows={3}
          className="input resize-none"
          value={draft.descricao}
          onChange={(e) => set('descricao', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ie-cat" className="label">
            Categoria
          </label>
          <select
            id="ie-cat"
            className="input"
            value={draft.categoria}
            onChange={(e) => set('categoria', e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ie-preco" className="label">
            Preço (R$)
          </label>
          <input
            id="ie-preco"
            inputMode="decimal"
            className="input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>

      <div>
        <span className="label">Foto</span>
        <div className="flex items-center gap-3">
          <div className="w-28 shrink-0 overflow-hidden rounded-xl border border-line">
            <MenuImage
              src={draft.imagem}
              alt="Pré-visualização"
              categoria={draft.categoria}
            />
          </div>
          <div className="space-y-2">
            <input
              aria-label="Enviar foto"
              type="file"
              accept="image/*"
              onChange={onFile}
              disabled={busy}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-pill file:border-0 file:bg-brand file:px-4 file:py-2 file:font-semibold file:text-white"
            />
            {draft.imagem && (
              <button
                type="button"
                className="text-sm text-muted underline"
                onClick={() => set('imagem', '')}
              >
                Remover foto
              </button>
            )}
          </div>
        </div>
      </div>

      <fieldset>
        <legend className="label">
          Adicionais{' '}
          <span className="font-normal text-muted">
            (nome · preço cobrado · custo para você)
          </span>
        </legend>
        <div className="space-y-2">
          {draft.adicionais.map((a, i) => (
            <div key={i} className="flex gap-2">
              <input
                aria-label={`Nome do adicional ${i + 1}`}
                className="input"
                placeholder="Nome"
                value={a.nome}
                onChange={(e) => setAddon(i, { nome: e.target.value })}
              />
              <input
                aria-label={`Preço do adicional ${i + 1}`}
                className="input w-24"
                inputMode="decimal"
                placeholder="Preço"
                value={String(a.preco).replace('.', ',')}
                onChange={(e) => setAddon(i, { preco: toNumber(e.target.value) || 0 })}
              />
              <input
                aria-label={`Custo do adicional ${i + 1} (para a loja)`}
                title="Quanto este adicional custa para você (usado no cálculo de lucro)"
                className="input w-24"
                inputMode="decimal"
                placeholder="Custo"
                value={a.custo ? String(a.custo).replace('.', ',') : ''}
                onChange={(e) => setAddon(i, { custo: toNumber(e.target.value) || 0 })}
              />
              <button
                type="button"
                aria-label={`Remover adicional ${i + 1}`}
                onClick={() =>
                  set(
                    'adicionais',
                    draft.adicionais.filter((_, j) => j !== i),
                  )
                }
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5 hover:bg-white/10"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              set('adicionais', [...draft.adicionais, { nome: '', preco: 0 }])
            }
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ember"
          >
            <PlusIcon size={16} /> Adicionar adicional
          </button>
        </div>
      </fieldset>

      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-5 w-5 accent-[#D61F1F]"
            checked={draft.destaque}
            onChange={(e) => set('destaque', e.target.checked)}
          />{' '}
          Destaque
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-5 w-5 accent-[#D61F1F]"
            checked={draft.disponivel}
            onChange={(e) => set('disponivel', e.target.checked)}
          />{' '}
          Disponível
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-[#FF8A8A]">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

export function ItemEditor({ item, defaultCategory, onClose, onSave }: ItemEditorProps) {
  const initial: MenuDraft | null =
    item === null ? null : item === 'new' ? blank(defaultCategory) : item
  return (
    <Dialog
      open={item !== null}
      onClose={onClose}
      title={item === 'new' ? 'Novo item' : 'Editar item'}
      variant="center"
    >
      {initial && (
        <EditorForm
          key={item === 'new' ? 'new' : (item as MenuItem).id}
          initial={initial}
          onClose={onClose}
          onSave={onSave}
        />
      )}
    </Dialog>
  )
}

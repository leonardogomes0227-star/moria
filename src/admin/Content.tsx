import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { PlusIcon, StarIcon, TrashIcon } from '@/components/Icons'
import { gallery as seedGallery } from '@/data/gallery'
import { reviews as seedReviews } from '@/data/reviews'
import { repo, type ReviewDraft } from '@/lib/data'
import type { GalleryPhoto, Review } from '@/lib/types'
import { toast } from '@/store/toast'
import { Card, ErrorBox, HelpBox, PageHeader, Spinner } from './ui'
import { useLoad } from './useLoad'

const ORIGINS = ['Instagram', 'WhatsApp', 'Google', 'Presencial']

function ReviewForm({
  initial,
  onSave,
  onClose,
}: {
  initial: ReviewDraft
  onSave: (d: ReviewDraft) => Promise<void>
  onClose: () => void
}) {
  const [draft, setDraft] = useState(initial)
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await onSave({ ...draft, nome: draft.nome.trim(), texto: draft.texto.trim() })
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4 p-5">
      <div>
        <label htmlFor="rv-nome" className="label">
          Nome do cliente
        </label>
        <input
          id="rv-nome"
          required
          className="input"
          value={draft.nome}
          onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="rv-texto" className="label">
          Depoimento
        </label>
        <textarea
          id="rv-texto"
          required
          rows={4}
          maxLength={320}
          className="input resize-none"
          value={draft.texto}
          onChange={(e) => setDraft({ ...draft, texto: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="rv-nota" className="label">
            Nota
          </label>
          <select
            id="rv-nota"
            className="input"
            value={draft.nota}
            onChange={(e) => setDraft({ ...draft, nota: Number(e.target.value) })}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} estrela{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rv-origem" className="label">
            Veio de
          </label>
          <select
            id="rv-origem"
            className="input"
            value={draft.origem}
            onChange={(e) => setDraft({ ...draft, origem: e.target.value })}
          >
            {ORIGINS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
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

function Reviews() {
  const { data, error, reload } = useLoad(() => repo.reviews.list())
  const [editing, setEditing] = useState<Review | 'new' | null>(null)
  const list = data ?? []

  const run = async (action: () => Promise<void>, ok: string) => {
    try {
      await action()
      await reload()
      toast(ok)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Operação falhou.', 'error')
    }
  }

  return (
    <Card
      title="Depoimentos"
      description="Aparecem no carrossel “O que dizem nossos clientes”. Use só comentários reais, com o consentimento do cliente."
    >
      {error && <ErrorBox message={error} onRetry={() => void reload()} />}
      <div className="mb-4 flex flex-wrap gap-3">
        <Button onClick={() => setEditing('new')}>
          <PlusIcon size={18} /> Novo depoimento
        </Button>
        {data && list.length === 0 && (
          <Button
            variant="ghost"
            onClick={() =>
              void run(async () => {
                for (const r of seedReviews)
                  await repo.reviews.save({
                    nome: r.nome,
                    texto: r.texto,
                    nota: r.nota,
                    origem: r.origem,
                  })
              }, 'Exemplos importados.')
            }
          >
            Importar exemplos
          </Button>
        )}
      </div>
      {data === null && !error && <Spinner />}
      <ul className="space-y-3">
        {list.map((r) => (
          <li
            key={r.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-bg p-4"
          >
            <div className="min-w-0">
              <p
                className="flex items-center gap-1 text-ember"
                aria-label={`Nota ${r.nota} de 5`}
              >
                {Array.from({ length: r.nota }, (_, i) => (
                  <StarIcon key={i} size={14} />
                ))}
              </p>
              <p className="mt-1 text-white/90">“{r.texto}”</p>
              <p className="mt-1 text-sm text-muted">
                {r.nome} · via {r.origem}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                className="!px-4 !py-2 text-sm"
                onClick={() => setEditing(r)}
              >
                Editar
              </Button>
              <button
                type="button"
                aria-label={`Excluir depoimento de ${r.nome}`}
                onClick={() =>
                  window.confirm('Excluir este depoimento?') &&
                  void run(() => repo.reviews.remove(r.id), 'Depoimento excluído.')
                }
                className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-brand-light"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Novo depoimento' : 'Editar depoimento'}
        variant="center"
      >
        {editing && (
          <ReviewForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={
              editing === 'new'
                ? { nome: '', texto: '', nota: 5, origem: 'Instagram' }
                : editing
            }
            onClose={() => setEditing(null)}
            onSave={async (d) => {
              await repo.reviews.save(d)
              setEditing(null)
              await reload()
              toast('Depoimento salvo.')
            }}
          />
        )}
      </Dialog>
    </Card>
  )
}

function Gallery() {
  const { data, error, reload } = useLoad(() => repo.gallery.list())
  const [busy, setBusy] = useState(false)
  const list = data ?? []

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    if (files.length === 0) return
    setBusy(true)
    try {
      for (const file of files) {
        const src = await repo.uploadImage(file)
        await repo.gallery.save({
          src,
          alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        })
      }
      await reload()
      toast(files.length > 1 ? 'Fotos adicionadas.' : 'Foto adicionada.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Falha no envio.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const run = async (action: () => Promise<void>, ok: string) => {
    try {
      await action()
      await reload()
      toast(ok)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Operação falhou.', 'error')
    }
  }

  return (
    <Card
      title="Galeria “Direto da chapa”"
      description="Fotos da seção de galeria do site. Prefira fotos horizontais (4:3) e bem iluminadas. A “descrição” é lida por leitores de tela e ajuda no Google."
    >
      {error && <ErrorBox message={error} onRetry={() => void reload()} />}
      <div className="mb-4 flex flex-wrap gap-3">
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-pill bg-brand px-6 py-3 font-semibold hover:bg-brand-light ${busy ? 'pointer-events-none opacity-50' : ''}`}
        >
          <PlusIcon size={18} /> {busy ? 'Enviando…' : 'Adicionar fotos'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={upload}
            disabled={busy}
          />
        </label>
        {data && list.length === 0 && (
          <Button
            variant="ghost"
            onClick={() =>
              void run(async () => {
                for (const p of seedGallery)
                  await repo.gallery.save({ src: p.src, alt: p.alt })
              }, 'Exemplos importados.')
            }
          >
            Importar fotos de exemplo
          </Button>
        )}
      </div>
      {data === null && !error && <Spinner />}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((p: GalleryPhoto) => (
          <li key={p.id} className="overflow-hidden rounded-2xl border border-line bg-bg">
            <img
              src={p.src}
              alt={p.alt}
              width={400}
              height={300}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="flex items-center gap-1 p-2">
              <input
                aria-label="Descrição da foto"
                defaultValue={p.alt}
                maxLength={120}
                onBlur={(e) =>
                  e.target.value !== p.alt &&
                  void run(
                    () =>
                      repo.gallery.save({ id: p.id, src: p.src, alt: e.target.value }),
                    'Descrição salva.',
                  )
                }
                className="input min-w-0 flex-1 !px-3 !py-2 text-sm"
              />
              <button
                type="button"
                aria-label="Excluir foto"
                onClick={() =>
                  window.confirm('Excluir esta foto da galeria?') &&
                  void run(() => repo.gallery.remove(p.id), 'Foto excluída.')
                }
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-brand-light"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function Content() {
  return (
    <>
      <PageHeader
        title="Conteúdo do site"
        description="Edite os depoimentos e as fotos da galeria sem precisar de ninguém."
      />
      <HelpBox title="Onde isso aparece?">
        <p>
          Depoimentos e galeria ficam nas seções do meio do site. A foto principal (hero)
          e o logo são trocados nos arquivos do projeto — veja a aba{' '}
          <strong>Ajuda</strong>.
        </p>
      </HelpBox>
      <div className="space-y-5">
        <Reviews />
        <Gallery />
      </div>
    </>
  )
}

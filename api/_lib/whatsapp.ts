import { createHmac, timingSafeEqual } from 'node:crypto'
import { env } from './env.js'

export interface Incoming {
  /** Id da mensagem no WhatsApp (usado para não responder duas vezes). */
  id: string
  /** Telefone do cliente, só dígitos com DDI. */
  from: string
  name: string
  type: string
  text: string
  /** Id da mídia (áudio ou imagem) na Meta, para baixar. */
  mediaId?: string
}

/** Confere o cabeçalho X-Hub-Signature-256 enviado pela Meta (HMAC-SHA256 do corpo bruto). */
export function verifySignature(rawBody: string | Buffer, header: string | undefined, secret: string): boolean {
  if (!header || !secret) return false
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
  const a = Buffer.from(expected)
  const b = Buffer.from(header)
  return a.length === b.length && timingSafeEqual(a, b)
}

interface WaPayload {
  entry?: {
    changes?: {
      value?: {
        contacts?: { wa_id?: string; profile?: { name?: string } }[]
        messages?: { id?: string; from?: string; type?: string; text?: { body?: string }; audio?: { id?: string }; image?: { id?: string; caption?: string } }[]
      }
    }[]
  }[]
}

/** Extrai as mensagens recebidas do corpo do webhook (ignora status de entrega, leitura etc.). */
export function extractMessages(payload: unknown): Incoming[] {
  const out: Incoming[] = []
  for (const entry of (payload as WaPayload)?.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      const names = new Map((value?.contacts ?? []).map((c) => [c.wa_id ?? '', c.profile?.name ?? '']))
      for (const m of value?.messages ?? []) {
        if (!m.id || !m.from) continue
        out.push({
          id: m.id,
          from: m.from.replace(/\D/g, ''),
          name: names.get(m.from) ?? '',
          type: m.type ?? 'unknown',
          text: m.text?.body ?? m.image?.caption ?? '',
          ...((m.audio?.id ?? m.image?.id) ? { mediaId: m.audio?.id ?? m.image?.id } : {}),
        })
      }
    }
  }
  return out
}

/** Envia uma mensagem de texto pela API oficial (WhatsApp Cloud API). */
export async function sendText(to: string, body: string): Promise<void> {
  const res = await fetch(`https://graph.facebook.com/${env.graphVersion()}/${env.waPhoneId()}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.waToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: body.slice(0, 4000), preview_url: false } }),
  })
  if (!res.ok) throw new Error(`WhatsApp respondeu ${res.status}`)
}

export interface Media {
  data: Buffer
  mime: string
}

const MAX_MEDIA_BYTES = 5_000_000

/** Baixa uma mídia recebida (a Meta devolve primeiro um endereço temporário; os dois passos usam o token). */
export async function downloadMedia(mediaId: string): Promise<Media> {
  const headers = { Authorization: `Bearer ${env.waToken()}` }
  const meta = await fetch(`https://graph.facebook.com/${env.graphVersion()}/${encodeURIComponent(mediaId)}`, { headers })
  if (!meta.ok) throw new Error(`mídia: consulta respondeu ${meta.status}`)
  const info = (await meta.json()) as { url?: string; mime_type?: string; file_size?: number }
  if (!info.url || !info.url.startsWith('https://')) throw new Error('mídia sem endereço')
  if ((info.file_size ?? 0) > MAX_MEDIA_BYTES) throw new Error('mídia grande demais')
  const file = await fetch(info.url, { headers })
  if (!file.ok) throw new Error(`mídia: download respondeu ${file.status}`)
  const data = Buffer.from(await file.arrayBuffer())
  if (data.length > MAX_MEDIA_BYTES) throw new Error('mídia grande demais')
  return { data, mime: (info.mime_type ?? file.headers.get('content-type') ?? '').split(';')[0] }
}

/** Envia uma mensagem-modelo aprovada (pode ser enviada fora da janela de 24 h). Os parâmetros não podem ter quebra de linha. */
export async function sendTemplate(to: string, name: string, params: string[], language = 'pt_BR'): Promise<void> {
  const res = await fetch(`https://graph.facebook.com/${env.graphVersion()}/${env.waPhoneId()}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.waToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: { name, language: { code: language }, components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text: text.replace(/\s*\n+\s*/g, ' | ').slice(0, 1000) })) }] },
    }),
  })
  if (!res.ok) throw new Error(`WhatsApp (modelo) respondeu ${res.status}`)
}

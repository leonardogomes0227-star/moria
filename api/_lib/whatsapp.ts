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
        messages?: { id?: string; from?: string; type?: string; text?: { body?: string } }[]
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
        out.push({ id: m.id, from: m.from.replace(/\D/g, ''), name: names.get(m.from) ?? '', type: m.type ?? 'unknown', text: m.text?.body ?? '' })
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

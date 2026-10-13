import type { IncomingMessage, ServerResponse } from 'node:http'

export type Req = IncomingMessage & { query?: Record<string, string | string[] | undefined>; body?: unknown }
export type Res = ServerResponse

export function json(res: Res, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

/** Corpo bruto da requisição (necessário para conferir a assinatura da Meta). */
export async function rawBody(req: Req, maxBytes = 1_000_000): Promise<string> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string)
    size += buf.length
    if (size > maxBytes) throw new Error('corpo grande demais')
    chunks.push(buf)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export const header = (req: Req, name: string): string | undefined => {
  const v = req.headers[name.toLowerCase()]
  return Array.isArray(v) ? v[0] : v
}

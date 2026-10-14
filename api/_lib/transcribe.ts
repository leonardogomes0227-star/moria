import { env } from './env.js'

const EXT: Record<string, string> = { 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/aac': 'aac', 'audio/amr': 'amr', 'audio/webm': 'webm' }

/** Transcreve um áudio em português usando um serviço compatível com a API de transcrição da OpenAI. */
export async function transcribeAudio(data: Buffer, mime: string): Promise<string> {
  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(data)], { type: mime || 'audio/ogg' }), `audio.${EXT[mime] ?? 'ogg'}`)
  form.append('model', env.transcribeModel())
  form.append('language', 'pt')
  form.append('response_format', 'json')
  const res = await fetch(env.transcribeUrl(), { method: 'POST', headers: { Authorization: `Bearer ${env.transcribeKey()}` }, body: form })
  if (!res.ok) throw new Error(`transcrição respondeu ${res.status}`)
  const out = (await res.json()) as { text?: string }
  return (out.text ?? '').trim()
}

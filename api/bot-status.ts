import { authedUser } from './_lib/auth.js'
import { ALLOWED_MODELS } from './_lib/agent.js'
import { readiness } from './_lib/env.js'
import { json, type Req, type Res } from './_lib/http.js'

/** Diz ao painel o que já está configurado no servidor (sem revelar nenhuma chave). */
export default async function handler(req: Req, res: Res): Promise<void> {
  if (!(await authedUser(req))) return json(res, 401, { error: 'não autorizado' })
  json(res, 200, { ...readiness(), models: ALLOWED_MODELS })
}

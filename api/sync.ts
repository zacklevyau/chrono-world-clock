import type { VercelRequest, VercelResponse } from '@vercel/node'

const TOKEN_RE = /^[a-f0-9]{64}$/

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // Check KV is wired up
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(503).json({ error: 'sync_not_configured' })
  }

  const token =
    typeof req.query.token === 'string' ? req.query.token :
    req.method === 'PUT' && req.body?.token ? req.body.token : null

  if (!token || !TOKEN_RE.test(token)) {
    return res.status(400).json({ error: 'invalid_token' })
  }

  const key = `chrono:v1:${token}`

  try {
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    if (req.method === 'GET') {
      const data = await redis.get(key)
      if (!data) return res.status(404).json({ error: 'not_found' })
      return res.status(200).json({ data })
    }

    if (req.method === 'PUT') {
      const { token: _t, ...payload } = req.body ?? {}
      if (!payload.favourites || !payload.settings) {
        return res.status(400).json({ error: 'invalid_body' })
      }
      // Reject suspiciously large payloads (>256 KB)
      const size = JSON.stringify(payload).length
      if (size > 262144) return res.status(413).json({ error: 'payload_too_large' })
      await redis.set(key, { ...payload, updatedAt: Date.now() })
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      await redis.del(key)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'method_not_allowed' })
  } catch (err) {
    console.error('[sync]', err)
    return res.status(503).json({ error: 'storage_unavailable' })
  }
}

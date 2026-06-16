import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const API_KEY    = process.env.CLOUDINARY_API_KEY!
const API_SECRET = process.env.CLOUDINARY_API_SECRET!

function extractPublicId(url: string): string {
  // https://res.cloudinary.com/{cloud}/raw/upload/v{ver}/{public_id}
  const match = url.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/)
  return match ? match[1] : ''
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 })

  const public_id = extractPublicId(url)
  if (!public_id) return NextResponse.json({ error: 'invalid url' }, { status: 400 })

  const timestamp = Math.floor(Date.now() / 1000)
  const signature = crypto
    .createHash('sha1')
    .update(`public_id=${public_id}&timestamp=${timestamp}${API_SECRET}`)
    .digest('hex')

  const form = new FormData()
  form.append('public_id',    public_id)
  form.append('timestamp',    String(timestamp))
  form.append('api_key',      API_KEY)
  form.append('signature',    signature)
  form.append('resource_type','raw')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/destroy`,
    { method: 'POST', body: form }
  )

  const data = await res.json()
  if (data.result !== 'ok' && data.result !== 'not found') {
    return NextResponse.json({ error: data.result }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

'use client'
import { createClient } from '@/lib/supabase/client'

const BUCKET = 'shop-drawings'

export async function uploadPDF(
  file: File,
  rowId: string,
  requestNo: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient()
  const ext      = file.name.split('.').pop()
  const path     = `${rowId}/${requestNo.replace(/[^a-zA-Z0-9-_]/g, '_')}.${ext}`

  // Upload to Storage
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: 'application/pdf' })

  if (upErr) return { url: null, error: upErr.message }

  // Get signed URL (valid 1 year)
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  if (!data?.signedUrl) return { url: null, error: 'فشل إنشاء رابط الملف' }

  // Save URL to database
  await supabase
    .from('shop_drawings')
    .update({ pdf_url: data.signedUrl })
    .eq('id', rowId)

  return { url: data.signedUrl, error: null }
}

export async function deletePDF(
  rowId: string,
  requestNo: string
): Promise<void> {
  const supabase = createClient()
  
  // List files in folder
  const { data: files } = await supabase.storage
    .from(BUCKET)
    .list(rowId)

  if (files && files.length > 0) {
    const paths = files.map(f => `${rowId}/${f.name}`)
    await supabase.storage.from(BUCKET).remove(paths)
  }

  await supabase.from('shop_drawings').update({ pdf_url: null }).eq('id', rowId)
}

export async function getSignedUrl(
  rowId: string,
  requestNo: string
): Promise<string | null> {
  const supabase = createClient()
  const path     = `${rowId}/${requestNo.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`

  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60) // 1 hour

  return data?.signedUrl ?? null
}

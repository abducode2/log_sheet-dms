
'use client'

const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

export interface CloudinaryResult {
  url:       string
  public_id: string
  error?:    string
}

export async function uploadToCloudinary(
  file: File,
  folder = 'p179/shop-drawings'
): Promise<CloudinaryResult> {
  const formData = new FormData()
  formData.append('file',         file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder',        folder)
  formData.append('resource_type', 'raw')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    const err = await res.json()
    return { url: '', public_id: '', error: err.error?.message ?? 'Upload failed' }
  }

  const data = await res.json()
  return {
    url:       data.secure_url,
    public_id: data.public_id,
  }
}

export function getCloudinaryViewerUrl(url: string): string {
  // Return URL directly — Cloudinary supports direct PDF viewing in iframe
  return url
}

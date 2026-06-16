export async function generateSHDForm(record: Record<string, unknown>) {
  const res = await fetch('/api/generate-shd', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(record),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'خطأ غير معروف' }))
    throw new Error(err.error ?? 'فشل توليد النموذج')
  }

  const blob     = await res.blob()
  const url      = URL.createObjectURL(blob)
  const a        = document.createElement('a')
  const reqNo    = String(record.request_no ?? 'SHD')
  a.href         = url
  a.download     = `${reqNo}_Submittal.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

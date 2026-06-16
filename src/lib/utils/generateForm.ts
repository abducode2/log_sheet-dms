import type { FieldDef } from '@/components/forms/AddRecordModal'

interface FormConfig {
  docType: string   // e.g. 'MMS', 'IR', 'CPR'
  titleAr: string   // Arabic title
  fields:  FieldDef[]
  record:  Record<string, unknown>
}

export async function generateForm({ docType, titleAr, fields, record }: FormConfig) {
  const reqNoField = fields.find(f =>
    ['request_no','ir_no','cpr_no','rfi_no','transmittal_no'].includes(f.key)
  )
  const dateField = fields.find(f =>
    ['submission_date','request_date','pour_date'].includes(f.key)
  )

  const reqNo  = reqNoField  ? String(record[reqNoField.key]  ?? '') : ''
  const subDate = dateField  ? String(record[dateField.key]   ?? '') : ''

  // Skip internal/auto fields from the detail rows
  const skipKeys = new Set([
    reqNoField?.key, dateField?.key, 'v_time', 'id', 'created_at',
  ])

  const formFields = fields
    .filter(f => !skipKeys.has(f.key) && record[f.key] !== undefined && record[f.key] !== '')
    .map(f => ({ label: f.label, value: String(record[f.key] ?? '') }))

  const description = String(record.description ?? '')
  const element = String(record.element ?? '')

  const res = await fetch('/api/generate-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      docType,
      titleAr,
      request_no: reqNo,
      submission_date: subDate,
      description,
      element,
      fields: formFields,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'خطأ غير معروف' }))
    throw new Error(err.error ?? 'فشل توليد النموذج')
  }

  const blob = await res.blob()
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${reqNo || docType}.xlsx`
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

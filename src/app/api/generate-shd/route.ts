import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import JSZip from 'jszip'

// Escape special XML characters
function xmlEsc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Replace a single cell's value with an inline string.
 * Preserves the s= (style) attribute so all formatting stays intact.
 * Works whether the original cell was shared-string, number, or formula.
 */
function setCell(sheetXml: string, addr: string, value: string): string {
  const safe = xmlEsc(value)
  // Match <c r="ADDR" ...>...</c>  (r is always first attr in Excel XML)
  const re = new RegExp(`<c r="${addr}"([^>]*)>([\\s\\S]*?)</c>`)
  if (!re.test(sheetXml)) return sheetXml

  return sheetXml.replace(re, (_, attrs) => {
    const sMatch = attrs.match(/\bs="(\d+)"/)
    const sAttr  = sMatch ? ` s="${sMatch[1]}"` : ''
    return `<c r="${addr}"${sAttr} t="inlineStr"><is><t>${safe}</t></is></c>`
  })
}

export async function POST(req: NextRequest) {
  try {
    const record = await req.json() as Record<string, unknown>

    const templatePath = path.join(process.cwd(), 'public', 'shd_template.xlsx')
    const templateBuffer = await fs.readFile(templatePath)

    // Open the xlsx as a ZIP archive — no parsing, no style loss
    const zip = await JSZip.loadAsync(templateBuffer)

    // Read the first worksheet XML
    const sheetFile = zip.file('xl/worksheets/sheet1.xml')
    if (!sheetFile) throw new Error('sheet1.xml غير موجود في القالب')
    let sheetXml = await sheetFile.async('string')

    const today   = new Date().toLocaleDateString('en-GB')
    const reqNo   = String(record.request_no      ?? '')
    const desc    = String(record.description     ?? '')
    const el      = String(record.element         ?? '')
    const subDate = String(record.submission_date ?? today)

    // تحديث قيم الخلايا فقط — التصميم والصور وكل شيء آخر يبقى كما هو
    sheetXml = setCell(sheetXml, 'A5',  'Project Name: HARAJ-IQC-ALRAWAF')
    sheetXml = setCell(sheetXml, 'A6',  'Project Location: RIYADH')
    sheetXml = setCell(sheetXml, 'A10', `Date: ${subDate}`)
    sheetXml = setCell(sheetXml, 'F10', `SHD. No. ${reqNo}`)
    sheetXml = setCell(sheetXml, 'A12', desc)
    sheetXml = setCell(sheetXml, 'B16', `DICIPLINE: ${el}`)
    sheetXml = setCell(sheetXml, 'D20', desc)

    // Write the modified XML back into the ZIP — everything else untouched
    zip.file('xl/worksheets/sheet1.xml', sheetXml)

    const bytes = await zip.generateAsync({
      type:        'uint8array',
      compression: 'DEFLATE',
    })

    const blob = new Blob([bytes.buffer.slice(0) as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    return new NextResponse(blob, {
      headers: {
        'Content-Disposition': `attachment; filename="${reqNo || 'SHD'}_Submittal.xlsx"`,
      },
    })
  } catch (err) {
    console.error('[generate-shd]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

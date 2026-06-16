import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import ExcelJS from 'exceljs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      request_no?: string
      submission_date?: string
      description?: string
      element?: string
      reqNo?: string
      subDate?: string
      fields?: Array<{ label: string; value: string }>
      // عناصر نائبة مخصصة - يمكن إرسال أي key/value
      placeholders?: Record<string, string>
      // لإضافة صفوف متعددة في الجدول
      items?: Array<{ description: string; specNo?: string; drawingNo?: string }>
    }

    const templatePath = path.join(process.cwd(), 'public', 'mms_template_2.xlsx')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(templatePath)

    const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0]
    if (!worksheet) throw new Error('لم يتم العثور على ورقة العمل')

    // إعداد القيم الافتراضية
    const today = new Date().toLocaleDateString('en-GB')
    const reqNo = body.request_no ?? body.reqNo ?? ''
    const subDate = body.submission_date ?? body.subDate ?? today
    const description = body.description ?? ''
    const element = body.element ?? ''

    // تجميع كل العناصر النائبة (الثابتة + المخصصة)
    const allPlaceholders: Record<string, string> = {
      REQUEST_NO: reqNo,
      DATE: subDate,
      DESCRIPTION: description,
      // ELEMENT: element,
      // ...(body.placeholders || {}),
    }

    // تأكيد أن صفحة الطباعة بالعرض إذا كان هذا القالب يستخدم عرض الصفحة
    worksheet.pageSetup = {
      ...worksheet.pageSetup,
      orientation: 'landscape',
      fitToPage: true,
    }

    // 1. استبدال العناصر النائبة في كل الخلايا (بما فيها المدمجة)
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (typeof cell.value === 'string') {
          let newValue = cell.value
          for (const [key, val] of Object.entries(allPlaceholders)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
            newValue = newValue.replace(regex, val || '')
          }
          if (newValue !== cell.value) {
            cell.value = newValue
          }
        }
      })
    })

    // 1.b إضافة بيانات إضافية بناءً على الحقول المرسلة
    if (body.fields && body.fields.length) {
      let infoRow = 15
      while (worksheet.getRow(infoRow).getCell('B').value && infoRow < 20) {
        infoRow++
      }
      for (const field of body.fields) {
        const row = worksheet.getRow(infoRow++)
        row.getCell('B').value = field.label
        row.getCell('C').value = field.value
        row.height = 18
      }
    }

    // 2. إضافة صفوف الجدول (إذا وُجدت items) مع التعامل مع الخلايا المدمجة
    if (body.items && body.items.length) {
      // نبحث عن أول صف فارغ تحت الصف 13 (حيث يبدأ الجدول)
      let insertRowIndex = 13
      while (worksheet.getRow(insertRowIndex).getCell('B').value) {
        insertRowIndex++
      }

      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i]
        const targetRow = worksheet.getRow(insertRowIndex + i)
        
        // تعيين القيم في الأعمدة المطلوبة (حسب القالب)
        for (const col of ['B', 'C', 'D', 'E', 'F', 'G', 'H']) {
          targetRow.getCell(col).value = item.description || ''
        }
        targetRow.getCell('I').value = item.specNo || ''     // SPECS PARA NO.
        targetRow.getCell('J').value = item.drawingNo || ''  // DRAWING SHEET NO.
        targetRow.height = 18
      }
    }

    // 3. (اختياري) تعديل التواقيع أو أي خلايا أخرى ثابتة
    // مثال: تغيير اسم المقاول
    // worksheet.getCell('B26').value = 'RAWAF CONTRACTING CO.'

    // كتابة الملف النهائي
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    return new NextResponse(blob, {
      headers: {
        'Content-Disposition': `attachment; filename="${reqNo || 'MMS'}_Submittal.xlsx"`,
      },
    })
  } catch (err) {
    console.error('[generate-shd]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
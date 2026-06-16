
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import ExcelJS from 'exceljs'

export async function POST(req: NextRequest) {
  try {
    const record = await req.json() as Record<string, unknown>

    const templatePath = path.join(process.cwd(), 'public', 'mms_template.xlsx')
    
    // تحميل القالب باستخدام ExcelJS
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(templatePath)
    
    // الوصول إلى الورقة الأولى (Trans. for Approval)
    const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0]
    if (!worksheet) throw new Error('لم يتم العثور على ورقة عمل في القالب')

    // إعداد البيانات
    const today = new Date().toLocaleDateString('en-GB')
    const reqNo = String(record.request_no ?? '')
    const description = String(record.description ?? '')
    const element = String(record.element ?? '')
    const subDate = String(record.submission_date ?? today)

    // البحث عن الخلايا التي تحتوي على عناصر نائبة واستبدالها
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        let value = cell.value?.toString() || ''
        
        // استبدال العناصر النائبة
        value = value.replace(/\{\{REQUEST_NO\}\}/g, reqNo || '_______')
        value = value.replace(/\{\{DATE\}\}/g, subDate)
        value = value.replace(/\{\{DESCRIPTION\}\}/g, description)
        value = value.replace(/\{\{ELEMENT\}\}/g, element)
        
        // إعادة تعيين القيمة إذا تغيرت
        if (value !== cell.value?.toString()) {
          cell.value = value
        }
      })
    })

    // إضافة إمكانية إدراج صفوف متعددة (في حال أردت إضافة بنود إضافية)
    // مثال: إضافة صف جديد تحت البند الأول إذا أرسلت مصفوفة items
    if (record.items && Array.isArray(record.items)) {
      const startRow = 13 // الصف الذي يبدأ فيه جدول البيانات (حسب القالب)
      record.items.forEach((item: any, idx: number) => {
        const targetRow = worksheet.getRow(startRow + idx)
        targetRow.getCell('B').value = item.description || ''
        targetRow.getCell('I').value = item.specNo || ''
        // يمكنك إضافة المزيد من الأعمدة حسب الحاجة
      })
    }

    // إعداد التحميل
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
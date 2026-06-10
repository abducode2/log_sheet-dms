
'use client'
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Topbar from '@/components/layout/Topbar'
import { useRole } from '@/lib/hooks/useRole'
import styles from './import.module.css'

// ── Sheet → Table mapping ────────────────────────────────────────
const SHEET_MAP: Record<string, string> = {
  'SHOP DRAWING':        'shop_drawings',
  'MATERIAL SUBMITTAL':  'material_submittals',
  'SUPPLIER':            'supplier_prequalifications',
  'INSPECTION REQUEST':  'inspection_requests',
  'CONCRETE POUR':       'concrete_pour_requests',
  'RFI':                 'requests_for_information',
  'NCR':                 'non_conformance_reports',
  'TRANSMITTAL':         'document_transmittals',
  'RAWAF-NAGA':          'letters_rawaf_naga',
  'NAGA-RAWAF':          'letters_naga_rawaf',
}

const TABLE_LABELS: Record<string, string> = {
  shop_drawings:               'رسومات التنفيذ',
  material_submittals:         'تقديمات المواد',
  supplier_prequalifications:  'تأهيل الموردين',
  inspection_requests:         'طلبات الفحص',
  concrete_pour_requests:      'طلبات الصب',
  requests_for_information:    'طلبات الاستيضاح RFI',
  non_conformance_reports:     'تقارير عدم المطابقة',
  document_transmittals:       'إرسال الوثائق',
  letters_rawaf_naga:          'مراسلات المقاول  ← الاستشاري',
  letters_naga_rawaf:          'مراسلات الاستشاري ← المقاول ',
}

// ── Column mapping per table ─────────────────────────────────────
function mapRow(table: string, row: Record<string, unknown>, idx: number): Record<string, unknown> {
  const clean = (v: unknown) => (v === null || v === undefined || v === '') ? null : String(v).trim()

  // Flexible column getter — tries multiple name variants
  const get = (row: Record<string, unknown>, ...keys: string[]) => {
    for (const k of keys) {
      // exact match
      if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k]
      // case-insensitive match
      const found = Object.entries(row).find(([rk]) =>
        rk.trim().toUpperCase() === k.toUpperCase()
      )
      if (found && found[1] !== null && found[1] !== '') return found[1]
    }
    return null
  }
  const num   = (v: unknown) => { const n = Number(v); return isNaN(n) ? null : n }
  const date  = (v: unknown) => {
    if (!v) return null
    if (typeof v === 'number') {
      const d = new Date((v - 25569) * 86400 * 1000)
      return d.toISOString().slice(0, 10)
    }
    const s = String(v).trim()
    return s || null
  }

  const no = idx + 1

  switch (table) {
    case 'shop_drawings': return {
      no,
      request_no:      clean(get(row,'REQUEST NO','رقم الطلب','REF NO','NO.')),
      description:     clean(get(row,'DESCRIPTION','الوصف','TITLE','وصف الرسم')),
      element:         clean(get(row,'ELEMENT','العنصر','DISCIPLINE','TYPE')),
      rev:             num(get(row,'REV','REVISION','المراجعة')) ?? 0,
      submission_date: date(get(row,'SUBMISSION DATE','تاريخ التقديم','SUB DATE','DATE')),
      ac_co:           clean(get(row,'AC/CO','الحالة','STATUS','RESULT','AC CO')),
      approval_date:   date(get(row,'APPROVAL DATE','تاريخ الاعتماد','APP DATE')),
      v_time:          num(get(row,'V.TIME','V.Time','VTIME','DAYS')),
      remarks:         clean(get(row,'REMARKS','ملاحظات','NOTES','COMMENT')),
    }
    case 'material_submittals': return {
      no,
      request_no:      clean(get(row,'REQUEST NO','رقم الطلب','REF NO')),
      description:     clean(get(row,'DESCRIPTION','الوصف','TITLE')),
      element:         clean(get(row,'ELEMENT','العنصر','TYPE')) ?? 'GEN',
      rev:             num(get(row,'REV','REVISION')) ?? 0,
      submission_date: date(get(row,'SUBMISSION DATE','تاريخ التقديم','DATE')),
      status:          clean(get(row,'STATUS','الحالة','AC/CO','RESULT')),
      approval_date:   date(get(row,'APPROVAL DATE','تاريخ الاعتماد')),
      v_time:          num(get(row,'V.TIME','V.Time','VTIME')),
      remarks:         clean(get(row,'REMARKS','ملاحظات')),
    }
    case 'supplier_prequalifications': return {
      no,
      request_no:      clean(get(row,'REQUEST NO','رقم الطلب')),
      supplier_name:   clean(get(row,'SUPPLIER NAME','اسم المورد','SUPPLIER','NAME')),
      trade:           clean(get(row,'TRADE','التخصص','SCOPE')),
      element:         clean(get(row,'ELEMENT','العنصر')) ?? 'GEN',
      submission_date: date(get(row,'SUBMISSION DATE','تاريخ التقديم','DATE')),
      status:          clean(get(row,'STATUS','الحالة','RESULT')),
      remarks:         clean(get(row,'REMARKS','ملاحظات')),
    }
    case 'inspection_requests': return {
      no,
      ir_no:           clean(get(row,'IR NO','REQUEST NO','رقم الطلب','REF NO')),
      description:     clean(get(row,'DESCRIPTION','الوصف','TITLE')),
      location:        clean(get(row,'LOCATION','الموقع','AREA')),
      element:         clean(get(row,'ELEMENT','العنصر')) ?? 'GEN',
      request_date:    date(get(row,'REQUEST DATE','تاريخ الطلب','DATE','SUBMISSION DATE')),
      inspection_date: date(get(row,'INSPECTION DATE','تاريخ الفحص')),
      ac_co:           clean(get(row,'RESULT','STATUS','الحالة','AC/CO')),
      remarks:         clean(get(row,'REMARKS','ملاحظات')),
    }
    case 'concrete_pour_requests': return {
      no,
      cpr_no:      clean(get(row,'CPR NO','REQUEST NO','رقم الطلب','REF NO')),
      description: clean(get(row,'DESCRIPTION','الوصف','ELEMENT DESC','TITLE')),
      location:    clean(get(row,'LOCATION','الموقع','AREA')),
      element:     'SC',
      pour_date:   date(get(row,'POUR DATE','DATE','تاريخ الصب')),
      volume_m3:   num(get(row,'VOLUME M3','VOLUME','الحجم','M3')),
      mix_design:  clean(get(row,'MIX DESIGN','MIX','التصميم')),
      ac_co:       clean(get(row,'STATUS','الحالة','RESULT','AC/CO')),
      remarks:     clean(get(row,'REMARKS','ملاحظات')),
    }
    case 'requests_for_information': return {
      no,
      rfi_no:          clean(get(row,'RFI NO','REQUEST NO','رقم الطلب','REF NO')),
      subject:         clean(get(row,'SUBJECT','الموضوع','TITLE','DESCRIPTION')),
      element:         clean(get(row,'ELEMENT','العنصر')) ?? 'GEN',
      submission_date: date(get(row,'SUBMISSION DATE','DATE','تاريخ التقديم')),
      response_date:   date(get(row,'RESPONSE DATE','REPLY DATE','تاريخ الرد')),
      ac_co:           clean(get(row,'STATUS','الحالة','RESULT','AC/CO')),
      question:        clean(get(row,'QUESTION','السؤال')),
      answer:          clean(get(row,'ANSWER','الإجابة')),
      remarks:         clean(get(row,'REMARKS','ملاحظات')),
    }
    case 'non_conformance_reports': return {
      no,
      ncr_no:            clean(get(row,'NCR NO','REQUEST NO','رقم التقرير','REF NO')),
      description:       clean(get(row,'DESCRIPTION','الوصف','TITLE')),
      location:          clean(get(row,'LOCATION','الموقع','AREA')),
      issue_date:        date(get(row,'ISSUE DATE','DATE','تاريخ الإصدار')),
      close_date:        date(get(row,'CLOSE DATE','تاريخ الإغلاق')),
      status:            clean(get(row,'STATUS','الحالة')) ?? 'Open',
      corrective_action: clean(get(row,'CORRECTIVE ACTION','CORRECTIVE','الإجراء')),
      remarks:           clean(get(row,'REMARKS','ملاحظات')),
    }
    case 'document_transmittals': return {
      no,
      transmittal_no: clean(get(row,'TRANSMITTAL NO','REQUEST NO','رقم الإرسال','REF NO')),
      subject:        clean(get(row,'SUBJECT','الموضوع','TITLE','DESCRIPTION')),
      from_party:     clean(get(row,'FROM','من','FROM PARTY')),
      to_party:       clean(get(row,'TO','إلى','TO PARTY')),
      element:        clean(get(row,'ELEMENT','العنصر')) ?? 'GEN',
      date:           date(get(row,'DATE','التاريخ','TRANSMITTAL DATE')),
      no_of_copies:   num(get(row,'COPIES','NO OF COPIES','النسخ')) ?? 1,
      remarks:        clean(get(row,'REMARKS','ملاحظات')),
    }
    case 'letters_rawaf_naga':
    case 'letters_naga_rawaf': return {
      no,
      letter_no: clean(get(row,'LETTER NO','رقم الخطاب','REF NO','CODE','NO.')),
      subject:   clean(get(row,'SUBJECT','الموضوع','TITLE','DESCRIPTION')),
      date:      date(get(row,'DATE','التاريخ','LETTER DATE')),
      remarks:   clean(get(row,'REMARKS','ملاحظات')),
    }
    default: return { no, ...row }
  }
}

type SheetPreview = {
  sheetName: string
  table: string
  label: string
  count: number
  sample: Record<string, unknown>[]
}

type ImportResult = { success: number; error: string | null }

export default function ImportPage() {
  const supabase = createClient()
  const { isAdmin, isEditor } = useRole()
  const [status, setStatus]     = useState<'idle'|'parsing'|'preview'|'importing'|'done'|'error'>('idle')
  const [sheets, setSheets]     = useState<SheetPreview[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [parsed, setParsed]     = useState<Record<string, Record<string, unknown>[]>>({})
  const [results, setResults]   = useState<Record<string, ImportResult>>({})
  const [errorMsg, setErrorMsg] = useState('')
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<Record<string,boolean>>({})

  const processFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xlsm|xls)$/i)) {
      setErrorMsg('يرجى رفع ملف Excel فقط (.xlsx, .xlsm, .xls)')
      setStatus('error'); return
    }
    setStatus('parsing'); setErrorMsg('')
    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type:'array', cellDates: false })

      const allParsed: Record<string, Record<string, unknown>[]> = {}
      const previews: SheetPreview[] = []

      for (const sheetName of wb.SheetNames) {
        // Match sheet name to table
        const table = Object.entries(SHEET_MAP).find(([key]) =>
          sheetName.toUpperCase().includes(key)
        )?.[1]
        if (!table) continue

        const ws = wb.Sheets[sheetName]
        const raw = XLSX.utils.sheet_to_json<Record<string,unknown>>(ws, { defval: null })
        if (raw.length === 0) continue

        const mapped = raw.map((row, i) => mapRow(table, row, i))
          .filter(r => Object.values(r).some(v => v !== null && v !== undefined && v !== ''))

        if (mapped.length === 0) continue

        allParsed[table] = mapped
        previews.push({
          sheetName,
          table,
          label: TABLE_LABELS[table] ?? table,
          count: mapped.length,
          sample: mapped.slice(0, 2),
        })
      }

      setSheets(previews)
      setParsed(allParsed)
      setSelected(new Set(previews.map(p => p.table)))
      setStatus('preview')
    } catch (e) {
      setErrorMsg('فشل في قراءة الملف: ' + String(e))
      setStatus('error')
    }
  }, [])

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  async function startImport() {
    setStatus('importing')
    const res: Record<string, ImportResult> = {}
    const prog: Record<string,boolean> = {}

    for (const table of selected) {
      const rows = parsed[table] ?? []
      if (!rows.length) continue
      prog[table] = false
      setProgress({...prog})
      try {
        // Step 1: حذف الأبناء أولاً (تجنب FK error)
        const { error: archivedDeleteErr } = await supabase.from(table).delete().not('id', 'is', null).eq('is_archived', true)
        if (archivedDeleteErr) console.warn('Archived delete warning:', archivedDeleteErr.message)
        // Step 2: حذف كل السجلات
        const { error: delErr } = await supabase.from(table).delete().not('id', 'is', null)
        if (delErr) console.warn('Delete warning:', delErr.message)

        // Step 3: إضافة الكل من جديد
        let success = 0
        for (let i = 0; i < rows.length; i += 100) {
          const batch = rows.slice(i, i + 100)
          const { error } = await supabase.from(table).insert(batch)
          if (error) throw new Error(error.message)
          success += batch.length
        }
        res[table] = { success, error: null }
      } catch (e: unknown) {
        res[table] = { success: 0, error: e instanceof Error ? e.message : String(e) }
      }
      prog[table] = true
      setProgress({...prog})
    }
    setResults(res)
    setStatus('done')
  }

  // ── Download template ──────────────────────────────────────────
  async function downloadTemplate() {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()

    const sheets: Record<string, string[][]> = {
      'SHOP DRAWING':       [['REQUEST NO','DESCRIPTION','ELEMENT','REV','SUBMISSION DATE','AC/CO','APPROVAL DATE','V.TIME','REMARKS'],
                             ['M2P06-RWF-SHD-AR-001','SAMPLE DRAWING','AR','0','2024-01-15','B','2024-01-20','5','']],
      'MATERIAL SUBMITTAL': [['REQUEST NO','DESCRIPTION','ELEMENT','REV','SUBMISSION DATE','STATUS','APPROVAL DATE','V.TIME','REMARKS'],
                             ['M2P06-RWF-MAT-001','CEMENT TYPE I','SC','0','2024-01-15','B','','','']],
      'SUPPLIER':           [['REQUEST NO','SUPPLIER NAME','TRADE','ELEMENT','SUBMISSION DATE','STATUS','REMARKS'],
                             ['M2P06-SUP-001','شركة الأمل','خرسانة','SC','2024-01-15','B','']],
      'INSPECTION REQUEST': [['IR NO','DESCRIPTION','LOCATION','ELEMENT','REQUEST DATE','INSPECTION DATE','RESULT','REMARKS'],
                             ['M2P06-IR-001','RAFT FOUNDATION','BLOCK 01','SC','2024-01-15','2024-01-16','Approved','']],
      'CONCRETE POUR':      [['CPR NO','DESCRIPTION','LOCATION','POUR DATE','VOLUME M3','MIX DESIGN','STATUS','REMARKS'],
                             ['M2P06-CPR-001','RAFT SLAB','BLOCK 01','2024-01-20','150','C35','B','']],
      'RFI':                [['RFI NO','SUBJECT','ELEMENT','SUBMISSION DATE','RESPONSE DATE','STATUS','QUESTION','ANSWER','REMARKS'],
                             ['M2P06-RFI-001','سؤال عن التسليح','SC','2024-01-15','2024-01-20','B','السؤال هنا','الإجابة هنا','']],
      'NCR':                [['NCR NO','DESCRIPTION','LOCATION','ISSUE DATE','CLOSE DATE','STATUS','CORRECTIVE ACTION','REMARKS'],
                             ['M2P06-NCR-001','تشققات في الخرسانة','BLOCK 01','2024-01-15','','Open','إجراء تصحيحي','']],
      'TRANSMITTAL':        [['TRANSMITTAL NO','SUBJECT','FROM','TO','ELEMENT','DATE','COPIES','REMARKS'],
                             ['M2P06-TR-001','إرسال مخططات','المقاول ','الاستشاري','AR','2024-01-15','3','']],
      'RAWAF-NAGA':         [['LETTER NO','SUBJECT','DATE','REMARKS'],
                             ['M2P06-RWF-NAG-001','موضوع الخطاب الصادر','2024-01-15','']],
      'NAGA-RAWAF':         [['LETTER NO','SUBJECT','DATE','REMARKS'],
                             ['M2P06-NAG-RWF-001','موضوع الخطاب الوارد','2024-01-15','']],
    }

    for (const [name, data] of Object.entries(sheets)) {
      const ws = XLSX.utils.aoa_to_sheet(data)
      // Style header row
      const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1')
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = XLSX.utils.encode_cell({r:0, c})
        if (!ws[cell]) continue
        ws[cell].s = { font:{bold:true}, fill:{fgColor:{rgb:'1F6FEB'}}, alignment:{horizontal:'center'} }
      }
      ws['!cols'] = Array(data[0].length).fill({wch:22})
      XLSX.utils.book_append_sheet(wb, ws, name)
    }

    XLSX.writeFile(wb, 'P179_Import_Template.xlsx')
  }

  const totalRows = [...selected].reduce((s,t) => s+(parsed[t]?.length??0), 0)

  return (
    <>
      <Topbar
        title="استيراد البيانات من Excel"
        sub="رفع ملف Excel وتعبئة قاعدة البيانات تلقائياً"
        actions={
          <button className="btn btn-ghost btn-sm" onClick={downloadTemplate}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تحميل نموذج Excel
          </button>
        }
      />

      <div className="page-content">
        {!isEditor ? (
          <div className="empty-state">
            <div className="empty-title">أنت غير مخول للوصول إلى استيراد Excel</div>
            <div className="empty-sub">فقط المحررون والمدراء يمكنهم رفع واستيراد الملفات.</div>
          </div>
        ) : (
          <>
            {/* ── Drop Zone ── */}
            {(status === 'idle' || status === 'error') && (
          <div
            className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input id="fileInput" type="file" accept=".xlsx,.xlsm,.xls"
              onChange={e => { const f=e.target.files?.[0]; if(f) processFile(f) }}
              style={{display:'none'}}/>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              style={{color:'var(--blue)',marginBottom:16}}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <div className={styles.dropTitle}>اسحب ملف Excel هنا أو اضغط للاختيار</div>
            <div className={styles.dropSub}>يدعم .xlsx · .xlsm · .xls</div>
            <div className={styles.dropHint}>
              الشيتات المدعومة: SHOP DRAWING · MATERIAL SUBMITTAL · SUPPLIER · INSPECTION REQUEST ·
              CONCRETE POUR · RFI · NCR · TRANSMITTAL · RAWAF-NAGA · NAGA-RAWAF
            </div>
            {errorMsg && <div className={styles.errMsg}>{errorMsg}</div>}
          </div>
        )}

        {/* ── Parsing ── */}
        {status === 'parsing' && (
          <div className={styles.loading}>
            <div className="spinner" style={{width:32,height:32,borderWidth:3}}/>
            <div>جارٍ قراءة الملف وتحليل الشيتات...</div>
          </div>
        )}

        {/* ── Preview ── */}
        {status === 'preview' && (
          <div>
            <div className={styles.previewBar}>
              <div>
                <div className={styles.previewTitle}>معاينة البيانات</div>
                <div className={styles.previewSub}>
                  تم العثور على {sheets.length} شيت · {sheets.reduce((s,sh)=>s+sh.count,0)} سجل إجمالي
                </div>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button className="btn btn-ghost" onClick={()=>setStatus('idle')}>← اختر ملفاً آخر</button>
                <button className="btn btn-primary" onClick={startImport} disabled={!selected.size}>
                  استيراد {totalRows} سجل من {selected.size} شيت
                </button>
              </div>
            </div>

            <div className={styles.sheetGrid}>
              {sheets.map(s => (
                <div key={s.table}
                  className={`${styles.sheetCard} ${selected.has(s.table)?styles.selected:''}`}
                  onClick={() => setSelected(prev => {
                    const n=new Set(prev); n.has(s.table)?n.delete(s.table):n.add(s.table); return n
                  })}>
                  <div className={styles.sheetCheck}>
                    {selected.has(s.table)
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      : <div style={{width:16,height:16,border:'2px solid var(--border)',borderRadius:4}}/>
                    }
                  </div>
                  <div style={{flex:1}}>
                    <div className={styles.sheetLabel}>{s.label}</div>
                    <div className={styles.sheetMeta}>{s.sheetName} · {s.count} سجل</div>
                  </div>
                  <span className={styles.sheetCount}>{s.count}</span>
                </div>
              ))}
            </div>

            {sheets.length === 0 && (
              <div className="empty-state">
                <div className="empty-title">لم يتم العثور على شيتات مطابقة</div>
                <div className="empty-sub">تأكد أن أسماء الشيتات تحتوي على: SHOP DRAWING, RFI, NCR...</div>
              </div>
            )}
          </div>
        )}

        {/* ── Importing ── */}
        {status === 'importing' && (
          <div className={styles.importingWrap}>
            <div style={{fontSize:16,fontWeight:600,marginBottom:24}}>جارٍ الاستيراد...</div>
            {[...selected].map(table => (
              <div key={table} className={styles.progressRow}>
                <div className={styles.progressLabel}>{TABLE_LABELS[table]}</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill}
                    style={{width: progress[table] ? '100%' : '0%',
                      background: progress[table] ? 'var(--green)' : 'var(--blue)'}}/>
                </div>
                <div className={styles.progressStatus}>
                  {progress[table] ? '✓' : <div className="spinner" style={{width:14,height:14}}/>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Done ── */}
        {status === 'done' && (
          <div>
            <div className={styles.doneHeader}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <div>
                <div className={styles.doneTitle}>اكتمل الاستيراد بالاستشاريح!</div>
                <div className={styles.doneSub}>
                  {Object.values(results).reduce((s,r)=>s+r.success,0)} سجل تم استيراده
                </div>
              </div>
            </div>

            <div className={styles.resultsGrid}>
              {Object.entries(results).map(([table, r]) => (
                <div key={table} className={`${styles.resultCard} ${r.error?styles.resultErr:styles.resultOk}`}>
                  <div className={styles.resultLabel}>{TABLE_LABELS[table]}</div>
                  <div className={styles.resultCount}>
                    {r.error ? `❌ ${r.error.slice(0,60)}` : `✅ ${r.success} سجل`}
                  </div>
                </div>
              ))}
            </div>

            <div style={{display:'flex',gap:12,marginTop:24}}>
              <button className="btn btn-primary" onClick={()=>window.location.href='/dashboard'}>
                → الذهاب للوحة التحكم
              </button>
              <button className="btn btn-ghost" onClick={()=>{setStatus('idle');setSheets([]);setResults({})}}>
                استيراد ملف آخر
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </>
  )
}

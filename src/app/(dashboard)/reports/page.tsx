'use client'
import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Topbar from '@/components/layout/Topbar'

// ── Section definitions ──────────────────────────────────
type ColDef = { key: string; label: string; type?: 'code' | 'desc' | 'date' | 'status' | 'text' }
type Section = { table: string; label: string; dot: string; dateField: string; keyCols: ColDef[] }

const SECTIONS: Section[] = [
  {
    table: 'shop_drawings', label: 'رسومات التنفيذ', dot: '#58a6ff', dateField: 'submission_date',
    keyCols: [
      { key: 'request_no',      label: 'رقم الطلب',       type: 'code' },
      { key: 'description',     label: 'الوصف',            type: 'desc' },
      { key: 'element',         label: 'النوع',            type: 'text' },
      { key: 'submission_date', label: 'تاريخ التقديم',   type: 'date' },
      { key: 'ac_co',           label: 'الحالة',           type: 'status' },
    ],
  },
  {
    table: 'material_submittals', label: 'تقديمات المواد', dot: '#3fb950', dateField: 'submission_date',
    keyCols: [
      { key: 'request_no',      label: 'رقم الطلب',       type: 'code' },
      { key: 'description',     label: 'الوصف',            type: 'desc' },
      { key: 'submission_date', label: 'تاريخ التقديم',   type: 'date' },
      { key: 'status',          label: 'الحالة',           type: 'status' },
    ],
  },
  {
    table: 'supplier_prequalifications', label: 'تأهيل الموردين', dot: '#d29922', dateField: 'submission_date',
    keyCols: [
      { key: 'supplier_name',   label: 'المورد',           type: 'desc' },
      { key: 'trade',           label: 'التخصص',           type: 'text' },
      { key: 'submission_date', label: 'تاريخ التقديم',   type: 'date' },
      { key: 'status',          label: 'الحالة',           type: 'status' },
    ],
  },
  {
    table: 'inspection_requests', label: 'طلبات الفحص', dot: '#bc8cff', dateField: 'request_date',
    keyCols: [
      { key: 'ir_no',           label: 'رقم الطلب',       type: 'code' },
      { key: 'description',     label: 'الوصف',            type: 'desc' },
      { key: 'location',        label: 'الموقع',           type: 'text' },
      { key: 'request_date',    label: 'تاريخ الطلب',     type: 'date' },
      { key: 'result',          label: 'النتيجة',          type: 'status' },
    ],
  },
  {
    table: 'concrete_pour_requests', label: 'طلبات الصب CPR', dot: '#f85149', dateField: 'pour_date',
    keyCols: [
      { key: 'cpr_no',          label: 'رقم CPR',         type: 'code' },
      { key: 'description',     label: 'الوصف',            type: 'desc' },
      { key: 'location',        label: 'الموقع',           type: 'text' },
      { key: 'pour_date',       label: 'تاريخ الصب',      type: 'date' },
      { key: 'status',          label: 'الحالة',           type: 'status' },
    ],
  },
  {
    table: 'requests_for_information', label: 'طلبات الاستيضاح RFI', dot: '#39d353', dateField: 'submission_date',
    keyCols: [
      { key: 'rfi_no',          label: 'رقم RFI',         type: 'code' },
      { key: 'subject',         label: 'الموضوع',          type: 'desc' },
      { key: 'submission_date', label: 'تاريخ التقديم',   type: 'date' },
      { key: 'status',          label: 'الحالة',           type: 'status' },
    ],
  },
  {
    table: 'non_conformance_reports', label: 'تقارير عدم المطابقة NCR', dot: '#ff7b72', dateField: 'issue_date',
    keyCols: [
      { key: 'ncr_no',          label: 'رقم NCR',         type: 'code' },
      { key: 'description',     label: 'الوصف',            type: 'desc' },
      { key: 'location',        label: 'الموقع',           type: 'text' },
      { key: 'issue_date',      label: 'تاريخ الإصدار',  type: 'date' },
      { key: 'status',          label: 'الحالة',           type: 'status' },
    ],
  },
  {
    table: 'document_transmittals', label: 'إرسال الوثائق', dot: '#8b949e', dateField: 'date',
    keyCols: [
      { key: 'transmittal_no',  label: 'رقم الإرسال',    type: 'code' },
      { key: 'subject',         label: 'الموضوع',          type: 'desc' },
      { key: 'from_party',      label: 'من',               type: 'text' },
      { key: 'to_party',        label: 'إلى',              type: 'text' },
      { key: 'date',            label: 'التاريخ',          type: 'date' },
    ],
  },
  {
    table: 'letters_rawaf_naga', label: 'مراسلات المقاول ← الاستشاري', dot: '#ffa657', dateField: 'date',
    keyCols: [
      { key: 'letter_no',       label: 'رقم الخطاب',      type: 'code' },
      { key: 'subject',         label: 'الموضوع',          type: 'desc' },
      { key: 'date',            label: 'التاريخ',          type: 'date' },
    ],
  },
  {
    table: 'letters_naga_rawaf', label: 'مراسلات الاستشاري ← المقاول', dot: '#f85149', dateField: 'date',
    keyCols: [
      { key: 'letter_no',       label: 'رقم الخطاب',      type: 'code' },
      { key: 'subject',         label: 'الموضوع',          type: 'desc' },
      { key: 'date',            label: 'التاريخ',          type: 'date' },
    ],
  },
  {
    table: 'field_reports', label: 'التقارير الميدانية', dot: '#a5d6ff', dateField: 'date',
    keyCols: [
      { key: 'report_no',       label: 'رقم التقرير',     type: 'code' },
      { key: 'subject',         label: 'الموضوع',          type: 'desc' },
      { key: 'inspector',       label: 'المفتش',           type: 'text' },
      { key: 'date',            label: 'التاريخ',          type: 'date' },
      { key: 'status',          label: 'الحالة',           type: 'status' },
    ],
  },
]

// ── Date helpers ─────────────────────────────────────────
function fmt(d: Date) { return d.toISOString().slice(0, 10) }
function weekRange()      { const t = new Date(); const s = new Date(t); s.setDate(t.getDate() - t.getDay()); return { from: fmt(s), to: fmt(t) } }
function monthRange()     { const t = new Date(); return { from: fmt(new Date(t.getFullYear(), t.getMonth(), 1)), to: fmt(t) } }
function lastMonthRange() { const t = new Date(); return { from: fmt(new Date(t.getFullYear(), t.getMonth() - 1, 1)), to: fmt(new Date(t.getFullYear(), t.getMonth(), 0)) } }

// ── Status badge style ───────────────────────────────────
function stBadge(val: string) {
  const v = val.toUpperCase()
  if (['A','APPROVED','PASS','CLOSED'].includes(v)) return { bg: '#1a7f37', color: '#fff' }
  if (v === 'B')                                    return { bg: '#1f6feb', color: '#fff' }
  if (['C','REVISION'].includes(v))                 return { bg: '#9e6a03', color: '#fff' }
  if (['D','REJECTED','FAIL'].includes(v))          return { bg: '#da3633', color: '#fff' }
  if (['OPEN','PENDING'].includes(v))               return { bg: '#da3633', color: '#fff' }
  if (v === 'CONDITIONAL')                          return { bg: '#9e6a03', color: '#fff' }
  return { bg: '#30363d', color: '#8b949e' }
}

type SectionResult = { count: number; rows: Record<string, unknown>[] }

export default function ReportsPage() {
  const supabase = createClient()
  const init = monthRange()

  const [from, setFrom] = useState(init.from)
  const [to, setTo]     = useState(init.to)
  const [loading, setLoading]   = useState(false)
  const [ran, setRan]           = useState(false)
  const [results, setResults]   = useState<Record<string, SectionResult>>({})
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const run = useCallback(async (f: string, t: string) => {
    setLoading(true); setRan(true)
    const fetched = await Promise.all(
      SECTIONS.map(async sec => {
        const { data, count } = await supabase
          .from(sec.table)
          .select('*', { count: 'exact' })
          .gte(sec.dateField, f)
          .lte(sec.dateField, t)
          .order(sec.dateField, { ascending: true })
        return { table: sec.table, rows: (data ?? []) as Record<string, unknown>[], count: count ?? 0 }
      })
    )
    const map: Record<string, SectionResult> = {}
    for (const r of fetched) map[r.table] = { count: r.count, rows: r.rows }
    setResults(map)
    setExpanded(new Set(fetched.filter(r => r.count > 0).map(r => r.table)))
    setLoading(false)
  }, [])

  function shortcut(range: { from: string; to: string }) {
    setFrom(range.from); setTo(range.to); run(range.from, range.to)
  }

  function toggle(table: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(table) ? n.delete(table) : n.add(table); return n })
  }

  async function exportExcel() {
    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()
    const SKIP = new Set(['id', 'project_id', 'parent_id', 'is_archived', 'revision_count', 'created_at', 'updated_at'])
    for (const sec of SECTIONS) {
      const rows = results[sec.table]?.rows ?? []
      if (!rows.length) continue
      const clean = rows.map(row => {
        const r: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(row)) { if (!SKIP.has(k)) r[k] = v }
        return r
      })
      const ws = XLSX.utils.json_to_sheet(clean)
      ws['!cols'] = Array(20).fill({ wch: 20 })
      XLSX.utils.book_append_sheet(wb, ws, sec.label.slice(0, 31))
    }
    XLSX.writeFile(wb, `تقرير_${from}_${to}.xlsx`)
  }

  const totalNew = Object.values(results).reduce((s, r) => s + r.count, 0)
  const activeSections = SECTIONS.filter(s => (results[s.table]?.count ?? 0) > 0)

  return (
    <>
      <Topbar
        title="التقرير الدوري"
        sub={ran ? `${from}  ←  ${to} · ${totalNew} سجل` : 'أسبوعي · شهري · نطاق حر'}
        actions={ran && !loading ? (
          <button className="btn btn-ghost btn-sm" onClick={exportExcel}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير Excel
          </button>
        ) : undefined}
      />

      <div className="page-content anim">

        {/* ── Date Picker Bar ── */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '14px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          {/* Quick shortcuts */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => shortcut(weekRange())}>هذا الأسبوع</button>
            <button className="btn btn-ghost btn-sm" onClick={() => shortcut(monthRange())}>هذا الشهر</button>
            <button className="btn btn-ghost btn-sm" onClick={() => shortcut(lastMonthRange())}>الشهر الماضي</button>
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border)' }}/>

          {/* Date inputs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>من</label>
            <input type="date" className="form-input" style={{ width: 148, height: 32 }}
              value={from} onChange={e => setFrom(e.target.value)}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>إلى</label>
            <input type="date" className="form-input" style={{ width: 148, height: 32 }}
              value={to} onChange={e => setTo(e.target.value)}/>
          </div>

          <button className="btn btn-primary btn-sm" style={{ height: 32, paddingInline: 18 }}
            onClick={() => run(from, to)} disabled={loading || !from || !to}>
            {loading
              ? <><span className="spinner" style={{ width: 12, height: 12 }}/> جارٍ التحميل...</>
              : 'عرض التقرير'}
          </button>
        </div>

        {/* ── Empty prompt ── */}
        {!ran && (
          <div className="empty-state" style={{ paddingBlock: 80 }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
              <line x1="8"  y1="14" x2="16" y2="14"/>
              <line x1="8"  y1="18" x2="12" y2="18"/>
            </svg>
            <div className="empty-title">اختر فترة زمنية واضغط "عرض التقرير"</div>
            <div className="empty-sub">يجمع التقرير البيانات من {SECTIONS.length} قسم في المشروع</div>
          </div>
        )}

        {/* ── Loading overlay ── */}
        {loading && (
          <div className="loading-overlay" style={{ minHeight: 200 }}>
            <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }}/>
            <span style={{ fontSize: 13 }}>جارٍ جمع البيانات من {SECTIONS.length} قسم...</span>
          </div>
        )}

        {/* ── Results ── */}
        {ran && !loading && (
          <>
            {/* Summary cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 10, marginBottom: 24,
            }}>
              {SECTIONS.map(sec => {
                const count = results[sec.table]?.count ?? 0
                return (
                  <div key={sec.table} className="stat-card"
                    style={{ cursor: count > 0 ? 'pointer' : 'default', opacity: count === 0 ? 0.45 : 1 }}
                    onClick={() => {
                      if (!count) return
                      toggle(sec.table)
                      setTimeout(() => document.getElementById(`sec-${sec.table}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: sec.dot, flexShrink: 0 }}/>
                      <span style={{ fontSize: 9.5, color: 'var(--text3)', lineHeight: 1.35 }}>{sec.label}</span>
                    </div>
                    <div className="stat-num" style={{ color: count > 0 ? sec.dot : 'var(--text3)', fontSize: 26 }}>
                      {count}
                    </div>
                    <div className="stat-bar">
                      <div className="stat-fill" style={{ width: count > 0 ? '100%' : '4px', background: sec.dot, minWidth: 0 }}/>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Nothing found */}
            {totalNew === 0 && (
              <div className="empty-state">
                <div className="empty-title">لا توجد سجلات في هذه الفترة</div>
                <div className="empty-sub">جرّب توسيع نطاق التاريخ أو اختر فترة مختلفة</div>
              </div>
            )}

            {/* Accordion sections */}
            {activeSections.map(sec => {
              const secData = results[sec.table]
              const isOpen  = expanded.has(sec.table)
              return (
                <div key={sec.table} id={`sec-${sec.table}`}
                  style={{ marginBottom: 10, border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>

                  {/* Header */}
                  <button onClick={() => toggle(sec.table)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px', background: 'var(--bg2)',
                    border: 'none', borderBottom: isOpen ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit',
                  }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: sec.dot, flexShrink: 0 }}/>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{sec.label}</span>
                    <span style={{
                      background: `${sec.dot}20`, color: sec.dot,
                      border: `1px solid ${sec.dot}50`,
                      borderRadius: 20, padding: '2px 12px',
                      fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)',
                    }}>
                      {secData.count} سجل
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ color: 'var(--text3)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {/* Table */}
                  {isOpen && (
                    <div className="table-scroll" style={{ maxHeight: 380, overflow: 'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            <th style={{ width: 44 }}>#</th>
                            {sec.keyCols.map(c => <th key={c.key}>{c.label}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {secData.rows.map((row, i) => (
                            <tr key={i}>
                              <td className="cell-mono cell-dim">{String(row.no ?? i + 1)}</td>
                              {sec.keyCols.map(col => {
                                const raw = row[col.key]
                                const val = raw != null ? String(raw) : '—'
                                switch (col.type) {
                                  case 'code':
                                    return <td key={col.key}><span className="cell-mono cell-blue">{val}</span></td>
                                  case 'desc':
                                    return <td key={col.key}><span className="cell-desc" title={val}>{val}</span></td>
                                  case 'date':
                                    return <td key={col.key}><span className="cell-mono cell-muted">{val}</span></td>
                                  case 'status': {
                                    if (val === '—') return <td key={col.key}><span style={{ color: 'var(--text3)' }}>—</span></td>
                                    const s = stBadge(val)
                                    return (
                                      <td key={col.key} style={{ padding: '6px 14px' }}>
                                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', background: s.bg, color: s.color }}>
                                          {val}
                                        </span>
                                      </td>
                                    )
                                  }
                                  default:
                                    return <td key={col.key}><span style={{ fontSize: 12 }}>{val}</span></td>
                                }
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </>
  )
}

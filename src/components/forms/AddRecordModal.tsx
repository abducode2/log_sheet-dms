
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface FieldDef {
  key: string
  label: string
  type: 'text' | 'date' | 'number' | 'select' | 'textarea'
  options?: string[]
  required?: boolean
  prefixStatic?: string
  prefixDynamic?: { fromField: string; map: Record<string, string> }
}

interface Props {
  table: string
  title: string
  fields: FieldDef[]
  onClose: () => void
  onSaved: () => void
  autoNumber?: { field: string; getNext: () => Promise<number> }
  fixedValues?: Record<string, string>
}

export default function AddRecordModal({ table, title, fields, onClose, onSaved, autoNumber, fixedValues }: Props) {
  const supabase = createClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init: Record<string, string> = {}
    if (fixedValues) Object.assign(init, fixedValues)
    setValues(prev => ({ ...prev, ...init }))
  }, [])

  useEffect(() => {
    if (!autoNumber) return
    autoNumber.getNext().then(n => {
      setValues(prev => ({ ...prev, [autoNumber.field]: String(n) }))
    })
  }, [autoNumber])

  function getPrefix(f: FieldDef): string {
    if (f.prefixStatic) return f.prefixStatic
    if (f.prefixDynamic) {
      const sourceVal = values[f.prefixDynamic.fromField] ?? ''
      return f.prefixDynamic.map[sourceVal] ?? ''
    }
    return ''
  }

  function fieldHasPrefix(f: FieldDef): boolean {
    return !!(f.prefixStatic || f.prefixDynamic)
  }

  function set(key: string, val: string) {
    setValues(prev => {
      const next = { ...prev, [key]: val }
      const sub = key === 'submission_date' ? val : next['submission_date']
      const app = key === 'approval_date'   ? val : next['approval_date']
      const prd = key === 'pour_date'       ? val : next['pour_date']
      const appDate = app || next['approval_date']
      const subDate = sub || prd
      if (subDate && appDate) {
        const diff = new Date(appDate).getTime() - new Date(subDate).getTime()
        if (diff >= 0) next['v_time'] = String(Math.round(diff / 86400000))
        else next['v_time'] = ''
      }
      return next
    })
  }

  function isFixed(key: string) {
    return !!(fixedValues && key in fixedValues)
  }

  async function handleSave() {
    setLoading(true); setError('')
    const record: Record<string, unknown> = {}

    if (fixedValues) {
      for (const [k, v] of Object.entries(fixedValues)) {
        record[k] = v
      }
    }

    for (const f of fields) {
      if (isFixed(f.key)) continue

      if (fieldHasPrefix(f)) {
        const prefix = getPrefix(f)
        const suffix = values[f.key] ?? ''

        if (f.required) {
          if (!prefix && f.prefixDynamic) {
            const depLabel = fields.find(x => x.key === f.prefixDynamic!.fromField)?.label ?? 'العنصر'
            setError(`اختر "${depLabel}" أولاً`)
            setLoading(false); return
          }
          if (!suffix) {
            setError(`حقل "${f.label}" مطلوب`)
            setLoading(false); return
          }
        }

        const full = prefix + suffix
        if (full) record[f.key] = full
        continue
      }

      const v = values[f.key] ?? ''
      if (!v && f.required) { setError(`حقل "${f.label}" مطلوب`); setLoading(false); return }
      if (v === '') continue
      if (f.type === 'number') record[f.key] = Number(v)
      else record[f.key] = v
    }

    if (autoNumber && values[autoNumber.field]) {
      record[autoNumber.field] = Number(values[autoNumber.field])
    }

    const { error } = await supabase.from(table).insert(record)
    if (error) { setError(error.message); setLoading(false) }
    else { onSaved(); onClose() }
  }

  return (
    <div className="modal-overlay" 
    onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div 
        style={{ display:'grid', 
        gridTemplateColumns:'1fr 1fr', 
        gap:'0 16px' }}>
          {fields.map(f => {
            const fixed = isFixed(f.key)
            const withPrefix = fieldHasPrefix(f)
            const prefix = withPrefix ? getPrefix(f) : ''

            return (
              <div
                key={f.key}
                className="form-group"
                style={f.type === 'textarea' ? { gridColumn:'1/-1' } : {}}
              >
                <label className="form-label">
                  {f.label}
                  {f.required && <span style={{ color:'var(--red)' }}> *</span>}
                  {autoNumber?.field === f.key && (
                    <span style={{ 
                      color:'var(--green)', 
                      fontSize:10, 
                      marginRight:6 }}>● تلقائي</span>
                  )}
                  {f.key === 'v_time' && (
                    <span style={{ 
                      color:'var(--blue)', 
                      fontSize:10, 
                      marginRight:6 }}>● يُحسب تلقائياً</span>
                  )}
                  {fixed && (
                    <span style={{ 
                      color:'var(--amber)', 
                      fontSize:10, 
                      marginRight:6 }}>● ثابت</span>
                  )}
                </label>

                {f.type === 'select' ? (
                  <select
                    className="form-select"
                    value={fixed ? (fixedValues![f.key]) : (values[f.key] ?? '')}
                    onChange={e => !fixed && set(f.key, e.target.value)}
                    disabled={fixed}
                    style={fixed ? { opacity:.6, cursor:'default' } : {}}
                  >
                    <option value="">-- اختر --</option>
                    {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    className="form-input"
                    rows={3}
                    value={values[f.key] ?? ''}
                    onChange={e => set(f.key, e.target.value)}
                    style={{ resize:'vertical' }}
                  />
                ) : withPrefix ? (
                  <div style={{ display:'flex',
                    // backgroundColor:"red", 
                  alignItems:'stretch'
                   }}>
                    {/* <span style={{
                      display:'flex', alignItems:'center',
                      background:'var(--bg3)',
                      border:'1px solid var(--border)', 
                      borderRight:'none',
                      borderRadius:'0 var(--radius)  var(--radius) 0',
                      padding:'0 10px', fontSize:11, 
                      fontFamily:'var(--mono)',
                      color: prefix ? 'var(--blue)' : 'var(--text3)',
                      whiteSpace:'nowrap', 
                      userSelect:'none',
                    }}>
                      {prefix || (f.prefixDynamic ? '— اختر العنصر أولاً —' : '')}
                    </span> */}
                    <input
                      className="form-input"
                      type="text"
                      style={{ 
                         borderRadius:'0 var(--radius)  var(--radius) 0',
                        flex:1, minWidth:0 }}
                      placeholder="001"
                      value={values[f.key] ?? ''}
                      onChange={e => set(f.key, e.target.value)}
                    />
                     <span style={{
                      display:'flex', 
                      direction:"ltr",
                      alignItems:'center',
                      background:'var(--bg3)',
                      border:'1px solid var(--border)', 
                      borderRight:'none',
                      borderRadius:'var(--radius) 0 0 var(--radius)', 
                     
                      padding:'0 10px', 
                      fontSize:11, 
                      fontFamily:'var(--mono)',
                      color: prefix ? 'var(--blue)' : 'var(--text3)',
                      whiteSpace:'nowrap', 
                      userSelect:'none',
                    }}>
                      {prefix || (f.prefixDynamic ? '— اختر العنصر أولاً —' : '')}
                    </span>
                  </div>
                ) : (
                  <input
                    className="form-input"
                    type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                    value={fixed ? fixedValues![f.key] : (values[f.key] ?? '')}
                    onChange={e => !fixed && set(f.key, e.target.value)}
                    readOnly={autoNumber?.field === f.key || f.key === 'v_time' || fixed}
                    style={(autoNumber?.field === f.key || f.key === 'v_time' || fixed)
                      ? { opacity:.6, cursor:'default' } : {}}
                  />
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <div style={{
            fontSize:12, color:'var(--red)',
            background:'#da363318', border:'1px solid #da363344',
            borderRadius:'0', 
            padding:'8px 12px', marginBottom:12
          }}>
            {error}
          </div>
        )}

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
          <button className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <span className="spinner"/> : 'حفظ السجل'}
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRole } from '@/lib/hooks/useRole'
import Topbar from '@/components/layout/Topbar'
import { redirect } from 'next/navigation'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

const ROLE_LABELS: Record<string, string> = {
  admin:  'مدير النظام',
  editor: 'محرر',
  viewer: 'مشاهد',
}
const ROLE_BG: Record<string, { bg: string; color: string }> = {
  admin:  { bg:'#1f6feb',   color:'#fff' },
  editor: { bg:'#1a7f37',   color:'#fff' },
  viewer: { bg:'#444',      color:'#ccc' },
}

export default function UsersPage() {
  const supabase = createClient()
  const { role, loading: roleLoading, isAdmin } = useRole()

  const [users, setUsers]       = useState<Profile[]>([])
  const [loading, setLoading]   = useState(true)
  const [editId, setEditId]     = useState<string|null>(null)
  const [editRole, setEditRole] = useState('')
  const [editName, setEditName] = useState('')
  const [saving, setSaving]     = useState(false)
  const [showAdd, setShowAdd]   = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPass,  setNewPass]  = useState('')
  const [newName,  setNewName]  = useState('')
  const [newRole,  setNewRole]  = useState('viewer')
  const [addErr,   setAddErr]   = useState('')
  const [adding,   setAdding]   = useState(false)
  const [confirmDel, setConfirmDel] = useState<Profile|null>(null)
  const [deleting,   setDeleting]   = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    setUsers((data ?? []) as Profile[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  if (!roleLoading && !isAdmin) {
    return (
      <div className="page-content" style={{ textAlign:'center', paddingTop:80 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <div style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>غير مصرح</div>
        <div style={{ color:'var(--text2)' }}>هذه الصفحة مخصصة لمدير النظام فقط</div>
      </div>
    )
  }

  async function saveEdit(id: string) {
    setSaving(true)
    await supabase.from('profiles').update({ role: editRole, full_name: editName }).eq('id', id)
    setEditId(null); setSaving(false); fetchUsers()
  }

  async function addUser() {
    if (!newEmail || !newPass) { setAddErr('البريد وكلمة المرور مطلوبان'); return }
    if (newPass.length < 6)   { setAddErr('كلمة المرور 6 أحرف على الأقل'); return }
    setAdding(true); setAddErr('')
    
    // Create user via Supabase Auth (needs service role — use signup for now)
    const { data, error } = await supabase.auth.signUp({
      email: newEmail,
      password: newPass,
      options: { data: { full_name: newName } }
    })
    if (error) { setAddErr(error.message); setAdding(false); return }
    
    // Set role in profiles
    if (data.user) {
      await supabase.from('profiles')
        .upsert({ id: data.user.id, email: newEmail, full_name: newName, role: newRole })
    }
    setShowAdd(false); setAdding(false)
    setNewEmail(''); setNewPass(''); setNewName(''); setNewRole('viewer')
    setTimeout(() => fetchUsers(), 1000)
  }

  async function deleteUser(user: Profile) {
    setDeleting(true)
    await supabase.from('profiles').delete().eq('id', user.id)
    setConfirmDel(null); setDeleting(false); fetchUsers()
  }

  return (
    <>
      <Topbar
        title="إدارة المستخدمين"
        sub={`${users.length} مستخدم`}
        actions={
          isAdmin ? (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              إضافة مستخدم
            </button>
          ) : null
        }
      />
      <div className="page-content">

        {/* Legend */}
        <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          {Object.entries(ROLE_LABELS).map(([r, label]) => (
            <div key={r} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
              <span style={{
                background: ROLE_BG[r].bg, color: ROLE_BG[r].color,
                padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600
              }}>{label}</span>
              <span style={{ color:'var(--text2)' }}>
                {r==='admin'  ? '— يرى ويضيف ويعدل ويحذف' :
                 r==='editor' ? '— يرى ويضيف ويعدل فقط' :
                               '— يرى فقط'}
              </span>
            </div>
          ))}
        </div>

        <div className="table-wrap">
          <div className="table-header">
            <span className="table-title">قائمة المستخدمين</span>
            <span className="table-meta">{users.length} مستخدم</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th style={{width:130}}>الصلاحية</th>
                <th>تاريخ الإنشاء</th>
                <th style={{width:130}}>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6}>
                  <div className="loading-overlay"><div className="spinner"/></div>
                </td></tr>
              ) : users.map((u, i) => {
                const isEditing = editId === u.id
                const rb = ROLE_BG[u.role] ?? ROLE_BG.viewer
                return (
                  <tr key={u.id}>
                    <td className="cell-mono cell-dim">{i+1}</td>
                    <td>
                      {isEditing
                        ? <input className="form-input" style={{padding:'4px 8px',fontSize:12}}
                            value={editName} onChange={e=>setEditName(e.target.value)} autoFocus/>
                        : <span style={{fontWeight:500}}>{u.full_name || '—'}</span>
                      }
                    </td>
                    <td className="cell-mono" style={{fontSize:12,color:'var(--blue)'}}>{u.email}</td>
                    <td>
                      {isEditing ? (
                        <select className="form-select" style={{padding:'4px 8px',fontSize:11}}
                          value={editRole} onChange={e=>setEditRole(e.target.value)}>
                          <option value="admin">مدير النظام</option>
                          <option value="editor">محرر</option>
                          <option value="viewer">مشاهد</option>
                        </select>
                      ) : (
                        <span style={{
                          display:'inline-flex', alignItems:'center',
                          padding:'3px 10px', borderRadius:20,
                          background: rb.bg, color: rb.color,
                          fontSize:11, fontWeight:600
                        }}>
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      )}
                    </td>
                    <td className="cell-mono cell-muted" style={{fontSize:11}}>
                      {u.created_at?.slice(0,10)}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{display:'flex',gap:4}}>
                          <button className="btn btn-primary btn-sm" onClick={()=>saveEdit(u.id)} disabled={saving}>
                            {saving?'...':'✓ حفظ'}
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={()=>setEditId(null)}>✕</button>
                        </div>
                      ) : (
                        isAdmin ? (
                          <div style={{display:'flex',gap:4}}>
                            <button className="btn btn-ghost btn-sm" onClick={() => {
                              setEditId(u.id); setEditRole(u.role); setEditName(u.full_name??'')
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              تعديل
                            </button>
                            <button
                              style={{
                                display:'inline-flex', alignItems:'center',
                                padding:'5px 9px', borderRadius:'var(--radius-sm)',
                                border:'1px solid var(--border)', background:'transparent',
                                color:'var(--text3)', cursor:'pointer', fontSize:11,
                              }}
                              onClick={()=>setConfirmDel(u)}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <span style={{ color:'var(--text2)', fontSize:11 }}>غير مصرح</span>
                        )
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal" style={{width:460}}>
            <div className="modal-header">
              <div className="modal-title">إضافة مستخدم جديد</div>
              <button className="btn btn-ghost btn-sm" onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label className="form-label">الاسم الكامل</label>
                <input className="form-input" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="محمد العمري"/>
              </div>
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label className="form-label">البريد الإلكتروني <span style={{color:'var(--red)'}}>*</span></label>
                <input type="email" className="form-input" value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="user@rawaf.com"/>
              </div>
              <div className="form-group">
                <label className="form-label">كلمة المرور <span style={{color:'var(--red)'}}>*</span></label>
                <input type="password" className="form-input" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="6 أحرف على الأقل"/>
              </div>
              <div className="form-group">
                <label className="form-label">الصلاحية</label>
                <select className="form-select" value={newRole} onChange={e=>setNewRole(e.target.value)}>
                  <option value="viewer">مشاهد — يرى فقط</option>
                  <option value="editor">محرر — يضيف ويعدل</option>
                  <option value="admin">مدير — كامل الصلاحيات</option>
                </select>
              </div>
            </div>
            {addErr && <div style={{fontSize:12,color:'var(--red)',background:'#da363318',border:'1px solid #da363344',borderRadius:'var(--radius-sm)',padding:'8px 12px',marginBottom:12}}>{addErr}</div>}
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
              <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>إلغاء</button>
               <button className="btn btn-primary" onClick={addUser} disabled={adding}>
                {adding?<span className="spinner"/>:'إنشاء الحساب'}
              </button> 
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <div className="modal-overlay">
          <div className="modal" style={{width:400}}>
            <div className="modal-header">
              <div className="modal-title" style={{color:'var(--red)'}}>تأكيد الحذف</div>
            </div>
            <div style={{background:'var(--bg3)',border:'1px solid #da363333',borderRadius:'var(--radius)',padding:16,marginBottom:20}}>
              <div style={{fontWeight:600,marginBottom:4}}>{confirmDel.full_name || '—'}</div>
              <div style={{fontSize:12,color:'var(--blue)'}}>{confirmDel.email}</div>
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button className="btn btn-ghost" onClick={()=>setConfirmDel(null)}>إلغاء</button>
              <button style={{background:'#da363322',color:'var(--red)',border:'1px solid #da363344',borderRadius:'var(--radius-sm)',padding:'7px 14px',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}
                onClick={()=>deleteUser(confirmDel)} disabled={deleting}>
                {deleting?<span className="spinner"/>:'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

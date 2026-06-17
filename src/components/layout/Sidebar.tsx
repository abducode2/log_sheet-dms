
'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useRole } from '@/lib/hooks/useRole'
import { useTheme, type Theme } from '@/lib/hooks/useTheme'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Nav will filter based on role
const NAV_STATIC = [
  { label: 'الرئيسية', items: [
    { href:'/dashboard', label:'لوحة التحكم',   dot:'#58a6ff', countKey: null },
    { href:'/import',    label:'استيراد Excel', dot:'#3fb950',  countKey: null },
  ]},
  { label: 'وثائق المشروع', items: [
    { href:'/shop-drawings',  label:'رسومات التنفيذ',       dot:'#58a6ff', countKey:'shop_drawings' },
    { href:'/materials',      label:'تقديمات المواد',        dot:'#3fb950', countKey:'material_submittals' },
    { href:'/supplier',       label:'تأهيل الموردين',        dot:'#d29922', countKey:'supplier_prequalifications' },
    { href:'/inspection',     label:'طلبات الفحص',          dot:'#bc8cff', countKey:'inspection_requests' },
    { href:'/cpr',            label:'طلبات الصب CPR',       dot:'#f85149', countKey:'concrete_pour_requests' },
    { href:'/rfi',            label:'طلبات الاستيضاح RFI',  dot:'#39d353', countKey:'requests_for_information' },
    { href:'/ncr',            label:'تقارير عدم المطابقة',  dot:'#ff7b72', countKey:'non_conformance_reports' },
    { href:'/pouring-log',    label:'سجل الصب',                dot:'#ffa657', countKey:'pouring_log' },
    { href:'/field-report',   label:'التقارير الميدانية',    dot:'#8b949e', countKey:'field_reports' },
    { href:'/transmittal',    label:'إرسال الوثائق',        dot:'#8b949e', countKey:'document_transmittals' },
  ]},
  { label: 'المراسلات', items: [
    { href:'/letters/rawaf-naga', label:'المقاول ← الاستشاري', dot:'#ffa657', countKey:'letters_rawaf_naga' },
    { href:'/letters/naga-rawaf', label:'الاستشاري ← المقاول', dot:'#f85149', countKey:'letters_naga_rawaf' },
  ]},
  { label: 'التقارير', items: [
    { href:'/reports', label:'التقرير الدوري', dot:'#e3b341', countKey: null },
  ]},
  { label: 'الإدارة', items: [
    { href:'/users', label:'إدارة المستخدمين', dot:'#58a6ff', countKey: null, adminOnly: true },
  ]},
]

const TABLES = [
  'shop_drawings',
  'material_submittals',
  'supplier_prequalifications',
  'inspection_requests',
  'concrete_pour_requests',
  'requests_for_information',
  'non_conformance_reports',
  'field_reports',
  'document_transmittals',
  'letters_rawaf_naga',
  'letters_naga_rawaf',
  'pouring_log',
]

const THEMES: { id: Theme; label: string; colors: [string, string, string] }[] = [
  { id: 'dark',     label: 'داكن',           colors: ['#0d1117', '#161b22', '#58a6ff'] },
  { id: 'light',    label: 'فاتح',           colors: ['#f6f8fa', '#ffffff', '#0969da'] },
  { id: 'midnight', label: 'منتصف الليل',    colors: ['#010409', '#0d1117', '#4facf7'] },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [counts, setCounts] = useState<Record<string, number>>({})
  const { isAdmin } = useRole()
  const { theme, changeTheme } = useTheme()

  useEffect(() => {
    async function fetchCounts() {
      const results = await Promise.all(
        TABLES.map(table =>
          supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            // For shop_drawings count only root drawings
            .then(({ count }) => ({ table, count: count ?? 0 }))
        )
      )
      // For shop_drawings: count only root rows (no parent_id)
      const shopRoot = await supabase
        .from('shop_drawings')
        .select('*', { count: 'exact', head: true })
        .is('parent_id', null)

      const map: Record<string, number> = {}
      for (const r of results) map[r.table] = r.count
      map['shop_drawings'] = shopRoot.count ?? 0
      setCounts(map)
    }
    fetchCounts()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">P216</div>
        <div>
          <div className="sidebar-logo-text">HARAJ-IQC-ALRAWAF</div>
          <div className="sidebar-logo-sub">شركة المقاول للمقاولات</div>
        </div>
      </div>

      <div className="sidebar-search">
        <input placeholder="بحث سريع..." />
      </div>

      {NAV_STATIC.map(section => (
        <div key={section.label} className="nav-section">
          <div className="nav-label">{section.label}</div>
          {section.items.filter(item => !(item as {adminOnly?:boolean}).adminOnly || isAdmin).map(item => (
            <button
              key={item.href}
              className={`nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}
              onClick={() => router.push(item.href)}
            >
              <span className="nav-dot" style={{ background: item.dot }} />
              {item.label}
              {item.countKey && counts[item.countKey] !== undefined && (
                <span className="nav-count">{counts[item.countKey]}</span>
              )}
            </button>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">

        {/* Theme switcher */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6, padding: '0 2px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            الثيم
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {THEMES.map(t => (
              <button
                key={t.id}
                title={t.label}
                onClick={() => changeTheme(t.id)}
                style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '6px 4px', borderRadius: 'var(--radius)',
                  border: theme === t.id ? '2px solid var(--accent)' : '2px solid var(--border)',
                  background: theme === t.id ? 'var(--accent)11' : 'transparent',
                  cursor: 'pointer', transition: 'all .15s',
                }}
              >
                {/* Mini preview */}
                <div style={{
                  width: 32, height: 22, borderRadius: 4, overflow: 'hidden',
                  display: 'grid', gridTemplateColumns: '40% 60%',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ background: t.colors[0] }}/>
                  <div style={{ background: t.colors[1], display: 'flex', alignItems: 'flex-end', padding: 2 }}>
                    <div style={{ width: '100%', height: 3, borderRadius: 2, background: t.colors[2] }}/>
                  </div>
                </div>
                <span style={{ fontSize: 9, color: theme === t.id ? 'var(--accent)' : 'var(--text3)', fontWeight: theme === t.id ? 600 : 400 }}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize:10, color:'var(--text3)', marginBottom:8, padding:'0 2px' }}>
          {userEmail}
        </div>
        <button className="nav-item" onClick={logout} style={{ color:'var(--red)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}

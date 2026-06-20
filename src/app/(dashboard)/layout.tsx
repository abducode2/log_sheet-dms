import Sidebar from '@/components/layout/Sidebar'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="layout">
        <Sidebar />
        <div className="main-content">{children}</div>
      </div>
    </LanguageProvider>
  )
}

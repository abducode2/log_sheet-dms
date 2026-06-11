import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'P-216 | HARAJ-IQC-ALRAWAF',
  description: 'نظام إدارة وثائق مشروع HARAJ-IQC-ALRAWAF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}

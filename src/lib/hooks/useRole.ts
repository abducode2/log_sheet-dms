'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'admin' | 'editor' | 'viewer'

export function useRole() {
  const [role, setRole] = useState<UserRole>('viewer')
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()

    async function fetchRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }

        const email = user.email ?? ''
        setUserEmail(email)

        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        const roleValue = data?.role ? (data.role as UserRole) : 'viewer'
        setRole(roleValue)

        // If profile is missing, create it as a viewer by default
        if (!data?.role) {
          await supabase.from('profiles').upsert({
            id:        user.id,
            email,
            full_name: user.user_metadata?.full_name ?? email.split('@')[0],
            role:      'viewer',
          })
          setRole('viewer')
        }
      } catch (e) {
        console.warn('useRole error:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [])

  return {
    role,
    userEmail,
    loading,
    isAdmin:  role === 'admin',
    isEditor: role === 'admin' || role === 'editor',
    isViewer: role === 'viewer',
  }
}

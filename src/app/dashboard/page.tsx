import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Dashboard from '@/components/dashboard/Dashboard'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function DashboardPage() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute top-4 right-4">
        <LogoutButton />
      </div>
      <Dashboard user={user} />
    </div>
  )
}

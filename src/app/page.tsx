import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LoginButton from '@/components/auth/LoginButton'

export default async function HomePage() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          Leevi Wrapped
        </h1>
        <p className="text-xl text-white/70 mb-8 max-w-md mx-auto">
          Discover your personal Leevi journey. See your reviews, ratings, and musical insights in a beautiful, shareable format.
        </p>
        <LoginButton />
      </div>
    </div>
  )
}
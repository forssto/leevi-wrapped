'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import Dashboard from '@/components/dashboard/Dashboard'
import InvalidUserScreen from '@/components/InvalidUserScreen'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Dashboard: Checking user authentication...')
        const { data: { user }, error } = await supabase.auth.getUser()
        console.log('Dashboard: User check result:', { user, error })
        
        if (error) {
          console.error('Dashboard: Auth error:', error)
          router.push('/')
          return
        }
        
        if (!user) {
          console.log('Dashboard: No user found, redirecting to home...')
          router.push('/')
          return
        }
        
        console.log('Dashboard: User found, checking if valid participant...')
        setUser(user)
        
        // Check if user is a valid participant
        const { data: participant, error: participantError } = await supabase
          .from('participants')
          .select('email')
          .eq('email', user.email)
          .eq('done', true)
          .single()
        
        if (participantError || !participant) {
          console.log('Dashboard: User not found in participants table or not done')
          setIsValidUser(false)
        } else {
          console.log('Dashboard: Valid participant found')
          setIsValidUser(true)
        }
      } catch (error) {
        console.error('Dashboard: Error checking user:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Dashboard: Auth state change:', event, session)
      if (!session?.user) {
        console.log('Dashboard: User logged out, redirecting to home...')
        router.push('/')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading your Leevi Wrapped...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Redirecting...</div>
      </div>
    )
  }

  // Show invalid user screen if user is not a valid participant
  if (isValidUser === false) {
    return <InvalidUserScreen userEmail={user.email || ''} />
  }

  // Show dashboard for valid users
  if (isValidUser === true) {
    return <Dashboard user={user} />
  }

  // Still loading validation
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-white text-xl">Validating access...</div>
    </div>
  )
}

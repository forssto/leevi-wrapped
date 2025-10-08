'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import LoginButton from '@/components/auth/LoginButton'
import Image from 'next/image'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Checking user authentication...')
        const { data: { user }, error } = await supabase.auth.getUser()
        console.log('User check result:', { user, error })
        
        if (user) {
          console.log('User found, redirecting to dashboard...')
          router.push('/dashboard')
        } else {
          console.log('No user found')
        }
      } catch (error) {
        console.error('Error checking user:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session)
      if (session?.user) {
        console.log('Auth change: User found, redirecting to dashboard...')
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        {/* Typewriter Image */}
        <div className="mb-8">
          <Image 
            src="/kuvia/kirjoituskone.gif"
            alt="Typewriter"
            width={200}
            height={150}
            className="mx-auto"
          />
        </div>
        
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
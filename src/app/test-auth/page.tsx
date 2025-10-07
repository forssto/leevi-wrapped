'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function TestAuthPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authState, setAuthState] = useState<string>('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth...')
        const { data: { user }, error } = await supabase.auth.getUser()
        console.log('Auth result:', { user, error })
        
        if (error) {
          setAuthState(`Error: ${error.message}`)
        } else if (user) {
          setAuthState('Logged in')
          setUser(user)
        } else {
          setAuthState('Not logged in')
        }
      } catch (err) {
        console.error('Auth check error:', err)
        setAuthState(`Exception: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session)
      setAuthState(`Event: ${event}, User: ${session?.user ? 'Yes' : 'No'}`)
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google login...')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) {
        console.error('OAuth error:', error)
        setAuthState(`OAuth Error: ${error.message}`)
      } else {
        console.log('OAuth initiated successfully')
        setAuthState('OAuth initiated, waiting for redirect...')
      }
    } catch (err) {
      console.error('Login error:', err)
      setAuthState(`Login Error: ${err}`)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      
      <div className="space-y-4">
        <div>
          <strong>Auth State:</strong> {authState}
        </div>
        
        <div>
          <strong>User:</strong>
          <pre className="bg-gray-100 p-2 mt-1 text-xs">
            {user ? JSON.stringify(user, null, 2) : 'Not logged in'}
          </pre>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Google Login
        </button>
      </div>
    </div>
  )
}

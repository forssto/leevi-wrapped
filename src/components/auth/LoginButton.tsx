'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginButton() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          skipBrowserRedirect: true
        }
      })
      if (error) throw error
      
      // The popup will handle the OAuth flow and close automatically
      // The auth state change will be detected by the app
    } catch (error) {
      console.error('Error logging in:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
    >
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  )
}

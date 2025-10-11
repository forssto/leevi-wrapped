'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-white/60 hover:text-white text-sm underline transition-colors disabled:opacity-50"
    >
      {loading ? 'Kirjaudutaan ulos...' : 'Kirjaudu ulos'}
    </button>
  )
}

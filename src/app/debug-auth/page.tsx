'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function DebugAuthPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Array<{participant_email: string, song_order: number, rating: number}>>([])
  const [participants, setParticipants] = useState<Array<{email: string, done: boolean}>>([])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        console.log('Current user:', user)
        setUser(user)

        if (user?.email) {
          // Check if this user has reviews
          const { data: userReviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('*')
            .eq('participant_email', user.email)
          
          console.log('User reviews:', userReviews, reviewsError)
          setReviews(userReviews || [])

          // Check if this user is in participants table
          const { data: participant, error: participantError } = await supabase
            .from('participants')
            .select('*')
            .eq('email', user.email)
            .single()
          
          console.log('Participant data:', participant, participantError)
          setParticipants(participant ? [participant] : [])
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Current User:</h2>
          {user ? (
            <div>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.user_metadata?.full_name || 'Not provided'}</p>
            </div>
          ) : (
            <p>No user logged in</p>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Reviews for this user:</h2>
          {reviews.length > 0 ? (
            <div>
              <p>Found {reviews.length} reviews</p>
              <p>First few ratings: {reviews.slice(0, 5).map(r => r.rating).join(', ')}</p>
            </div>
          ) : (
            <p>No reviews found for this email</p>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Participant data:</h2>
          {participants.length > 0 ? (
            <div>
              <p>Found participant data</p>
              <p>Done: {participants[0].done ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <p>No participant data found for this email</p>
          )}
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="font-semibold">Available emails with reviews:</h2>
          <ul className="list-disc list-inside">
            <li>aarolaakkonen22@gmail.com</li>
            <li>anniinahavukainen@gmail.com</li>
            <li>antti.olavi.piirainen@gmail.com</li>
            <li>antti.saloniemi@gmail.com</li>
            <li>anttilei@gmail.com</li>
          </ul>
          <p className="mt-2 text-sm">
            If your email is not in this list, you won&apos;t see any data in the cards.
          </p>
        </div>
      </div>
    </div>
  )
}

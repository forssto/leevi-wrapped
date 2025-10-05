'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UserStats } from '@/types/database'
import { User } from '@supabase/supabase-js'
import StatsCard from './StatsCard'
import SongCard from './SongCard'
import { motion } from 'framer-motion'

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    fetchUserStats()
  }, [user])

  const fetchUserStats = async () => {
    try {
      setLoading(true)
      
      // Fetch user's reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          rating,
          song_order,
          songs (
            song_order,
            track_name,
            album,
            year,
            main_lines,
            tags_adjective
          )
        `)
        .eq('participant_email', user.email)

      if (reviewsError) throw reviewsError

      // Calculate stats
      const totalReviews = reviews.length
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      
      // Sort songs by rating
      const sortedSongs = reviews
        .sort((a, b) => b.rating - a.rating)
        .map(review => review.songs)
        .filter(Boolean)

      const topSongs = sortedSongs.slice(0, 5)
      const bottomSongs = sortedSongs.slice(-5).reverse()

      // Calculate rating distribution
      const ratingDistribution = reviews.reduce((acc, review) => {
        const range = Math.floor(review.rating)
        acc[range] = (acc[range] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      setUserStats({
        totalReviews,
        averageRating,
        topSongs,
        bottomSongs,
        favoriteDecade: '1990s', // This would need to be calculated from actual data
        ratingDistribution,
        participationLevel: totalReviews > 100 ? 'High' : totalReviews > 50 ? 'Medium' : 'Low'
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const slides = [
    {
      title: "Your Leevi Journey",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Total Reviews"
            value={userStats?.totalReviews || 0}
            subtitle="Songs rated"
            icon="🎵"
            color="blue"
          />
          <StatsCard
            title="Average Rating"
            value={userStats?.averageRating?.toFixed(2) || '0.00'}
            subtitle="Out of 10"
            icon="⭐"
            color="green"
          />
        </div>
      )
    },
    {
      title: "Your Top Songs",
      content: (
        <div className="space-y-4">
          {userStats?.topSongs.slice(0, 3).map((song, index) => (
            <SongCard
              key={song.song_order}
              song={song}
              rank={index + 1}
              isTop={index === 0}
            />
          ))}
        </div>
      )
    },
    {
      title: "Your Rating Style",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="Participation Level"
            value={userStats?.participationLevel || 'Low'}
            subtitle="How active you were"
            icon="🔥"
            color="orange"
          />
          <StatsCard
            title="Favorite Decade"
            value={userStats?.favoriteDecade || '1990s'}
            subtitle="Based on your ratings"
            icon="📅"
            color="purple"
          />
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your Leevi Wrapped...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Your Leevi Wrapped</h1>
          <p className="text-white/70">Welcome back, {user.name}!</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {slides[currentSlide].title}
            </h2>
            {slides[currentSlide].content}
          </motion.div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

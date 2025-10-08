'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatFinnishNumber, formatRating } from '@/lib/gradeUtils'
import CardWrapper from './CardWrapper'

interface SongExample {
  track_name: string
  album: string
  year: number
  lastfm_pos: number
  user_rating: number
}

interface PopularityReversalData {
  personality: string
  personality_description: string
  personality_emoji: string
  personality_color: string
  correlation: number
  correlation_strength: string
  songs_with_lastfm: number
  is_mainstream: boolean
  is_underground: boolean
  popular_examples: SongExample[]
  unpopular_examples: SongExample[]
}

interface PopularityReversalCardProps {
  userEmail: string
}

export default function PopularityReversalCard({ userEmail }: PopularityReversalCardProps) {
  const [data, setData] = useState<PopularityReversalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/cards/popularity-reversal?email=${encodeURIComponent(userEmail)}`)
        if (response.ok) {
          const result = await response.json()
          console.log('Popularity Reversal API response:', result)
          setData(result)
        } else {
          console.error('Popularity Reversal API response not ok:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching popularity reversal data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userEmail])

  if (loading || !data) {
    return (
      <CardWrapper 
        isLoading={loading} 
        error={!data ? 'No data available for Popularity Reversal.' : undefined}
      />
    )
  }

  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.3) return 'text-blue-400'
    if (correlation > 0.1) return 'text-blue-300'
    if (correlation > -0.1) return 'text-gray-400'
    if (correlation > -0.3) return 'text-purple-300'
    return 'text-purple-400'
  }

  const getCorrelationEmoji = (correlation: number) => {
    if (correlation > 0.3) return '📻'
    if (correlation > 0.1) return '🎵'
    if (correlation > -0.1) return '⚖️'
    if (correlation > -0.3) return '🎧'
    return '🔍'
  }

  return (
    <CardWrapper>
        {/* Title */}
        <motion.h1 
          className="text-6xl font-bold text-white mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Popularity Reversal {data.personality_emoji}
        </motion.h1>

        {/* Main Personality */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className={`text-5xl font-bold mb-4 ${data.personality_color}`}>
            {data.personality}
          </div>
          <div className="text-xl text-white/80 mb-6">
            {data.personality_description}
          </div>
        </motion.div>

        {/* Correlation Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Correlation Value */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className={`text-4xl font-bold mb-2 ${getCorrelationColor(data.correlation)}`}>
              {formatFinnishNumber(data.correlation, 2)}
            </div>
            <div className="text-white/80 text-sm mb-1">
              Popularity Correlation
            </div>
            <div className="text-white/60 text-xs">
              {data.correlation_strength}
            </div>
          </div>

          {/* Songs Analyzed */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">
              {data.songs_with_lastfm}
            </div>
            <div className="text-white/80 text-sm">
              Songs with Popularity Data
            </div>
          </div>

          {/* Trend Indicator */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">
              {getCorrelationEmoji(data.correlation)}
            </div>
            <div className="text-white/80 text-sm">
              {data.is_mainstream ? 'Mainstream' : data.is_underground ? 'Underground' : 'Balanced'}
            </div>
          </div>
        </motion.div>

        {/* Song Examples */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Popular Songs */}
          {data.popular_examples.length > 0 && (
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-blue-400 mb-6">📻 Popular Songs You Rated</h3>
              <div className="space-y-4">
                {data.popular_examples.map((song, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-semibold">{song.track_name}</div>
                      <div className="text-white/60 text-sm">{song.album} ({song.year})</div>
                      <div className="text-white/50 text-xs">Last.fm Position: #{song.lastfm_pos}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-300">
                        {formatRating(song.user_rating, true)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Unpopular Songs */}
          {data.unpopular_examples.length > 0 && (
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <h3 className="text-2xl font-bold text-purple-400 mb-6">🔍 Obscure Songs You Rated</h3>
              <div className="space-y-4">
                {data.unpopular_examples.map((song, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-semibold">{song.track_name}</div>
                      <div className="text-white/60 text-sm">{song.album} ({song.year})</div>
                      <div className="text-white/50 text-xs">Last.fm Position: #{song.lastfm_pos}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-300">
                        {formatRating(song.user_rating, true)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Interpretation */}
        <motion.div
          className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">What This Means</h3>
          <p className="text-white/80 text-center">
            {data.correlation > 0.1 ? (
              <>You tend to enjoy songs that are more popular on Last.fm. This suggests you have mainstream tastes and appreciate what resonates with a broader audience.</>
            ) : data.correlation < -0.1 ? (
              <>You prefer less popular, more obscure songs. This suggests you&apos;re an independent music explorer who finds gems that others might miss.</>
            ) : (
              <>Your taste doesn&apos;t correlate strongly with popularity. You appreciate both mainstream hits and hidden gems equally.</>
            )}
          </p>
        </motion.div>
    </CardWrapper>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatRating, formatFinnishNumber } from '@/lib/gradeUtils'
import CardWrapper from './CardWrapper'

interface HotTake {
  song_order: number
  track_name: string
  user_rating: number
  twin_rating: number
  crowd_avg: number
  delta_from_avg: number
}

interface TasteTwinData {
  twin_name: string
  twin_email: string
  pearson_r: number
  overlap_count: number
  aligned_hot_takes: HotTake[]
}

interface TasteTwinCardProps {
  userEmail: string
}

export default function TasteTwinCard({ userEmail }: TasteTwinCardProps) {
  const [data, setData] = useState<TasteTwinData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/cards/taste-twin?email=${encodeURIComponent(userEmail)}`)
        if (response.ok) {
          const result = await response.json()
          console.log('Taste Twin API response:', result)
          setData(result)
        } else {
          const errorData = await response.json()
          console.error('Taste Twin API error:', response.status, errorData)
          setError(errorData.error || 'Failed to fetch taste twin data')
        }
      } catch (error) {
        console.error('Error fetching taste twin data:', error)
        setError('Network error while fetching taste twin data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userEmail])

  if (loading || error || !data) {
    return (
      <CardWrapper 
        isLoading={loading} 
        error={error || (!data ? 'No taste twin found' : undefined)}
      />
    )
  }

  const getCorrelationStrength = (r: number) => {
    const absR = Math.abs(r)
    if (absR >= 0.8) return { text: 'Very Strong', color: 'text-green-400' }
    if (absR >= 0.6) return { text: 'Strong', color: 'text-green-300' }
    if (absR >= 0.4) return { text: 'Moderate', color: 'text-yellow-400' }
    if (absR >= 0.2) return { text: 'Weak', color: 'text-orange-400' }
    return { text: 'Very Weak', color: 'text-red-400' }
  }

  const correlationInfo = getCorrelationStrength(data.pearson_r)

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-8">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url('/backgrounds/tausta_${Math.floor(Math.random() * 16) + 1}.jpg')`
        }}
      />
      
      <div className="relative z-10 text-center max-w-6xl w-full">
        {/* Title */}
        <motion.h1 
          className="text-5xl font-bold text-white mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Taste Twin Found! 🎯
        </motion.h1>

        {/* Main Twin Info */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-4xl font-bold text-white mb-4">
            {data.twin_name}
          </div>
          <div className="text-xl text-white/80 mb-6">
            Your musical soulmate
          </div>
          
          <div className="text-6xl font-bold text-blue-400 mb-4">
            r = {data.pearson_r.toFixed(3)}
          </div>
          
          <div className={`text-2xl font-semibold mb-4 ${correlationInfo.color}`}>
            {correlationInfo.text} Correlation
          </div>
          
          <div className="text-lg text-white/70 mb-4">
            Based on {data.overlap_count} shared song ratings
          </div>
          
          {/* Correlation Definition */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 max-w-2xl mx-auto mb-8">
            <div className="text-sm text-white/80">
              <strong>Correlation coefficient (r):</strong> Measures how closely your ratings match. 
              Values closer to 1.0 mean you agree more often, while values closer to -1.0 mean you often disagree.
            </div>
          </div>
        </motion.div>

        {/* Hot Takes Section */}
        {data.aligned_hot_takes.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              Your Aligned Hot Takes 🔥
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {data.aligned_hot_takes.slice(0, 6).map((hotTake, index) => (
                <motion.div
                  key={hotTake.song_order}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <div className="text-lg font-semibold text-white mb-2">
                    {hotTake.track_name}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-white/80">
                      You: <span className="font-semibold text-blue-300">{formatRating(hotTake.user_rating, true)}</span>
                    </div>
                    <div className="text-white/80">
                      Twin: <span className="font-semibold text-green-300">{formatRating(hotTake.twin_rating, true)}</span>
                    </div>
                    <div className="text-white/80">
                      Crowd: <span className="font-semibold text-gray-300">{formatFinnishNumber(hotTake.crowd_avg, 1)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-white/60">
                    {hotTake.delta_from_avg > 0 ? '+' : ''}{formatFinnishNumber(hotTake.delta_from_avg, 1)} from crowd average
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Visual Chart */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">Rating Comparison Chart</h3>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-4xl mx-auto">
            <div className="relative h-80 w-full">
              {/* Chart Grid */}
              <div className="absolute inset-0">
                {/* Grid lines */}
                {[4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <div key={rating} className="absolute w-full h-px bg-white/20" style={{ top: `${((10 - rating) / 6) * 100}%` }} />
                ))}
                {[4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <div key={rating} className="absolute h-full w-px bg-white/20" style={{ left: `${((rating - 4) / 6) * 100}%` }} />
                ))}
                
                {/* Data points */}
                {data.aligned_hot_takes.slice(0, 20).map((take, index) => {
                  const x = ((take.user_rating - 4) / 6) * 100
                  const y = ((10 - take.twin_rating) / 6) * 100
                  return (
                    <motion.div
                      key={index}
                      className="absolute w-3 h-3 bg-blue-400 rounded-full border-2 border-white"
                      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + (index * 0.02) }}
                    />
                  )
                })}
                
                {/* Perfect correlation line */}
                <div className="absolute w-full h-px bg-green-400/50" style={{ top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              
              {/* Axis labels */}
              <div className="absolute -bottom-8 left-0 right-0 text-center text-white/70 text-sm">
                Your Ratings
              </div>
              <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 -rotate-90 text-center text-white/70 text-sm">
                Twin Ratings
              </div>
              
              {/* Scale labels */}
              <div className="absolute -bottom-6 left-0 text-white/60 text-xs">4</div>
              <div className="absolute -bottom-6 right-0 text-white/60 text-xs">10</div>
              <div className="absolute -left-8 top-0 text-white/60 text-xs">10</div>
              <div className="absolute -left-8 bottom-0 text-white/60 text-xs">4</div>
            </div>
            
            <div className="mt-4 text-center text-white/70 text-sm">
              Each dot represents a song. Dots closer to the diagonal line show better agreement.
            </div>
          </div>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div 
          className="grid grid-cols-2 gap-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">
              {data.overlap_count}
            </div>
            <div className="text-white/80">
              Songs in Common
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">
              {data.aligned_hot_takes.length}
            </div>
            <div className="text-white/80">
              Aligned Hot Takes
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

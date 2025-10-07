'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/cards/taste-twin?email=${encodeURIComponent(userEmail)}`)
        if (response.ok) {
          const result = await response.json()
          console.log('Taste Twin API response:', result)
          setData(result)
        } else {
          console.error('Taste Twin API response not ok:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching taste twin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userEmail])

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">No taste twin found</div>
      </div>
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
          
          <div className="text-lg text-white/70">
            Based on {data.overlap_count} shared song ratings
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
                      You: <span className="font-semibold text-blue-300">{hotTake.user_rating.toFixed(1)}</span>
                    </div>
                    <div className="text-white/80">
                      Twin: <span className="font-semibold text-green-300">{hotTake.twin_rating.toFixed(1)}</span>
                    </div>
                    <div className="text-white/80">
                      Crowd: <span className="font-semibold text-gray-300">{hotTake.crowd_avg.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-white/60">
                    {hotTake.delta_from_avg > 0 ? '+' : ''}{hotTake.delta_from_avg.toFixed(1)} from crowd average
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom Stats */}
        <motion.div 
          className="grid grid-cols-2 gap-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
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

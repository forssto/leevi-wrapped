'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface DecadeRating {
  decade: number
  avg_rating: number
  review_count: number
}

interface EraBiasData {
  decade_ratings: DecadeRating[]
  best_decade: number
  worst_decade: number
  trend_slope: number
  trend_direction: 'increasing' | 'decreasing' | 'stable'
}

interface EraBiasCardProps {
  userEmail: string
}

export default function EraBiasCard({ userEmail }: EraBiasCardProps) {
  const [data, setData] = useState<EraBiasData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/cards/era-bias?email=${encodeURIComponent(userEmail)}`)
        if (response.ok) {
          const result = await response.json()
          console.log('Era Bias API response:', result)
          setData(result)
        } else {
          console.error('Era Bias API response not ok:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching era bias data:', error)
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
        <div className="text-white text-xl">No data available</div>
      </div>
    )
  }

  const getDecadeName = (decade: number) => {
    return `${decade}s`
  }

  const getTrendEmoji = (direction: string) => {
    switch (direction) {
      case 'increasing': return '📈'
      case 'decreasing': return '📉'
      default: return '➡️'
    }
  }

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'increasing': return 'text-green-400'
      case 'decreasing': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const maxRating = Math.max(...data.decade_ratings.map(d => d.avg_rating))
  const minRating = Math.min(...data.decade_ratings.map(d => d.avg_rating))

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
          Era Bias 📅
        </motion.h1>

        {/* Best Decade */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-3xl font-bold text-white mb-4">
            Your Favorite Era
          </div>
          
          <div className="text-6xl font-bold text-yellow-400 mb-4">
            {getDecadeName(data.best_decade)}
          </div>
          
          <div className="text-2xl text-white/80 mb-2">
            Average Rating: {data.decade_ratings.find(d => d.decade === data.best_decade)?.avg_rating.toFixed(2)}
          </div>
          
          <div className="text-lg text-white/60">
            {data.decade_ratings.find(d => d.decade === data.best_decade)?.review_count} songs reviewed
          </div>
        </motion.div>

        {/* Decade Chart */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">
            Rating by Decade
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {data.decade_ratings.map((decade, index) => {
              const height = ((decade.avg_rating - minRating) / (maxRating - minRating)) * 100 + 20
              const isBest = decade.decade === data.best_decade
              const isWorst = decade.decade === data.worst_decade
              
              return (
                <motion.div
                  key={decade.decade}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <div className="text-sm text-white/80 mb-2">
                    {getDecadeName(decade.decade)}
                  </div>
                  
                  <div className="relative w-16 h-32 bg-white/20 rounded-t-lg flex items-end">
                    <motion.div
                      className={`w-full rounded-t-lg ${
                        isBest ? 'bg-yellow-400' : 
                        isWorst ? 'bg-red-400' : 
                        'bg-blue-400'
                      }`}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                    />
                  </div>
                  
                  <div className="text-sm font-semibold text-white mt-2">
                    {decade.avg_rating.toFixed(1)}
                  </div>
                  
                  <div className="text-xs text-white/60">
                    {decade.review_count} songs
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Trend and Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">
              {getTrendEmoji(data.trend_direction)}
            </div>
            <div className={`text-lg font-semibold mb-2 ${getTrendColor(data.trend_direction)}`}>
              {data.trend_direction.charAt(0).toUpperCase() + data.trend_direction.slice(1)} Trend
            </div>
            <div className="text-white/80 text-sm">
              {data.trend_direction === 'increasing' ? 'You prefer newer music' :
               data.trend_direction === 'decreasing' ? 'You prefer older music' :
               'No clear preference'}
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">
              {getDecadeName(data.worst_decade)}
            </div>
            <div className="text-lg font-semibold text-red-400 mb-2">
              Least Favorite
            </div>
            <div className="text-white/80 text-sm">
              {data.decade_ratings.find(d => d.decade === data.worst_decade)?.avg_rating.toFixed(1)} avg rating
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">
              {data.decade_ratings.length}
            </div>
            <div className="text-lg font-semibold text-white mb-2">
              Decades Covered
            </div>
            <div className="text-white/80 text-sm">
              From {Math.min(...data.decade_ratings.map(d => d.decade))}s to {Math.max(...data.decade_ratings.map(d => d.decade))}s
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

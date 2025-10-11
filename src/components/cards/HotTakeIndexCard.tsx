'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatRating, formatFinnishNumber } from '@/lib/gradeUtils'
import CardWrapper from './CardWrapper'

interface HotTake {
  song_order: number
  track_name: string
  user_rating: number
  crowd_avg: number
  delta: number
  abs_delta: number
}

interface HotTakeIndexData {
  hot_take_index: number
  rank_percentile: number
  top_hot_takes: HotTake[]
  songs_within_025: number
}

interface HotTakeIndexCardProps {
  userEmail: string
}

export default function HotTakeIndexCard({ userEmail }: HotTakeIndexCardProps) {
  const [data, setData] = useState<HotTakeIndexData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/cards/hot-take-index?email=${encodeURIComponent(userEmail)}`)
        if (response.ok) {
          const result = await response.json()
          console.log('Hot Take Index API response:', result)
          setData(result)
        } else {
          console.error('Hot Take Index API response not ok:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching hot take index data:', error)
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
        error={!data ? 'No data available for Hot Take Index.' : undefined}
      />
    )
  }

  const getHotTakeLevel = (index: number) => {
    if (index >= 1.6) return { text: 'Ei mikään Robin Hood', color: 'text-red-400', emoji: '🔥' }
    if (index >= 1.2) return { text: 'Köyhän miehen Danny', color: 'text-orange-400', emoji: '⚡' }
    if (index >= 0.9) return { text: 'Elämä ikkunan takana', color: 'text-yellow-400', emoji: '💭' }
    if (index >= 0.6) return { text: 'Ihan tavalliset tennissukat', color: 'text-blue-400', emoji: '🧦' }
    return { text: 'Muumiverhot', color: 'text-green-400', emoji: '👥' }
  }

  const hotTakeInfo = getHotTakeLevel(data.hot_take_index)

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center p-8">
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
          Vastaantulijoiden kaistalla 🚗
        </motion.h1>

        {/* Main Index */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-8xl font-bold text-white mb-4">
            {data.hot_take_index.toFixed(2)}
          </div>
          <div className="text-lg text-white/70 mb-6">
            Keskimääräinen erimielisyys yleisön kanssa
          </div>
          
          <div className={`text-3xl font-bold mb-4 ${hotTakeInfo.color}`}>
            Luokka: {hotTakeInfo.text}
          </div>
        </motion.div>

        {/* Top Hot Takes */}
        {data.top_hot_takes.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="space-y-4 max-w-4xl mx-auto">
              {data.top_hot_takes.map((hotTake, index) => (
                <motion.div
                  key={hotTake.song_order}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <div className="text-xl font-semibold text-white mb-2">
                        {hotTake.track_name}
                      </div>
                      
                      <div className="flex gap-6 text-sm">
                        <div className="text-white/80">
                          Sinä: <span className="font-semibold text-blue-300">{formatRating(hotTake.user_rating, true)}</span>
                        </div>
                        <div className="text-white/80">
                          Raati: <span className="font-semibold text-gray-300">{formatFinnishNumber(hotTake.crowd_avg, 1)}</span>
                        </div>
                        <div className={`font-semibold ${hotTake.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {hotTake.delta > 0 ? '+' : ''}{formatFinnishNumber(hotTake.delta, 1)} ero
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold text-orange-400">
                        {formatFinnishNumber(hotTake.abs_delta, 1)}
                      </div>
                      <div className="text-xs text-white/60">
                        Ero raadista
                      </div>
                    </div>
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
          <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">
              {(100 - data.rank_percentile).toFixed(0)}%:lla
            </div>
            <div className="text-white/80">
              oli sinua kärkkäämmät mielipiteet
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">
              {data.songs_within_025}
            </div>
            <div className="text-white/80">
              kappaletta
            </div>
            <div className="text-white/60 text-xs mt-1">
              ...joista olit raadin kanssa samaa mieltä
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

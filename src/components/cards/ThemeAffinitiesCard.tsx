'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatFinnishNumber } from '@/lib/gradeUtils'
import CardWrapper from './CardWrapper'

interface ThemeAffinity {
  name: string
  correlation: number
  emoji: string
  description: string
  abs_correlation: number
  strength: string
  rating_difference?: number
  high_theme_avg?: number
  low_theme_avg?: number
  high_theme_count?: number
  low_theme_count?: number
  is_relative_aversion?: boolean
}

interface ThemeAffinitiesData {
  theme_personality: string
  personality_description: string
  personality_emoji: string
  user_avg_rating: number
  top_affinities: ThemeAffinity[]
  top_aversions: ThemeAffinity[]
  all_themes: ThemeAffinity[]
  avg_positive_difference: number
  avg_negative_difference: number
}

interface ThemeAffinitiesCardProps {
  userEmail: string
}

export default function ThemeAffinitiesCard({ userEmail }: ThemeAffinitiesCardProps) {
  const [data, setData] = useState<ThemeAffinitiesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/cards/theme-affinities?email=${encodeURIComponent(userEmail)}`)
        if (response.ok) {
          const result = await response.json()
          console.log('Theme Affinities API response:', result)
          console.log('Top affinities length:', result.top_affinities?.length)
          console.log('Top aversions length:', result.top_aversions?.length)
          setData(result)
        } else {
          console.error('Theme Affinities API response not ok:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching theme affinities data:', error)
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
        error={!data ? 'No data available for Theme Affinities.' : undefined}
      />
    )
  }


  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.1) return 'text-green-400'
    if (correlation > 0.05) return 'text-green-300'
    if (correlation > -0.05) return 'text-gray-400'
    if (correlation > -0.1) return 'text-red-300'
    return 'text-red-400'
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
          Mikä naidessa naurattaa? {data.personality_emoji}
        </motion.h1>

        {/* Theme Personality
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className={`text-5xl font-bold mb-4 ${getPersonalityColor(data.theme_personality)}`}>
            {data.theme_personality}
          </div>
          <div className="text-xl text-white/80 mb-6">
            {data.personality_description}
          </div>
        </motion.div>
        */}

        {/* Top Affinities and Aversions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Top Affinities */}
          {data.top_affinities.length > 0 && (
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-green-400 mb-6">💚 Suosikkiteemasi</h3>
              <div className="space-y-4">
                {data.top_affinities.map((theme, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{theme.emoji}</span>
                      <div>
                        <div className="text-white font-semibold">{theme.name}</div>
                        <div className="text-white/60 text-sm">{theme.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getCorrelationColor(theme.correlation)}`}>
                        {formatFinnishNumber(theme.correlation, 2)}
                      </div>
                      <div className="text-white/60 text-xs">{theme.strength}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Top Aversions */}
          {data.top_aversions.length > 0 && (
            <motion.div
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-red-400 mb-6">💔 Inhokkiteemasi</h3>
              <div className="space-y-4">
                {data.top_aversions.map((theme, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{theme.emoji}</span>
                      <div>
                        <div className="text-white font-semibold">{theme.name}</div>
                        <div className="text-white/60 text-sm">{theme.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getCorrelationColor(theme.correlation)}`}>
                        {formatFinnishNumber(theme.correlation, 2)}
                      </div>
                      <div className="text-white/60 text-xs">{theme.strength}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* All Themes Overview */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h3 className="text-2xl font-semibold text-white mb-6">Kaikki teema-korrelaatiot</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.all_themes.map((theme, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{theme.emoji}</div>
                <div className="text-white font-semibold text-sm mb-1">{theme.name}</div>
                <div className={`text-lg font-bold ${getCorrelationColor(theme.correlation)}`}>
                  {formatFinnishNumber(theme.correlation, 2)}
                </div>
                {/* <div className="text-white/60 text-xs">{theme.strength}</div> */}
              </div>
            ))}
          </div>
        </motion.div>
    </CardWrapper>
  )
}

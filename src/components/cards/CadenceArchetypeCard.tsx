'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatFinnishNumber } from '@/lib/gradeUtils'
import CardWrapper from './CardWrapper'

interface CadenceArchetypeData {
  archetype: string
  archetype_description: string
  archetype_emoji: string
  time_preference: string
  day_preference: string
  most_active_hour: number
  most_active_day: number
  avg_lag_days: number
  median_lag_days: number
  reviews_per_day: number
  total_days: number
  review_streaks: number
  hour_distribution: Record<number, number>
  day_distribution: Record<number, number>
}

interface CadenceArchetypeCardProps {
  userEmail: string
}

export default function CadenceArchetypeCard({ userEmail }: CadenceArchetypeCardProps) {
  const [data, setData] = useState<CadenceArchetypeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/cards/cadence-archetype?email=${encodeURIComponent(userEmail)}`)
        if (response.ok) {
          const result = await response.json()
          console.log('Cadence Archetype API response:', result)
          setData(result)
        } else {
          console.error('Cadence Archetype API response not ok:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching cadence archetype data:', error)
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
        error={!data ? 'No data available for Cadence Archetype.' : undefined}
      />
    )
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  const getTimePreferenceColor = (preference: string) => {
    switch (preference) {
      case 'Heti aamusta timmi': return 'text-yellow-400'
      case 'Sisälläni päivä on pidempi kuin yö': return 'text-orange-400'
      case 'Ilta keskikaupungilla': return 'text-purple-400'
      case 'Yön tuoksut': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getArchetypeColor = (archetype: string) => {
    switch (archetype) {
      case 'Eka!': return 'text-yellow-400'
      case 'Pohtija': return 'text-green-400'
      case 'Rykäisijä': return 'text-red-400'
      case 'Teuvo': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <CardWrapper>
        {/* Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-white mb-2">
          Arvioaktiivisuus {data.archetype_emoji}
          </h1>
          <h2 className="text-2xl text-white/70">
          <em>Muistan jokaisen illan, jokaisen aamun, jokaisen päivän, ja jokaisen yön</em>
          </h2>
        </motion.div>



        {/* Main Archetype */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className={`text-5xl font-bold mb-4 ${getArchetypeColor(data.archetype)}`}>
            {data.archetype}
          </div>
          <div className="text-xl text-white/80 mb-6">
            {data.archetype_description}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Time Preference */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col justify-center items-center text-center h-32">
            <div className="text-3xl font-bold text-white mb-2">
              {formatHour(data.most_active_hour)}
            </div>
            <div className="text-white/80 text-sm mb-1">
              Yleisin arvioajankohtasi
            </div>
            <div className={`text-sm font-semibold ${getTimePreferenceColor(data.time_preference)}`}>
              {data.time_preference}
            </div>
          </div>

          {/* Day Preference */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col justify-center items-center text-center h-32">
            <div className="text-3xl font-bold text-white mb-2">
              {data.day_preference}
            </div>
            <div className="text-white/80 text-sm">
              Yleisin arviopäiväsi
            </div>
          </div>

          {/* Average Lag */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col justify-center items-center text-center h-32">
            <div className="text-3xl font-bold text-white mb-2">
              {formatFinnishNumber(data.avg_lag_days, 1)}
            </div>
            <div className="text-white/80 text-sm">
              Keskim. päiviä arviointiin
            </div>
          </div>

          {/* Reviews per Day */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col justify-center items-center text-center h-32">
            <div className="text-3xl font-bold text-white mb-2">
              {formatFinnishNumber(data.reviews_per_day, 1)}
            </div>
            <div className="text-white/80 text-sm">
              Arvostelua päivässä
            </div>
          </div>
        </motion.div>

        {/* Review Pattern Summary */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-2xl font-semibold text-white mb-6">Arvosteluaktiivisuutesi</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white/90 mb-3">Arvosteluajankohdat</h4>
              <ul className="space-y-2 text-white/80">
                <li>• Arvioit useimmin klo <span className="font-semibold text-white">{formatHour(data.most_active_hour)}</span></li>
                <li>• Päivä oli yleensä <span className="font-semibold text-white">{data.day_preference}</span></li>
                <li>• Odotat tyypillisesti <span className="font-semibold text-white">{formatFinnishNumber(data.avg_lag_days, 1)} päivää</span> ennen arviointia</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white/90 mb-3">Arvostelurytmisi</h4>
              <ul className="space-y-2 text-white/80">
                <li>• <span className="font-semibold text-white">{data.total_days}</span> aktiivista päivää</li>
                <li>• <span className="font-semibold text-white">{formatFinnishNumber(data.reviews_per_day, 1)}</span> arvostelua päivässä keskimäärin</li>
                <li>• <span className="font-semibold text-white">{data.review_streaks}</span> arvosteluputkea (20+ kappaletta 3 tunnissa)</li>
              </ul>
            </div>
          </div>
        </motion.div>
    </CardWrapper>
  )
}

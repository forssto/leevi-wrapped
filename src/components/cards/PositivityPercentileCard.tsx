'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatFinnishNumber } from '@/lib/gradeUtils'
import CardWrapper from './CardWrapper'

interface PositivityPercentileData {
  user_avg: number
  all_avg: number
  all_percentile: number
  cohort_percentiles: {
    gender?: number
    decade?: number
    city?: number
    works_in_music?: number
    plays_music?: number
  }
}

interface PositivityPercentileCardProps {
  userEmail: string
}

export default function PositivityPercentileCard({ userEmail }: PositivityPercentileCardProps) {
  const [data, setData] = useState<PositivityPercentileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/cards/positivity-percentile?email=${encodeURIComponent(userEmail)}`)
        if (response.ok) {
          const result = await response.json()
          console.log('Positivity Percentile API response:', result)
          setData(result)
        } else {
          console.error('API response not ok:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching positivity percentile data:', error)
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
        error={!data ? 'No data available for Positivity Percentile.' : undefined}
      />
    )
  }

  const getPercentileText = (percentile: number) => {
    if (percentile >= 90) return "Top 10% most positive"
    if (percentile >= 80) return "Top 20% most positive"
    if (percentile >= 70) return "Top 30% most positive"
    if (percentile >= 60) return "Above average positivity"
    if (percentile >= 40) return "Average positivity"
    if (percentile >= 30) return "Below average positivity"
    if (percentile >= 20) return "Bottom 30% positivity"
    if (percentile >= 10) return "Bottom 20% positivity"
    return "Bottom 10% positivity"
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 70) return "bg-green-500"
    if (percentile >= 40) return "bg-yellow-500"
    return "bg-red-500"
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
          Positivity Percentile
        </motion.h1>

        {/* Main Stats */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-8xl font-bold text-white mb-4">
            {data.user_avg ? formatFinnishNumber(data.user_avg, 2) : '0,00'}
          </div>
          <div className="text-2xl text-white/80 mb-2">
            Your Average Rating
          </div>
        </motion.div>

        {/* Percentile Badge */}
        <motion.div 
          className={`inline-block px-6 py-3 rounded-full text-white font-semibold text-xl mb-8 ${getPercentileColor(data.all_percentile)}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {getPercentileText(data.all_percentile)}
        </motion.div>

        {/* Comparison Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-3xl font-bold text-white mb-2">
              {data.all_avg ? formatFinnishNumber(data.all_avg, 2) : '0,00'}
            </div>
            <div className="text-white/80">
              Overall Average
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-3xl font-bold text-white mb-2">
              {data.all_percentile ? formatFinnishNumber(data.all_percentile, 0) : '0'}%
            </div>
            <div className="text-white/80">
              Percentile Rank
            </div>
          </div>
        </motion.div>

        {/* Cohort Percentiles */}
        {(data.cohort_percentiles.gender || data.cohort_percentiles.decade || data.cohort_percentiles.city || data.cohort_percentiles.works_in_music || data.cohort_percentiles.plays_music) && (
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {data.cohort_percentiles.gender && (
              <div className="bg-white/10 backdrop-blur-lg rounded-full px-4 py-2">
                <span className="text-white/80 text-sm">Same Gender: </span>
                <span className="text-white font-semibold">{data.cohort_percentiles.gender ? formatFinnishNumber(data.cohort_percentiles.gender, 0) : '0'}%</span>
              </div>
            )}
            {data.cohort_percentiles.decade && (
              <div className="bg-white/10 backdrop-blur-lg rounded-full px-4 py-2">
                <span className="text-white/80 text-sm">Same Decade: </span>
                <span className="text-white font-semibold">{data.cohort_percentiles.decade ? formatFinnishNumber(data.cohort_percentiles.decade, 0) : '0'}%</span>
              </div>
            )}
            {data.cohort_percentiles.city && (
              <div className="bg-white/10 backdrop-blur-lg rounded-full px-4 py-2">
                <span className="text-white/80 text-sm">Same City: </span>
                <span className="text-white font-semibold">{data.cohort_percentiles.city ? formatFinnishNumber(data.cohort_percentiles.city, 0) : '0'}%</span>
              </div>
            )}
            {data.cohort_percentiles.works_in_music && (
              <div className="bg-white/10 backdrop-blur-lg rounded-full px-4 py-2">
                <span className="text-white/80 text-sm">Music Workers: </span>
                <span className="text-white font-semibold">{data.cohort_percentiles.works_in_music ? formatFinnishNumber(data.cohort_percentiles.works_in_music, 0) : '0'}%</span>
              </div>
            )}
            {data.cohort_percentiles.plays_music && (
              <div className="bg-white/10 backdrop-blur-lg rounded-full px-4 py-2">
                <span className="text-white/80 text-sm">Musicians: </span>
                <span className="text-white font-semibold">{data.cohort_percentiles.plays_music ? formatFinnishNumber(data.cohort_percentiles.plays_music, 0) : '0'}%</span>
              </div>
            )}
          </motion.div>
        )}
    </CardWrapper>
  )
}

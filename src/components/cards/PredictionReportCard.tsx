'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatFinnishNumber } from '@/lib/gradeUtils'
import CardWrapper from './CardWrapper'

interface PredictionFactor {
  name: string
  weight: number
  value: number
  description: string
  emoji: string
}

interface PredictionReportData {
  grade: string
  grade_description: string
  grade_emoji: string
  grade_color: string
  predictability_score: number
  user_avg_rating: number
  rating_consistency: number
  prediction_factors: PredictionFactor[]
  insights: string[]
  report_summary: string
}

interface PredictionReportCardProps {
  userEmail: string
}

export default function PredictionReportCard({ userEmail }: PredictionReportCardProps) {
  const [data, setData] = useState<PredictionReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/cards/prediction-report?email=${encodeURIComponent(userEmail)}`)
        if (response.ok) {
          const result = await response.json()
          console.log('Prediction Report API response:', result)
          setData(result)
        } else {
          console.error('Prediction Report API response not ok:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching prediction report data:', error)
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
        error={!data ? 'No data available for Prediction Report.' : undefined}
      />
    )
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'text-green-400'
      case 'B': return 'text-blue-400'
      case 'C': return 'text-yellow-400'
      case 'D': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getFactorColor = (value: number) => {
    if (value >= 0.8) return 'text-green-400'
    if (value >= 0.6) return 'text-blue-400'
    if (value >= 0.4) return 'text-yellow-400'
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
          Prediction Report Card {data.grade_emoji}
        </motion.h1>

        {/* Main Grade */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-8xl font-bold text-white mb-4">
            {data.grade}
          </div>
          <div className={`text-3xl font-bold mb-4 ${getGradeColor(data.grade)}`}>
            {data.grade_description}
          </div>
          <div className="text-lg text-white/70 mb-6">
            {data.report_summary}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Predictability Score */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">
              {formatFinnishNumber(data.predictability_score * 100, 0)}%
            </div>
            <div className="text-white/80 text-sm">
              Predictability Score
            </div>
          </div>


          {/* Rating Consistency */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">
              {formatFinnishNumber(data.rating_consistency, 2)}
            </div>
            <div className="text-white/80 text-sm">
              Rating Std Dev
            </div>
          </div>
        </motion.div>

        {/* Prediction Factors */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-2xl font-semibold text-white mb-6">Prediction Factors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.prediction_factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{factor.emoji}</span>
                  <div>
                    <div className="text-white font-semibold">{factor.name}</div>
                    <div className="text-white/60 text-sm">{factor.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getFactorColor(factor.value)}`}>
                    {formatFinnishNumber(factor.value * 100, 0)}%
                  </div>
                  <div className="text-white/60 text-xs">
                    Weight: {formatFinnishNumber(factor.weight * 100, 0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h3 className="text-2xl font-semibold text-white mb-6">Key Insights</h3>
          <div className="space-y-3">
            {data.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-blue-400 text-xl">•</span>
                <span className="text-white/90">{insight}</span>
              </div>
            ))}
          </div>
        </motion.div>
    </CardWrapper>
  )
}

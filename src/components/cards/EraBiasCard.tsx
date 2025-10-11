'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatFinnishNumber } from '@/lib/gradeUtils'
import CardWrapper from './CardWrapper'

interface DecadeRating {
  decade: number
  avg_rating: number
  review_count: number
}

interface YearRating {
  year: number
  avg_rating: number
  review_count: number
}

interface EraBiasData {
  decade_ratings: DecadeRating[]
  year_ratings: YearRating[]
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

  if (loading || !data) {
    return (
      <CardWrapper 
        isLoading={loading} 
        error={!data ? 'No data available for Era Bias.' : undefined}
      />
    )
  }

  const getDecadeName = (decade: number) => {
    const decadeStr = decade.toString()
    if (decadeStr.length === 4) {
      // Handle full years like 1970, 1980, etc.
      const lastTwoDigits = decadeStr.slice(-2)
      return `${lastTwoDigits}-luku`
    } else if (decadeStr.length === 2) {
      // Handle abbreviated years like 70, 80, etc.
      return `${decadeStr}-luku`
    }
    return `${decade}s` // fallback
  }


  const maxRating = Math.max(...data.year_ratings.map(y => y.avg_rating))
  const minRating = Math.min(...data.year_ratings.map(y => y.avg_rating))
  const ratingRange = maxRating - minRating

  return (
    <CardWrapper>
      {/* Title */}
      <motion.h1 
        className="text-5xl font-bold text-white mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Lukiossa vuonna &apos;69 📅
      </motion.h1>

      {/* Best Decade */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="text-3xl font-bold text-white mb-4">
          Suosikki-aikakautesi
        </div>
        
        <div className="text-6xl font-bold text-yellow-400 mb-4">
          {getDecadeName(data.best_decade)}
        </div>
        
        <div className="text-2xl text-white/80 mb-2">
          Keskiarvo: {data.decade_ratings.find(d => d.decade === data.best_decade)?.avg_rating ? formatFinnishNumber(data.decade_ratings.find(d => d.decade === data.best_decade)!.avg_rating, 2) : '0,00'}
        </div>
      </motion.div>

      {/* Timeline Chart */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">
          Arviosi julkaisuvuoden mukaan
        </h3>
        
        <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
          <div className="relative h-64 w-full">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-white/60 pr-2">
              <span>{formatFinnishNumber(maxRating, 1)}</span>
              <span>{formatFinnishNumber((maxRating + minRating) / 2, 1)}</span>
              <span>{formatFinnishNumber(minRating, 1)}</span>
            </div>
            
            {/* Chart area */}
            <div className="ml-12 mr-4 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                <div className="border-t border-white/10"></div>
                <div className="border-t border-white/10"></div>
                <div className="border-t border-white/10"></div>
              </div>
              
              {/* Data points and line */}
              <svg className="absolute inset-0 w-full h-full">
                {/* Line connecting points */}
                <polyline
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  points={data.year_ratings.map((year, index) => {
                    const x = (index / (data.year_ratings.length - 1)) * 100
                    const y = 100 - ((year.avg_rating - minRating) / ratingRange) * 100
                    return `${x}%,${y}%`
                  }).join(' ')}
                />
                
                {/* Data points */}
                {data.year_ratings.map((year, index) => {
                  const x = (index / (data.year_ratings.length - 1)) * 100
                  const y = 100 - ((year.avg_rating - minRating) / ratingRange) * 100
                  const isBest = year.year >= data.best_decade && year.year < data.best_decade + 10
                  
                  return (
                    <circle
                      key={year.year}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="4"
                      fill={isBest ? "#fbbf24" : "#60a5fa"}
                      className="hover:r-6 transition-all"
                    />
                  )
                })}
              </svg>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-12 right-4 flex justify-between text-xs text-white/60 mt-2">
              {data.year_ratings.map((year, index) => {
                if (index % Math.ceil(data.year_ratings.length / 8) === 0) {
                  return (
                    <span key={year.year} className="text-center">
                      {year.year}
                    </span>
                  )
                }
                return null
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decade Summary */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {data.decade_ratings.map((decade, index) => {
          const isBest = decade.decade === data.best_decade
          const isWorst = decade.decade === data.worst_decade
          
          return (
            <motion.div
              key={decade.decade}
              className="bg-white/5 border border-white/20 rounded-xl p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
            >
              <div className="text-lg font-bold text-white mb-2">
                {getDecadeName(decade.decade)}
              </div>
              
              <div className={`text-3xl font-bold mb-2 ${
                isBest ? 'text-yellow-400' : 
                isWorst ? 'text-red-400' : 
                'text-white'
              }`}>
                {formatFinnishNumber(decade.avg_rating, 2)}
              </div>
              
              <div className="text-sm text-white/60">
                {decade.review_count} kappaletta
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </CardWrapper>
  )
}

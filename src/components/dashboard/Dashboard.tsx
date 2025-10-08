'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import PositivityPercentileCard from '../cards/PositivityPercentileCard'
import AlbumPreferencesCard from '../cards/AlbumPreferencesCard'
import TasteTwinCard from '../cards/TasteTwinCard'
import HotTakeIndexCard from '../cards/HotTakeIndexCard'
import EraBiasCard from '../cards/EraBiasCard'
import CadenceArchetypeCard from '../cards/CadenceArchetypeCard'
import ThemeAffinitiesCard from '../cards/ThemeAffinitiesCard'
import PopularityReversalCard from '../cards/PopularityReversalCard'
import PredictionReportCard from '../cards/PredictionReportCard'
import { motion } from 'framer-motion'

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const userEmail = user.email || ''


  const slides = [
    {
      title: "Positivity Percentile",
      content: <PositivityPercentileCard userEmail={userEmail} />
    },
    {
      title: "Album Superfan & Nemesis",
      content: <AlbumPreferencesCard userEmail={userEmail} />
    },
    {
      title: "Taste Twin Found!",
      content: <TasteTwinCard userEmail={userEmail} />
    },
    {
      title: "Hot Take Index",
      content: <HotTakeIndexCard userEmail={userEmail} />
    },
    {
      title: "Era Bias",
      content: <EraBiasCard userEmail={userEmail} />
    },
    {
      title: "Cadence Archetype",
      content: <CadenceArchetypeCard userEmail={userEmail} />
    },
    {
      title: "Theme Affinities",
      content: <ThemeAffinitiesCard userEmail={userEmail} />
    },
    {
      title: "Popularity Reversal",
      content: <PopularityReversalCard userEmail={userEmail} />
    },
    {
      title: "Prediction Report Card",
      content: <PredictionReportCard userEmail={userEmail} />
    }
  ]

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(0, prev - 1))
      } else if (event.key === 'ArrowRight') {
        setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slides.length])


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-1">Your Leevi Wrapped</h1>
          <p className="text-white/70 text-sm">Welcome back, {user.email}!</p>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="pt-24 pb-32 px-4 h-screen flex flex-col">
        {/* Slide Counter */}
        <div className="text-center mb-4 z-10">
          <p className="text-white/60 text-sm">
            {currentSlide + 1} of {slides.length}: {slides[currentSlide]?.title}
          </p>
        </div>
        
        {/* Card Container */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full max-w-6xl h-full"
          >
            {slides[currentSlide].content}
          </motion.div>
        </div>
      </div>

      {/* Navigation - Fixed at bottom */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/10">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            ← Previous
          </button>
          
          {/* Slide indicator */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Next →
          </button>
        </div>
        
        {/* Keyboard hint */}
        <div className="text-center mt-2">
          <p className="text-white/50 text-xs">
            Use ← → arrow keys to navigate
          </p>
        </div>
      </div>
    </div>
  )
}

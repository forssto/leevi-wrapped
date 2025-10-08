'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import PositivityPercentileCard from '../cards/PositivityPercentileCard'
import AlbumPreferencesCard from '../cards/AlbumPreferencesCard'
import TasteTwinCard from '../cards/TasteTwinCard'
import HotTakeIndexCard from '../cards/HotTakeIndexCard'
import EraBiasCard from '../cards/EraBiasCard'
import CadenceArchetypeCard from '../cards/CadenceArchetypeCard'
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Your Leevi Wrapped</h1>
          <p className="text-white/70">Welcome back, {user.email}!</p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {/* Debug info */}
          <div className="text-center mb-4">
            <p className="text-white/60 text-sm">
              Slide {currentSlide + 1} of {slides.length}: {slides[currentSlide]?.title}
            </p>
          </div>
          
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full h-[80vh]"
          >
            {slides[currentSlide].content}
          </motion.div>

          {/* Navigation - Fixed at bottom with high z-index */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex justify-center items-center gap-6 bg-black/30 backdrop-blur-lg rounded-2xl px-6 py-4">
              <button
                onClick={() => {
                  console.log('Previous clicked, current slide:', currentSlide)
                  setCurrentSlide(Math.max(0, currentSlide - 1))
                }}
                disabled={currentSlide === 0}
                className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              {/* Slide indicator */}
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={() => {
                  console.log('Next clicked, current slide:', currentSlide)
                  setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
                }}
                disabled={currentSlide === slides.length - 1}
                className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
            
            {/* Keyboard hint */}
            <div className="text-center mt-2">
              <p className="text-white/60 text-sm">
                Use ← → arrow keys or click to navigate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

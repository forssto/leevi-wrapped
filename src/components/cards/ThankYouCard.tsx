'use client'

import { motion } from 'framer-motion'
import CardWrapper from './CardWrapper'

export default function ThankYouCard() {
  return (
    <CardWrapper>
      {/* Title */}
      <motion.h1 
        className="text-6xl font-bold text-white mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Thank You! 🙏
      </motion.h1>

      {/* Main Message */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="text-4xl font-bold text-white mb-8">
          Thank you for participating in the Leevi review project!
        </div>
        
        <div className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
          Your detailed reviews and insights have helped create this unique musical analysis. 
          We hope you enjoyed discovering your personal Leevi Wrapped and learning about your 
          musical taste patterns.
        </div>
      </motion.div>

      {/* Final Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="bg-white/5 border border-white/20 rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">206</div>
          <div className="text-white/80">Songs Reviewed</div>
        </div>
        
        <div className="bg-white/5 border border-white/20 rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">8</div>
          <div className="text-white/80">Insight Cards</div>
        </div>
        
        <div className="bg-white/5 border border-white/20 rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">1</div>
          <div className="text-white/80">Unique Musical Profile</div>
        </div>
      </motion.div>

      {/* Closing Message */}
      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="text-lg text-white/70">
          Keep listening, keep discovering, and keep sharing your musical passion! 🎵
        </div>
      </motion.div>
    </CardWrapper>
  )
}

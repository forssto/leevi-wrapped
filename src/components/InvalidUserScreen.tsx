'use client'

import { motion } from 'framer-motion'
import LogoutButton from './auth/LogoutButton'

interface InvalidUserScreenProps {
  userEmail: string
}

export default function InvalidUserScreen({ userEmail }: InvalidUserScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="absolute top-4 right-4">
        <LogoutButton />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-8xl mb-8"
        >
          🚫
        </motion.div>
        
        {/* Error Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-white mb-6"
        >
          Account Not Found
        </motion.h1>
        
        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8"
        >
          <p className="text-white/90 text-lg mb-4">
            The Google account <span className="font-semibold text-yellow-300">{userEmail}</span> didn&apos;t complete the Leevi review project.
          </p>
          
          <p className="text-white/70 text-base">
            Only participants who completed all the song reviews can access their personalized Leevi Wrapped.
          </p>
        </motion.div>
        
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            Back to Home
          </button>
          
          <button
            onClick={() => window.location.href = 'mailto:contact@example.com'}
            className="px-6 py-3 bg-blue-500/80 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Contact Support
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}

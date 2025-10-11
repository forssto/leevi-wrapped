'use client'

import { motion } from 'framer-motion'
import LogoutButton from './auth/LogoutButton'

interface InvalidUserScreenProps {
  userEmail: string
}

export default function InvalidUserScreen({ userEmail }: InvalidUserScreenProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
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
          Tiliä ei löytynyt
        </motion.h1>
        
        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/20 rounded-2xl p-8 mb-8"
        >
          <p className="text-white/90 text-lg mb-4">
            Google-tili <span className="font-semibold text-yellow-300">{userEmail}</span> ei suorittanut Leevi-arviointiprojektia loppuun.
          </p>
          
          <p className="text-white/70 text-base">
            Vain osallistujat, jotka suorittivat kaikki arviot, voivat nauttia henkilökohtaisesta Leevi Wrapped -kokemuksesta.
          </p>
          <p className="text-white/70 text-base">
            Jos tässä meni jotain väärin, ota yhteyttä: <a href="mailto:tommi.forsstrom@gmail.com" className="text-white/70 hover:text-yellow-300 transition-colors">tommi.forsstrom@gmail.com</a>
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
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Takaisin etusivulle
          </button>
          
          <LogoutButton />
        </motion.div>
      </motion.div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Song } from '@/types/database'

interface SongCardProps {
  song: Song
  rating?: number
  rank?: number
  isTop?: boolean
}

export default function SongCard({ song, rating, rank, isTop = false }: SongCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl p-6 shadow-lg ${isTop ? 'ring-2 ring-yellow-400' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{song.track_name}</h3>
          <p className="text-gray-600 mb-2">{song.album} ({song.year})</p>
          {rating && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{rating}</span>
              <span className="text-sm text-gray-500">/ 10</span>
            </div>
          )}
        </div>
        {rank && (
          <div className="text-right">
            <span className="text-3xl font-bold text-gray-300">#{rank}</span>
          </div>
        )}
      </div>
      
      {song.main_lines && (
        <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
          <p className="text-sm italic text-gray-700">"{song.main_lines}"</p>
        </div>
      )}
      
      {song.tags_adjective && (
        <div className="mt-4 flex flex-wrap gap-2">
          {song.tags_adjective.split(', ').slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

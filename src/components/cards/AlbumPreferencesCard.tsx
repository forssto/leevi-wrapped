'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { formatFinnishNumber } from '@/lib/gradeUtils'
import CardWrapper from './CardWrapper'

interface AlbumPreferencesData {
  fav_album: string
  fav_album_user_avg: number
  users_who_liked_fav_more: number
  fav_album_cover: string | null
  worst_album: string
  worst_album_user_avg: number
  users_who_liked_worst_less: number
  worst_album_cover: string | null
  album_rankings: Array<{
    album: string
    avg_rating: number
    crowd_avg: number
    cover: string
  }>
}

interface AlbumPreferencesCardProps {
  userEmail: string
}

export default function AlbumPreferencesCard({ userEmail }: AlbumPreferencesCardProps) {
  const [data, setData] = useState<AlbumPreferencesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/cards/album-preferences?email=${encodeURIComponent(userEmail)}`)
        if (response.ok) {
          const result = await response.json()
          console.log('Album Preferences API response:', result)
          setData(result)
        } else {
          console.error('Album Preferences API response not ok:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching album preferences data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userEmail])

  if (loading) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-white text-xl">Ladataan...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-white text-xl">Tietoja ei saatavilla</div>
      </div>
    )
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
            Suru ja Onni
          </h1>
          <h2 className="text-2xl text-white/70">
            suosikki- ja inhokkilevyt
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Favorite Album */}
          <motion.div 
            className="bg-white/5 border border-white/20 rounded-3xl p-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="text-2xl font-bold text-green-400 mb-6">😍 Suosikki</div>
            
            {/* Album Cover */}
            {data.fav_album_cover && (
              <div className="mb-6">
                <Image 
                  src={data.fav_album_cover}
                  alt={data.fav_album}
                  width={128}
                  height={128}
                  className="w-32 h-32 mx-auto rounded-lg shadow-lg"
                />
              </div>
            )}
            
            <div className="text-3xl font-bold text-white mb-2">
              {data.fav_album}
            </div>
            
            <div className="text-6xl font-bold text-green-400 mb-4">
              {data.fav_album_user_avg ? formatFinnishNumber(data.fav_album_user_avg, 2) : '0,00'}
            </div>
            
            <div className="text-white/80 mb-4">
              Sinun keskiarvosi
            </div>
            
            <div className="bg-green-500/20 rounded-full px-4 py-2 inline-block">
              <span className="text-green-300 font-semibold">
                {data.users_who_liked_fav_more === 1 
                  ? '1 ihminen rakasti sitä vielä enemmän'
                  : `${data.users_who_liked_fav_more} ihmistä rakasti sitä vielä enemmän`
                }
              </span>
            </div>
          </motion.div>

          {/* Least Favorite Album */}
          <motion.div 
            className="bg-white/5 border border-white/20 rounded-3xl p-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-2xl font-bold text-red-400 mb-6">😤 Inhokki</div>
            
            {/* Album Cover */}
            {data.worst_album_cover && (
              <div className="mb-6">
                <Image 
                  src={data.worst_album_cover}
                  alt={data.worst_album}
                  width={128}
                  height={128}
                  className="w-32 h-32 mx-auto rounded-lg shadow-lg opacity-60"
                />
              </div>
            )}
            
            <div className="text-3xl font-bold text-white mb-2">
              {data.worst_album}
            </div>
            
            <div className="text-6xl font-bold text-red-400 mb-4">
              {data.worst_album_user_avg ? formatFinnishNumber(data.worst_album_user_avg, 2) : '0,00'}
            </div>
            
            <div className="text-white/80 mb-4">
              Sinun keskiarvosi
            </div>
            
            <div className="bg-red-500/20 rounded-full px-4 py-2 inline-block">
              <span className="text-red-300 font-semibold">
                {data.users_who_liked_worst_less === 1 
                  ? '1 ihminen piti siitä vielä vähemmän'
                  : `${data.users_who_liked_worst_less} ihmistä piti siitä vielä vähemmän`
                }
              </span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div 
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-white/5 border border-white/20 rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-2">
              {formatFinnishNumber((data.fav_album_user_avg || 0) - (data.worst_album_user_avg || 0), 2)}
            </div>
            <div className="text-white/80">
              Arvioiden ero suosikki- ja inhokkialbumisi välillä
            </div>
          </div>
        </motion.div>

        {/* Album Rankings */}
        {data.album_rankings && data.album_rankings.length > 0 && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Kaikki albumit</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
              {data.album_rankings.map((album, index) => (
                <motion.div
                  key={album.album}
                        className="bg-white/5 border border-white/20 rounded-xl p-3 text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 + (index * 0.05) }}
                >
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <Image
                      src={album.cover}
                      alt={album.album}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="text-xs font-semibold text-white mb-1">
                    #{index + 1}
                  </div>
                  <div className="text-xs text-white/80 mb-1 truncate" title={album.album}>
                    {album.album}
                  </div>
                  <div className={`text-sm font-bold mb-1 ${
                    album.avg_rating > album.crowd_avg 
                      ? 'text-green-400' 
                      : album.avg_rating < album.crowd_avg 
                        ? 'text-red-400' 
                        : 'text-white'
                  }`}>
                    {formatFinnishNumber(album.avg_rating, 2)}
                  </div>
                  <div className="text-xs text-white/60">
                    Raati: {formatFinnishNumber(album.crowd_avg, 2)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
    </CardWrapper>
  )
}

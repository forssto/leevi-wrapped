'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
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
        Kiitos! 🙏
      </motion.h1>

      {/* Main Message */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="text-2xl font-bold text-white mb-8">
          Vielä kerran iso kiitos osallistumisestasi Leevi-projektiin.
        </div>
        <div className="text-sm text-white mb-8">
          <em>&ldquo;Kun kyyneleet i ögonen, kertovat om projekten -- Minns du sommarn tjugofem?&rdquo;</em>
        </div>
        <div className="text-sm text-white mb-8">
          <em>Ja me toivotamme <br />
          Ikävää, synkkää<br />
          Kylmää, pimeää<br />
          Ja oikein surullista joulua!</em>
        </div>
      </motion.div>

      {/* Image */}
      <motion.div
        className="flex justify-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Image
          src="/kuvia/leevijuttu_soundi.fi__0.jpg"
          alt="Leevi-projekti"
          width={320}
          height={240}
          className="rounded-2xl"
        />
      </motion.div>


    </CardWrapper>
  )
}

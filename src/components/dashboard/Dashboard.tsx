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
import { motion } from 'framer-motion'
import LogoutButton from '../auth/LogoutButton'

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [userEmail, setUserEmail] = useState(user.email || '')


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
          <div className="min-h-screen bg-black" style={{ minHeight: '100vh' }}>
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <motion.h1 
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Your Leevi Wrapped
              </motion.h1>
        
        <div className="flex items-center gap-4">
          {/* User Switcher (only for tommi.forsstrom@gmail.com) */}
          {user.email === 'tommi.forsstrom@gmail.com' && (
                  <select 
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="bg-white text-black rounded-lg px-3 py-2 text-sm border border-white max-w-xs"
                  >
              <option value="tommi.forsstrom@gmail.com">tommi.forsstrom@gmail.com</option>
              <option value="aarolaakkonen22@gmail.com">aarolaakkonen22@gmail.com</option>
              <option value="anniinahavukainen@gmail.com">anniinahavukainen@gmail.com</option>
              <option value="antti.olavi.piirainen@gmail.com">antti.olavi.piirainen@gmail.com</option>
              <option value="antti.saloniemi@gmail.com">antti.saloniemi@gmail.com</option>
              <option value="anttilei@gmail.com">anttilei@gmail.com</option>
              <option value="jouni.tamm@gmail.com">jouni.tamm@gmail.com</option>
              <option value="jpheimolinna@gmail.com">jpheimolinna@gmail.com</option>
              <option value="jptoivonen@gmail.com">jptoivonen@gmail.com</option>
              <option value="juha.pantzar@gmail.com">juha.pantzar@gmail.com</option>
              <option value="jukka.onninen@gmail.com">jukka.onninen@gmail.com</option>
              <option value="jupesone@gmail.com">jupesone@gmail.com</option>
              <option value="jussi.norberg@gmail.com">jussi.norberg@gmail.com</option>
              <option value="jussiperala1@gmail.com">jussiperala1@gmail.com</option>
              <option value="kalle.hurme@gmail.com">kalle.hurme@gmail.com</option>
              <option value="katja.klemola@kolumbus.fi">katja.klemola@kolumbus.fi</option>
              <option value="katjaphynninen@gmail.com">katjaphynninen@gmail.com</option>
              <option value="keikkaolli@gmail.com">keikkaolli@gmail.com</option>
              <option value="kivela.marko@gmail.com">kivela.marko@gmail.com</option>
              <option value="koivu77@gmail.com">koivu77@gmail.com</option>
              <option value="koivunen.paivi@gmail.com">koivunen.paivi@gmail.com</option>
              <option value="korhosenriku@gmail.com">korhosenriku@gmail.com</option>
              <option value="korsow.kaisu@gmail.com">korsow.kaisu@gmail.com</option>
              <option value="kostajakinnunen@gmail.com">kostajakinnunen@gmail.com</option>
              <option value="kruiik@gmail.com">kruiik@gmail.com</option>
              <option value="kulmajarvi@gmail.com">kulmajarvi@gmail.com</option>
              <option value="lassi.peltoniemi@gmail.com">lassi.peltoniemi@gmail.com</option>
              <option value="kutsumanimi.sukunimi@gmail.com">kutsumanimi.sukunimi@gmail.com</option>
              <option value="lauri.aleksi.niskanen@gmail.com">lauri.aleksi.niskanen@gmail.com</option>
              <option value="lindholm.kalle@gmail.com">lindholm.kalle@gmail.com</option>
              <option value="lms.janne@gmail.com">lms.janne@gmail.com</option>
              <option value="luukkanen75@gmail.com">luukkanen75@gmail.com</option>
              <option value="maarit.nevanpera@gmail.com">maarit.nevanpera@gmail.com</option>
              <option value="magdaleena.markkola@gmail.com">magdaleena.markkola@gmail.com</option>
              <option value="maijastiina.vilenius@gmail.com">maijastiina.vilenius@gmail.com</option>
              <option value="makela.kaj@gmail.com">makela.kaj@gmail.com</option>
              <option value="marko.hartoneva@gmail.com">marko.hartoneva@gmail.com</option>
              <option value="marko.vuolukka@gmail.com">marko.vuolukka@gmail.com</option>
              <option value="markus.niko.hilden@gmail.com">markus.niko.hilden@gmail.com</option>
              <option value="matti@nrgm.fi">matti@nrgm.fi</option>
              <option value="mattierasaari@gmail.com">mattierasaari@gmail.com</option>
              <option value="meri.alakokko2@gmail.com">meri.alakokko2@gmail.com</option>
              <option value="merja.vedenjuoksu@gmail.com">merja.vedenjuoksu@gmail.com</option>
              <option value="mhuikkonen@hotmail.com">mhuikkonen@hotmail.com</option>
              <option value="mikael.j.mattila@gmail.com">mikael.j.mattila@gmail.com</option>
              <option value="mikko.a.merilainen@gmail.com">mikko.a.merilainen@gmail.com</option>
              <option value="mikko.hahtala@gmail.com">mikko.hahtala@gmail.com</option>
              <option value="mikko.kangasjarvi@gmail.com">mikko.kangasjarvi@gmail.com</option>
              <option value="mikko.knutas@gmail.com">mikko.knutas@gmail.com</option>
              <option value="minna.anneli.toivonen@gmail.com">minna.anneli.toivonen@gmail.com</option>
              <option value="minna.liljedahl@gmail.com">minna.liljedahl@gmail.com</option>
              <option value="minna.ruuhi@gmail.com">minna.ruuhi@gmail.com</option>
              <option value="mirakatva@gmail.com">mirakatva@gmail.com</option>
              <option value="mirva.myllynen@gmail.com">mirva.myllynen@gmail.com</option>
              <option value="mkkjhnsl@gmail.com">mkkjhnsl@gmail.com</option>
              <option value="monna.ahola@gmail.com">monna.ahola@gmail.com</option>
              <option value="mowander72@gmail.com">mowander72@gmail.com</option>
              <option value="narvanen.paivi@gmail.com">narvanen.paivi@gmail.com</option>
              <option value="nikulansanttu@gmail.com">nikulansanttu@gmail.com</option>
              <option value="noyougirlsneverknow@gmail.com">noyougirlsneverknow@gmail.com</option>
              <option value="npeltone@gmail.com">npeltone@gmail.com</option>
              <option value="olli.aimola@gmail.com">olli.aimola@gmail.com</option>
              <option value="olli.sulopuisto@gmail.com">olli.sulopuisto@gmail.com</option>
              <option value="ollinsposti@gmail.com">ollinsposti@gmail.com</option>
              <option value="oskari.onninen@gmail.com">oskari.onninen@gmail.com</option>
              <option value="ossian.marttala@gmail.com">ossian.marttala@gmail.com</option>
              <option value="pahaasia@gmail.com">pahaasia@gmail.com</option>
              <option value="pasi.kostiainen@gmail.com">pasi.kostiainen@gmail.com</option>
              <option value="pasi.lapinkangas@gmail.com">pasi.lapinkangas@gmail.com</option>
              <option value="pearlyspencer@gmail.com">pearlyspencer@gmail.com</option>
              <option value="pehkohan69@gmail.com">pehkohan69@gmail.com</option>
              <option value="pekkalaine66@gmail.com">pekkalaine66@gmail.com</option>
              <option value="petra.portaala@gmail.com">petra.portaala@gmail.com</option>
              <option value="petteri.eeva@gmail.com">petteri.eeva@gmail.com</option>
              <option value="petteri.vehmanen@gmail.com">petteri.vehmanen@gmail.com</option>
              <option value="petterioja@gmail.com">petterioja@gmail.com</option>
              <option value="preloslab@gmail.com">preloslab@gmail.com</option>
              <option value="rheinsal@gmail.com">rheinsal@gmail.com</option>
              <option value="rikala.sami@gmail.com">rikala.sami@gmail.com</option>
              <option value="riku.p.lehtoranta@gmail.com">riku.p.lehtoranta@gmail.com</option>
              <option value="saarelanristo@gmail.com">saarelanristo@gmail.com</option>
              <option value="sakari.silvola@gmail.com">sakari.silvola@gmail.com</option>
              <option value="sakariusva@gmail.com">sakariusva@gmail.com</option>
              <option value="sami@fonal.com">sami@fonal.com</option>
              <option value="samppaster@gmail.com">samppaster@gmail.com</option>
              <option value="sauli.toiviainen@gmail.com">sauli.toiviainen@gmail.com</option>
              <option value="schildt.saku@gmail.com">schildt.saku@gmail.com</option>
              <option value="sepekyy@gmail.com">sepekyy@gmail.com</option>
              <option value="sorjanen.axa@gmail.com">sorjanen.axa@gmail.com</option>
              <option value="sspukki@gmail.com">sspukki@gmail.com</option>
              <option value="t.k.forss@gmail.com">t.k.forss@gmail.com</option>
              <option value="tapanikalevikangas@gmail.com">tapanikalevikangas@gmail.com</option>
              <option value="tatu.vienamo@gmail.com">tatu.vienamo@gmail.com</option>
              <option value="teemumustajoki@gmail.com">teemumustajoki@gmail.com</option>
              <option value="tero.alanko@kolumbus.fi">tero.alanko@kolumbus.fi</option>
              <option value="tero.uuttana@gmail.com">tero.uuttana@gmail.com</option>
              <option value="tiina.nyrhinen@gmail.com">tiina.nyrhinen@gmail.com</option>
              <option value="timo.rauhaniemi@kolumbus.fi">timo.rauhaniemi@kolumbus.fi</option>
              <option value="tolonen@gmail.com">tolonen@gmail.com</option>
              <option value="tom.blomqvist@edu.hel.fi">tom.blomqvist@edu.hel.fi</option>
              <option value="tommi.backstrom@gmail.com">tommi.backstrom@gmail.com</option>
              <option value="tommi.liljedahl@gmail.com">tommi.liljedahl@gmail.com</option>
              <option value="tonikristianlaaksonen@gmail.com">tonikristianlaaksonen@gmail.com</option>
              <option value="torffi@gmail.com">torffi@gmail.com</option>
              <option value="tteirikko@gmail.com">tteirikko@gmail.com</option>
              <option value="tuomassorto@gmail.com">tuomassorto@gmail.com</option>
              <option value="tuulamviitaniemi@gmail.com">tuulamviitaniemi@gmail.com</option>
              <option value="urs.toimitus@gmail.com">urs.toimitus@gmail.com</option>
              <option value="valimaa.markus@gmail.com">valimaa.markus@gmail.com</option>
              <option value="valtovakosametti@gmail.com">valtovakosametti@gmail.com</option>
              <option value="varpu.jutila@gmail.com">varpu.jutila@gmail.com</option>
              <option value="venlavanamo.asikainen@gmail.com">venlavanamo.asikainen@gmail.com</option>
              <option value="vesa.rantama@gmail.com">vesa.rantama@gmail.com</option>
              <option value="vesa@pinktwins.com">vesa@pinktwins.com</option>
              <option value="vesamatti.pekkola@gmail.com">vesamatti.pekkola@gmail.com</option>
              <option value="vilja.sch@gmail.com">vilja.sch@gmail.com</option>
              <option value="ville.hautaluoma@gmail.com">ville.hautaluoma@gmail.com</option>
              <option value="villevhanninen@gmail.com">villevhanninen@gmail.com</option>
              <option value="visa.roysko@gmail.com">visa.roysko@gmail.com</option>
              <option value="visu.uimonen@gmail.com">visu.uimonen@gmail.com</option>
              <option value="zonjam83@gmail.com">zonjam83@gmail.com</option>
              <option value="zweranda@gmail.com">zweranda@gmail.com</option>
            </select>
          )}
          
          {/* Logout Button */}
          <LogoutButton />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 pb-20">
        {/* Slide Counter */}
        <div className="text-center mb-6">
          <p className="text-white/60 text-sm">
            {currentSlide + 1} of {slides.length}: {slides[currentSlide]?.title}
          </p>
        </div>
        
        {/* Mobile Clickable Areas */}
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Left side clickable area */}
          <div 
            className="absolute left-0 top-0 w-1/2 h-full cursor-pointer"
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          />
          {/* Right side clickable area */}
          <div 
            className="absolute right-0 top-0 w-1/2 h-full cursor-pointer"
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          />
        </div>

        {/* Card Container with Side Navigation */}
        <div className="relative max-w-7xl mx-auto">
                {/* Left Arrow - Fixed Position */}
                <button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 w-12 h-12 bg-white text-black rounded-full hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  ←
                </button>
                
                {/* Right Arrow - Fixed Position */}
                <button
                  onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slides.length - 1}
                  className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 w-12 h-12 bg-white text-black rounded-full hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  →
                </button>
          
          {/* Card Content */}
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full"
          >
            {slides[currentSlide].content}
          </motion.div>
        </div>
      </div>

            {/* Keyboard hint */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
              <div className="text-center">
                <p className="text-white/50 text-xs bg-black/40 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/10">
                  Use ← → arrow keys to navigate
                </p>
        </div>
      </div>
    </div>
  )
}

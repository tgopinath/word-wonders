import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useEffect } from 'react'
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { BadgeToast } from './components/Celebration'
import { NavBar } from './components/NavBar'
import { FindObjectGame } from './games/FindObject'
import { pronunciation } from './services/audio'
import { CategoryGallery } from './screens/CategoryGallery'
import { Explore } from './screens/Explore'
import { Favorites } from './screens/Favorites'
import { Games } from './screens/Games'
import { Home } from './screens/Home'
import { MyLearning } from './screens/MyLearning'
import { Parent } from './screens/Parent'
import { WordDetail } from './screens/WordDetail'
import { ProgressProvider, useProgress } from './state/ProgressProvider'

function Shell() {
  const loc = useLocation()
  const { state, secondsToday } = useProgress()
  const limit = state.settings.dailyLimitMin
  const overLimit = limit > 0 && secondsToday >= limit * 60 && !loc.pathname.startsWith('/parent')

  // Stop speech and scroll to top on navigation (no auto-play on transitions).
  useEffect(() => { pronunciation.stop(); window.scrollTo(0, 0) }, [loc.pathname])

  return (
    <div className="min-h-dvh pb-32">
      <main className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-8">
        <AnimatePresence mode="wait">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <Routes location={loc}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/category/:catId" element={<CategoryGallery />} />
              <Route path="/word/:wordId" element={<WordDetail />} />
              <Route path="/play/find/:lessonId" element={<FindObjectGame />} />
              <Route path="/games" element={<Games />} />
              <Route path="/learning" element={<MyLearning />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/parent" element={<Parent />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <NavBar />
      <BadgeToast />
      {overLimit && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-white p-6 text-center" role="dialog" aria-modal="true" aria-label="Break time">
          <div>
            <p className="text-8xl" aria-hidden>🌙</p>
            <h1 className="mt-4 font-display text-4xl font-bold text-[#2B1F4A]">Time for a break!</h1>
            <p className="mt-2 text-xl text-[#6B5F86]">You learned so much today. See you tomorrow!</p>
            <Link to="/parent" className="mt-6 inline-block font-display font-semibold text-[#5B3CC4] underline">Grown-ups</Link>
          </div>
        </div>
      )}
    </div>
  )
}

function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-7xl" aria-hidden>🗺️</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-[#2B1F4A]">Oops, we got lost!</h1>
      <Link to="/" className="mt-4 inline-block font-display font-semibold text-[#5B3CC4] underline">Go home</Link>
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ProgressProvider>
        <HashRouter>
          <Shell />
        </HashRouter>
      </ProgressProvider>
    </MotionConfig>
  )
}

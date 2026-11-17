import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { sfx } from '../services/sfx'

const ITEMS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/explore', label: 'Explore', icon: '🧭' },
  { to: '/games', label: 'Games', icon: '🎮' },
  { to: '/learning', label: 'My Learning', icon: '📈' },
  { to: '/favorites', label: 'Favorites', icon: '💖' },
  { to: '/parent', label: 'Parents', icon: '🔒' },
]

/** Floating bottom navigation, big touch targets. */
export function NavBar() {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 pointer-events-none">
      <ul className="pointer-events-auto mx-auto flex max-w-3xl justify-between gap-1 rounded-[28px] bg-white/95 p-1.5 shadow-[0_10px_40px_rgba(60,40,120,0.18)] backdrop-blur">
        {ITEMS.map((it) => (
          <li key={it.to} className="flex-1">
            <NavLink to={it.to} end={it.to === '/'} onClick={() => sfx.tap()}
              className={({ isActive }) => `relative flex min-h-14 flex-col items-center justify-center rounded-[22px] px-1 py-1 font-display text-[11px] font-semibold sm:text-sm focus-visible:outline-4 focus-visible:outline-sky-400 ${isActive ? 'text-[#5B3CC4]' : 'text-[#6B5F86]'}`}>
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-[22px] bg-[#EFE8FF]" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                  <span className="relative text-2xl leading-none" aria-hidden>{it.icon}</span>
                  <span className="relative mt-0.5 whitespace-nowrap">{it.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

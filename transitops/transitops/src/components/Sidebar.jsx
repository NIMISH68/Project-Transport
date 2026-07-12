import { NavLink } from 'react-router-dom'
import { LayoutGrid, Truck, Users, Route, Wrench, Fuel, BarChart3 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/vehicles', label: 'Vehicle Registry', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trip Manifest', icon: Route },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/fuel-expenses', label: 'Fuel & Expenses', icon: Fuel },
  { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 }
]

export default function Sidebar({ open, onNavigate }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(
      ref.current.querySelectorAll('.nav-item'),
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.45, stagger: 0.045, ease: 'power2.out', delay: 0.1 }
    )
  }, [])

  return (
    <aside
      ref={ref}
      className={`fixed md:sticky top-0 z-40 h-screen w-64 shrink-0 bg-navy dark:bg-obsidian-surface text-parchment dark:text-ink-dark transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-parchment/15 dark:border-ledger-linedark px-6 py-5">
          <svg width="30" height="30" viewBox="0 0 64 64" className="shrink-0">
            <path d="M32 8 L52 17 V32 C52 44 43.5 53 32 57 C20.5 53 12 44 12 32 V17 Z" fill="none" stroke="#C79A4B" strokeWidth="2" />
            <path d="M22 33 L28.5 39.5 L43 24" fill="none" stroke="#F3EDE1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="font-display text-lg leading-tight tracking-wide">TransitOps</p>
            <p className="text-[10px] font-mono uppercase tracking-widest2 text-brass-soft">Operations Ledger</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-ledger px-3 py-5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `nav-item group mb-1 flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-parchment/10 text-parchment dark:bg-navy-bright/15 dark:text-navy-brighter font-medium border-l-2 border-brass-soft'
                    : 'text-parchment/70 dark:text-ink-darksoft hover:bg-parchment/5 dark:hover:bg-white/5 border-l-2 border-transparent'
                }`
              }
            >
              <Icon size={17} strokeWidth={1.75} />
              <span className="tracking-wide">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-parchment/15 dark:border-ledger-linedark px-6 py-4">
          <p className="text-[10px] font-mono uppercase tracking-widest2 text-parchment/40 dark:text-ink-darksoft/50">
            Est. 2026 · v1.0
          </p>
        </div>
      </div>
    </aside>
  )
}

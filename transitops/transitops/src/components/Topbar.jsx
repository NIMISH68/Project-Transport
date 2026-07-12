import { Menu, Moon, Sun, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Topbar({ onMenuClick, title, subtitle }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b hairline bg-parchment/90 dark:bg-obsidian/90 backdrop-blur px-4 md:px-8 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden rounded-sm p-1.5 text-ink dark:text-ink-dark hover:bg-ink/5 dark:hover:bg-white/5"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl text-ink dark:text-ink-dark">{title}</h1>
          {subtitle && <p className="text-sm text-ink-soft dark:text-ink-darksoft">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label="Toggle dark mode"
          className="relative flex h-8 w-14 items-center rounded-full border hairline bg-parchment-deep dark:bg-obsidian-surface px-1 transition-colors"
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full bg-brass-soft text-obsidian shadow transition-transform duration-300 ${
              dark ? 'translate-x-6' : 'translate-x-0'
            }`}
          >
            {dark ? <Moon size={13} /> : <Sun size={13} />}
          </span>
        </button>

        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-medium text-ink dark:text-ink-dark">{user?.name}</span>
          <span className="text-[11px] font-mono uppercase tracking-widest2 text-brass-deep dark:text-brass-soft">
            {user?.role}
          </span>
        </div>
        <div className="h-9 w-9 shrink-0 rounded-full bg-navy dark:bg-navy-bright text-parchment dark:text-obsidian flex items-center justify-center font-display text-sm">
          {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <button
          onClick={logout}
          aria-label="Sign out"
          className="rounded-sm p-2 text-ink-soft hover:text-oxblood dark:text-ink-darksoft dark:hover:text-oxblood-dark hover:bg-ink/5 dark:hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}

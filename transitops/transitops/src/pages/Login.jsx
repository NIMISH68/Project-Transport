import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Input, Button, Field } from '../components/Field'
import { USERS } from '../data/seed'
import { Moon, Sun, ShieldCheck } from 'lucide-react'

export default function Login() {
  const { login, error } = useAuth()
  const { dark, toggle } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const panelRef = useRef(null)
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(heroRef.current, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.8 })
        .fromTo(
          heroRef.current.querySelectorAll('.reveal'),
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
          '-=0.4'
        )
        .fromTo(panelRef.current, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.8 }, '-=0.6')
    })
    return () => ctx.revert()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    login(email, password)
  }

  const fillDemo = (u) => {
    setEmail(u.email)
    setPassword(u.password)
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-parchment dark:bg-obsidian paper-texture">
      <button
        onClick={toggle}
        className="absolute top-5 right-5 md:hidden z-10 rounded-full border hairline p-2 bg-parchment-soft dark:bg-obsidian-surface"
      >
        {dark ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      {/* Hero side */}
      <div ref={heroRef} className="relative hidden md:flex flex-col justify-between bg-navy dark:bg-obsidian-surface text-parchment px-14 py-12 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 34px)'
        }} />
        <div className="reveal flex items-center gap-3">
          <svg width="34" height="34" viewBox="0 0 64 64">
            <path d="M32 8 L52 17 V32 C52 44 43.5 53 32 57 C20.5 53 12 44 12 32 V17 Z" fill="none" stroke="#C79A4B" strokeWidth="2" />
            <path d="M22 33 L28.5 39.5 L43 24" fill="none" stroke="#F3EDE1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-display text-xl tracking-wide">TransitOps</span>
        </div>

        <div>
          <p className="reveal text-[11px] font-mono uppercase tracking-widest2 text-brass-soft mb-4">
            Established for the discerning fleet
          </p>
          <h1 className="reveal font-display text-5xl leading-[1.1] mb-6">
            The ledger for<br /> serious transport<br /> operations.
          </h1>
          <p className="reveal max-w-sm text-parchment/70 leading-relaxed">
            Vehicles, drivers, dispatch, maintenance and cost — recorded with the
            discipline of a captain's log, and the clarity of a modern instrument.
          </p>
        </div>

        <div className="reveal flex items-center gap-2 text-sm text-parchment/60">
          <ShieldCheck size={16} className="text-brass-soft" />
          Role-based access · Est. 2026
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-12">
        <div ref={panelRef} className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-3 mb-8">
            <svg width="28" height="28" viewBox="0 0 64 64">
              <path d="M32 8 L52 17 V32 C52 44 43.5 53 32 57 C20.5 53 12 44 12 32 V17 Z" fill="none" stroke="#A9863A" strokeWidth="2" />
              <path d="M22 33 L28.5 39.5 L43 24" fill="none" stroke="#1B3358" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-parchment" />
            </svg>
            <span className="font-display text-xl text-ink dark:text-ink-dark">TransitOps</span>
          </div>

          <h2 className="font-display text-3xl text-ink dark:text-ink-dark mb-1">Sign in</h2>
          <p className="text-sm text-ink-soft dark:text-ink-darksoft mb-8">
            Enter your credentials to access the operations ledger.
          </p>

          <form onSubmit={handleSubmit}>
            <Field label="Email">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@transitops.io"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {error && (
              <p className="mb-4 rounded-sm border border-oxblood/30 bg-oxblood/5 px-3 py-2 text-sm text-oxblood dark:text-oxblood-dark">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full mt-1">Enter the Ledger</Button>
          </form>

          <div className="mt-8 border-t hairline pt-5">
            <p className="text-[11px] font-mono uppercase tracking-widest2 text-ink-soft dark:text-ink-darksoft mb-3">
              Demo personas — click to autofill
            </p>
            <div className="grid grid-cols-2 gap-2">
              {USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => fillDemo(u)}
                  type="button"
                  className="text-left rounded-sm border hairline px-3 py-2 hover:border-navy dark:hover:border-navy-bright transition-colors"
                >
                  <p className="text-xs font-medium text-ink dark:text-ink-dark">{u.name}</p>
                  <p className="text-[10px] text-ink-soft dark:text-ink-darksoft">{u.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

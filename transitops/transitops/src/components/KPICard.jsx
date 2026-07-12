import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function KPICard({ label, value, suffix = '', accent = 'navy', hint, index = 0 }) {
  const numRef = useRef(null)
  const cardRef = useRef(null)
  const counter = useRef({ val: 0 })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, delay: index * 0.07, ease: 'power3.out' }
      )
      gsap.to(counter.current, {
        val: value,
        duration: 1.1,
        delay: 0.15 + index * 0.07,
        ease: 'power2.out',
        onUpdate: () => {
          if (numRef.current) {
            const v = counter.current.val
            numRef.current.textContent = (Number.isInteger(value) ? Math.round(v) : v.toFixed(1)) + suffix
          }
        },
      })
    }, cardRef)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const accentBar = {
    navy: 'bg-navy dark:bg-navy-bright',
    brass: 'bg-brass dark:bg-brass-soft',
    racing: 'bg-racing dark:bg-racing-dark',
    oxblood: 'bg-oxblood dark:bg-oxblood-dark',
  }[accent]

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-sm border hairline bg-parchment-soft dark:bg-obsidian-surface shadow-ledger dark:shadow-ledgerDark px-5 py-4"
    >
      <div className={`absolute left-0 top-0 h-full w-[3px] ${accentBar}`} />
      <p className="text-[11px] font-mono uppercase tracking-widest2 text-ink-soft dark:text-ink-darksoft">{label}</p>
      <p ref={numRef} className="mt-2 font-display text-3xl font-semibold text-ink dark:text-ink-dark tabular">
        0{suffix}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-soft dark:text-ink-darksoft italic">{hint}</p>}
    </div>
  )
}

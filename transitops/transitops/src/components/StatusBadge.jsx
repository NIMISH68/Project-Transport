import { STATUS_TONES } from '../utils/businessRules'

const TONE_CLASSES = {
  racing: 'bg-racing/10 text-racing dark:bg-racing-dark/15 dark:text-racing-dark border-racing/30 dark:border-racing-dark/30',
  navy: 'bg-navy/10 text-navy dark:bg-navy-bright/15 dark:text-navy-brighter border-navy/25 dark:border-navy-bright/30',
  brass: 'bg-brass/10 text-brass-deep dark:bg-brass-soft/15 dark:text-brass-soft border-brass/30 dark:border-brass-soft/30',
  oxblood: 'bg-oxblood/10 text-oxblood dark:bg-oxblood-dark/15 dark:text-oxblood-dark border-oxblood/30 dark:border-oxblood-dark/30',
  ink: 'bg-ink/5 text-ink-soft dark:bg-ink-dark/10 dark:text-ink-darksoft border-ink/15 dark:border-ink-darksoft/20',
}

export default function StatusBadge({ status, className = '' }) {
  const tone = STATUS_TONES[status] || 'ink'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-widest font-mono ${TONE_CLASSES[tone]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

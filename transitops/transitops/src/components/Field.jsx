export function Field({ label, children, error, hint }) {
  return (
    <label className="block mb-4">
      <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest2 text-ink-soft dark:text-ink-darksoft">
        {label}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink-soft dark:text-ink-darksoft">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-oxblood dark:text-oxblood-dark">{error}</span>}
    </label>
  )
}

const baseInput =
  'w-full rounded-sm border hairline bg-parchment dark:bg-obsidian-surface px-3 py-2 text-sm text-ink dark:text-ink-dark placeholder:text-ink-soft/50 dark:placeholder:text-ink-darksoft/40 focus:outline-none focus:ring-1 focus:ring-navy dark:focus:ring-navy-bright focus:border-navy dark:focus:border-navy-bright transition-colors'

export function Input(props) {
  return <input {...props} className={`${baseInput} ${props.className || ''}`} />
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${baseInput} ${props.className || ''}`}>
      {children}
    </select>
  )
}

export function Textarea(props) {
  return <textarea {...props} className={`${baseInput} ${props.className || ''}`} />
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-navy text-parchment hover:bg-navy-light dark:bg-navy-bright dark:text-obsidian dark:hover:bg-navy-brighter',
    ghost: 'border hairline text-ink dark:text-ink-dark hover:bg-ink/5 dark:hover:bg-white/5',
    danger: 'bg-oxblood text-parchment hover:bg-oxblood-dark',
  }
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-medium tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

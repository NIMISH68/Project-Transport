import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, subtitle, children, wide = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-ink/40 dark:bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[88vh] overflow-y-auto scrollbar-ledger rounded-sm border hairline bg-parchment-soft dark:bg-obsidian-raised shadow-ledger dark:shadow-ledgerDark`}
          >
            <div className="sticky top-0 flex items-start justify-between border-b hairline bg-parchment-soft dark:bg-obsidian-raised px-6 py-4">
              <div>
                <h3 className="font-display text-xl text-ink dark:text-ink-dark">{title}</h3>
                {subtitle && <p className="mt-0.5 text-sm text-ink-soft dark:text-ink-darksoft">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-ink-soft hover:bg-ink/5 dark:text-ink-darksoft dark:hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

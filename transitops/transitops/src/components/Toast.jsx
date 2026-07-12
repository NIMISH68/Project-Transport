import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useData } from '../context/DataContext'
import { CheckCircle2 } from 'lucide-react'

const TONE = {
  racing: 'border-racing/40 text-racing dark:text-racing-dark',
  navy: 'border-navy/40 text-navy dark:text-navy-brighter',
  brass: 'border-brass/40 text-brass-deep dark:text-brass-soft',
  oxblood: 'border-oxblood/40 text-oxblood dark:text-oxblood-dark',
}

export default function Toast() {
  const { toast, setToast } = useData()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast, setToast])

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className={`flex items-center gap-2.5 rounded-sm border bg-parchment-soft dark:bg-obsidian-raised shadow-ledger dark:shadow-ledgerDark px-4 py-3 text-sm ${TONE[toast.tone] || TONE.navy}`}
          >
            <CheckCircle2 size={16} />
            <span className="text-ink dark:text-ink-dark">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

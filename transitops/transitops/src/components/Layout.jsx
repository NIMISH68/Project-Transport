import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Toast from './Toast'

export default function Layout({ title, subtitle, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-parchment dark:bg-obsidian paper-texture">
      <Sidebar open={open} onNavigate={() => setOpen(false)} />
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="flex-1 min-w-0">
        <Topbar onMenuClick={() => setOpen(true)} title={title} subtitle={subtitle} />
        <motion.main
          key={title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="px-4 md:px-8 py-6 pb-16"
        >
          {children}
        </motion.main>
      </div>
      <Toast />
    </div>
  )
}

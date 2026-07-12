import { useMemo, useState } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DataTable({ columns, rows, rowKey = 'id', emptyLabel = 'No records found.' }) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  const sorted = useMemo(() => {
    if (!sort.key) return rows
    const col = columns.find((c) => c.key === sort.key)
    const accessor = col?.sortValue || ((r) => r[sort.key])
    return [...rows].sort((a, b) => {
      const av = accessor(a)
      const bv = accessor(b)
      if (av === bv) return 0
      const result = av > bv ? 1 : -1
      return sort.dir === 'asc' ? result : -result
    })
  }, [rows, sort, columns])

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' }
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  return (
    <div className="overflow-x-auto rounded-sm border hairline bg-parchment-soft dark:bg-obsidian-surface shadow-ledger dark:shadow-ledgerDark scrollbar-ledger">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b hairline bg-parchment-deep/50 dark:bg-obsidian-raised/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-[11px] font-mono uppercase tracking-widest2 text-ink-soft dark:text-ink-darksoft select-none"
              >
                {col.sortable ? (
                  <button
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-ink dark:hover:text-ink-dark transition-colors"
                  >
                    {col.label}
                    {sort.key === col.key ? (
                      sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-ink-soft dark:text-ink-darksoft italic">
                {emptyLabel}
              </td>
            </tr>
          )}
          {sorted.map((row, i) => (
            <motion.tr
              key={row[rowKey]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.4) }}
              className="border-b hairline last:border-0 hover:bg-navy/[0.03] dark:hover:bg-navy-bright/[0.06] transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-middle text-ink dark:text-ink-dark">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

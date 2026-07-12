import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import Layout from '../components/Layout'
import DataTable from '../components/DataTable'
import { computeOperationalCost, computeFuelEfficiency, computeROI, computeFleetUtilization } from '../utils/businessRules'
import { Button } from '../components/Field'
import { Download } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function Reports() {
  const { vehicles, trips, fuelLogs, maintenance, expenses, tripRevenue } = useData()

  const rows = useMemo(() => {
    return vehicles.map((v) => {
      const cost = computeOperationalCost(v.id, fuelLogs, maintenance, expenses)
      const efficiency = computeFuelEfficiency(v.id, trips, fuelLogs)
      const revenue = trips
        .filter((t) => t.vehicleId === v.id && t.status === 'Completed')
        .reduce((s, t) => s + (tripRevenue[t.id] || 0), 0)
      const roi = computeROI(v, revenue, fuelLogs, maintenance, expenses)
      return { vehicle: v, ...cost, efficiency, revenue, roi }
    })
  }, [vehicles, fuelLogs, maintenance, expenses, trips, tripRevenue])

  const utilization = computeFleetUtilization(vehicles)

  const utilizationTrend = useMemo(() => {
    // Illustrative trend built from current data (would be historical in production)
    const base = utilization
    return Array.from({ length: 6 }).map((_, i) => ({
      week: `W${i + 1}`,
      utilization: Math.max(0, Math.min(100, base + (Math.sin(i * 1.3) * 8 - (5 - i)))),
    }))
  }, [utilization])

  const columns = [
    { key: 'reg', label: 'Vehicle', render: (r) => <span className="font-mono text-sm">{r.vehicle.regNo}</span> },
    { key: 'efficiency', label: 'Fuel Efficiency', sortable: true, sortValue: (r) => r.efficiency ?? -1, render: (r) => r.efficiency ? <span className="tabular">{r.efficiency.toFixed(2)} km/L</span> : <span className="text-ink-soft dark:text-ink-darksoft">—</span> },
    { key: 'total', label: 'Operational Cost', sortable: true, render: (r) => <span className="tabular">₹{r.total.toLocaleString()}</span> },
    { key: 'revenue', label: 'Revenue', sortable: true, render: (r) => r.revenue ? <span className="tabular">₹{r.revenue.toLocaleString()}</span> : <span className="text-ink-soft dark:text-ink-darksoft">—</span> },
    { key: 'roi', label: 'Vehicle ROI', sortable: true, sortValue: (r) => r.roi ?? -999, render: (r) => r.roi !== null ? (
      <span className={`tabular font-medium ${r.roi >= 0 ? 'text-racing dark:text-racing-dark' : 'text-oxblood dark:text-oxblood-dark'}`}>
        {(r.roi * 100).toFixed(1)}%
      </span>
    ) : <span className="text-ink-soft dark:text-ink-darksoft">—</span> },
  ]

  const exportCSV = () => {
    const header = ['Registration', 'Fuel Efficiency (km/L)', 'Operational Cost', 'Revenue', 'ROI (%)']
    const lines = rows.map((r) => [
      r.vehicle.regNo,
      r.efficiency ? r.efficiency.toFixed(2) : '',
      r.total,
      r.revenue,
      r.roi !== null ? (r.roi * 100).toFixed(1) : '',
    ])
    const csv = [header, ...lines].map((l) => l.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transitops-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout title="Reports & Analytics" subtitle="Fleet-wide fuel efficiency, cost, utilization and return on investment.">
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <SummaryCard label="Fleet Utilization" value={`${utilization.toFixed(1)}%`} tone="navy" />
        <SummaryCard
          label="Total Operational Cost"
          value={`₹${rows.reduce((s, r) => s + r.total, 0).toLocaleString()}`}
          tone="brass"
        />
        <SummaryCard
          label="Fleet-wide Avg. Efficiency"
          value={
            (() => {
              const vals = rows.map((r) => r.efficiency).filter(Boolean)
              if (!vals.length) return '—'
              return `${(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2)} km/L`
            })()
          }
          tone="racing"
        />
      </div>

      <div className="rounded-sm border hairline bg-parchment-soft dark:bg-obsidian-surface shadow-ledger dark:shadow-ledgerDark p-5 mb-8">
        <h3 className="font-display text-lg text-ink dark:text-ink-dark mb-1">Utilization Trend</h3>
        <p className="text-xs text-ink-soft dark:text-ink-darksoft mb-4">Six-week illustrative trend, current fleet composition</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={utilizationTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D8CBB0" vertical={false} />
            <XAxis dataKey="week" tick={{ fontFamily: 'EB Garamond', fontSize: 12, fill: '#4B5768' }} axisLine={{ stroke: '#D8CBB0' }} tickLine={false} />
            <YAxis unit="%" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: '#4B5768' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontFamily: 'EB Garamond', fontSize: 13, borderRadius: 2 }} formatter={(v) => `${v.toFixed(1)}%`} />
            <Line type="monotone" dataKey="utilization" stroke="#1B3358" strokeWidth={2.5} dot={{ r: 3, fill: '#A9863A' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4 flex justify-end">
        <Button variant="ghost" onClick={exportCSV}><Download size={15} /> Export CSV</Button>
      </div>

      <DataTable columns={columns} rows={rows} rowKey="reg" emptyLabel="No report data available." />

      <p className="mt-4 text-xs text-ink-soft dark:text-ink-darksoft italic">
        ROI = (Revenue − (Maintenance + Fuel)) ÷ Acquisition Cost. Revenue figures are illustrative,
        drawn from completed-trip billing where recorded.
      </p>
    </Layout>
  )
}

function SummaryCard({ label, value, tone }) {
  const toneClass = {
    navy: 'text-navy dark:text-navy-brighter',
    brass: 'text-brass-deep dark:text-brass-soft',
    racing: 'text-racing dark:text-racing-dark',
  }[tone]
  return (
    <div className="rounded-sm border hairline bg-parchment-soft dark:bg-obsidian-surface shadow-ledger dark:shadow-ledgerDark p-5">
      <p className="text-[11px] font-mono uppercase tracking-widest2 text-ink-soft dark:text-ink-darksoft mb-2">{label}</p>
      <p className={`font-display text-3xl font-semibold tabular ${toneClass}`}>{value}</p>
    </div>
  )
}

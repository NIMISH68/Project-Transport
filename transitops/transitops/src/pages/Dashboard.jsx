import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import KPICard from '../components/KPICard'
import { Select } from '../components/Field'
import StatusBadge from '../components/StatusBadge'
import { computeFleetUtilization } from '../utils/businessRules'
import { VEHICLE_TYPES, VEHICLE_STATUS, REGIONS } from '../data/seed'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const PIE_COLORS = ['#3F6E52', '#1B3358', '#A9863A', '#8B3A3A']

export default function Dashboard() {
  const { user } = useAuth()
  const { vehicles, trips, drivers } = useData()
  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')
  const [region, setRegion] = useState('All')

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(
      (v) =>
        (type === 'All' || v.type === type) &&
        (status === 'All' || v.status === status) &&
        (region === 'All' || v.region === region)
    )
  }, [vehicles, type, status, region])

  const kpis = useMemo(() => {
    const active = filteredVehicles.filter((v) => v.status !== 'Retired').length
    const available = filteredVehicles.filter((v) => v.status === 'Available').length
    const inShop = filteredVehicles.filter((v) => v.status === 'In Shop').length
    const activeTrips = trips.filter((t) => t.status === 'Dispatched').length
    const pendingTrips = trips.filter((t) => t.status === 'Draft').length
    const driversOnDuty = drivers.filter((d) => d.status === 'On Trip' || d.status === 'Available').length
    const utilization = computeFleetUtilization(filteredVehicles)
    return { active, available, inShop, activeTrips, pendingTrips, driversOnDuty, utilization }
  }, [filteredVehicles, trips, drivers])

  const statusBreakdown = useMemo(() => {
    return VEHICLE_STATUS.map((s) => ({
      name: s,
      value: filteredVehicles.filter((v) => v.status === s).length,
    })).filter((d) => d.value > 0)
  }, [filteredVehicles])

  const tripsByStatus = useMemo(() => {
    const statuses = ['Draft', 'Dispatched', 'Completed', 'Cancelled']
    return statuses.map((s) => ({ name: s, count: trips.filter((t) => t.status === s).length }))
  }, [trips])

  const recentTrips = trips.slice(0, 5)

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.name?.split(' ')[0]} — here is today's operational picture.`}>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-end">
        <FilterField label="Vehicle Type" value={type} onChange={setType} options={['All', ...VEHICLE_TYPES]} />
        <FilterField label="Status" value={status} onChange={setStatus} options={['All', ...VEHICLE_STATUS]} />
        <FilterField label="Region" value={region} onChange={setRegion} options={['All', ...REGIONS]} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KPICard index={0} label="Active Vehicles" value={kpis.active} accent="navy" />
        <KPICard index={1} label="Available Vehicles" value={kpis.available} accent="racing" />
        <KPICard index={2} label="In Maintenance" value={kpis.inShop} accent="brass" />
        <KPICard index={3} label="Active Trips" value={kpis.activeTrips} accent="navy" />
        <KPICard index={4} label="Pending Trips" value={kpis.pendingTrips} accent="brass" />
        <KPICard index={5} label="Drivers On Duty" value={kpis.driversOnDuty} accent="racing" />
        <KPICard index={6} label="Fleet Utilization" value={kpis.utilization} suffix="%" accent="navy" hint="On Trip ÷ active fleet" />
        <KPICard index={7} label="Total Fleet Size" value={vehicles.length} accent="ink" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-sm border hairline bg-parchment-soft dark:bg-obsidian-surface shadow-ledger dark:shadow-ledgerDark p-5">
          <h3 className="font-display text-lg text-ink dark:text-ink-dark mb-1">Fleet by Status</h3>
          <p className="text-xs text-ink-soft dark:text-ink-darksoft mb-4">Filtered fleet composition</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                {statusBreakdown.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: 'EB Garamond', fontSize: 13, borderRadius: 2 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusBreakdown.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-ink-soft dark:text-ink-darksoft">
                <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 rounded-sm border hairline bg-parchment-soft dark:bg-obsidian-surface shadow-ledger dark:shadow-ledgerDark p-5">
          <h3 className="font-display text-lg text-ink dark:text-ink-dark mb-1">Trips by Stage</h3>
          <p className="text-xs text-ink-soft dark:text-ink-darksoft mb-4">Entire manifest, all regions</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tripsByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8CBB0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontFamily: 'EB Garamond', fontSize: 12, fill: '#4B5768' }} axisLine={{ stroke: '#D8CBB0' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: '#4B5768' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: 'EB Garamond', fontSize: 13, borderRadius: 2 }} />
              <Bar dataKey="count" fill="#1B3358" radius={[3, 3, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-sm border hairline bg-parchment-soft dark:bg-obsidian-surface shadow-ledger dark:shadow-ledgerDark p-5">
        <h3 className="font-display text-lg text-ink dark:text-ink-dark mb-4">Recent Entries</h3>
        <div className="divide-y hairline">
          {recentTrips.map((t) => {
            const v = vehicles.find((x) => x.id === t.vehicleId)
            const d = drivers.find((x) => x.id === t.driverId)
            return (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm font-medium text-ink dark:text-ink-dark">{t.source} → {t.destination}</p>
                  <p className="text-xs text-ink-soft dark:text-ink-darksoft font-mono">{v?.regNo} · {d?.name} · {t.createdAt}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

function FilterField({ label, value, onChange, options }) {
  return (
    <div>
      <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest2 text-ink-soft dark:text-ink-darksoft">
        {label}
      </span>
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="min-w-[160px]">
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </Select>
    </div>
  )
}

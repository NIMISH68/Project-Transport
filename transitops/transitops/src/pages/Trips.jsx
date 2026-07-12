import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { Field, Input, Select, Button, Textarea } from '../components/Field'
import { TRIP_STATUS } from '../data/seed'
import { can } from '../utils/permissions'
import { selectableVehicles, selectableDrivers } from '../utils/businessRules'
import { Plus, Send, CheckCircle2, XCircle, Route } from 'lucide-react'

const empty = { source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', distance: '' }

export default function Trips() {
  const { trips, vehicles, drivers, createTrip, dispatchTrip, completeTrip, cancelTrip } = useData()
  const { user } = useAuth()
  const allowed = can(user.role, 'manage_trips')

  const [createOpen, setCreateOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(null)
  const [form, setForm] = useState(empty)
  const [err, setErr] = useState('')
  const [completeForm, setCompleteForm] = useState({ finalOdometer: '', fuelConsumed: '' })
  const [statusFilter, setStatusFilter] = useState('All')

  const availableVehicles = selectableVehicles(vehicles)
  const availableDrivers = selectableDrivers(drivers)

  const rows = useMemo(() => trips.filter((t) => statusFilter === 'All' || t.status === statusFilter), [trips, statusFilter])

  const submitTrip = (e) => {
    e.preventDefault()
    const vehicle = vehicles.find((v) => v.id === form.vehicleId)
    if (vehicle && Number(form.cargoWeight) > vehicle.maxLoad) {
      setErr(`Cargo weight exceeds ${vehicle.regNo}'s max load of ${vehicle.maxLoad}kg.`)
      return
    }
    createTrip({ ...form, cargoWeight: Number(form.cargoWeight), distance: Number(form.distance) })
    setForm(empty)
    setErr('')
    setCreateOpen(false)
  }

  const handleDispatch = (tripId) => {
    const res = dispatchTrip(tripId)
    if (!res.ok) alert(res.error)
  }

  const handleComplete = (e) => {
    e.preventDefault()
    completeTrip(completeOpen, {
      finalOdometer: Number(completeForm.finalOdometer),
      fuelConsumed: Number(completeForm.fuelConsumed),
    })
    setCompleteForm({ finalOdometer: '', fuelConsumed: '' })
    setCompleteOpen(null)
  }

  const columns = [
    { key: 'route', label: 'Route', render: (r) => <span>{r.source} → {r.destination}</span> },
    { key: 'vehicleId', label: 'Vehicle', render: (r) => <span className="font-mono text-sm">{vehicles.find((v) => v.id === r.vehicleId)?.regNo || '—'}</span> },
    { key: 'driverId', label: 'Driver', render: (r) => drivers.find((d) => d.id === r.driverId)?.name || '—' },
    { key: 'cargoWeight', label: 'Cargo', sortable: true, render: (r) => <span className="tabular">{r.cargoWeight.toLocaleString()} kg</span> },
    { key: 'distance', label: 'Distance', sortable: true, render: (r) => <span className="tabular">{r.distance} km</span> },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    ...(allowed
      ? [{
          key: 'actions',
          label: 'Actions',
          render: (r) => (
            <div className="flex items-center gap-1.5">
              {r.status === 'Draft' && (
                <IconBtn title="Dispatch" onClick={() => handleDispatch(r.id)} icon={Send} tone="navy" />
              )}
              {r.status === 'Dispatched' && (
                <IconBtn title="Complete" onClick={() => setCompleteOpen(r.id)} icon={CheckCircle2} tone="racing" />
              )}
              {(r.status === 'Draft' || r.status === 'Dispatched') && (
                <IconBtn title="Cancel" onClick={() => cancelTrip(r.id)} icon={XCircle} tone="oxblood" />
              )}
            </div>
          ),
        }]
      : []),
  ]

  return (
    <Layout title="Trip Manifest" subtitle="Draft, dispatch and close out trips across the fleet.">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest2 text-ink-soft dark:text-ink-darksoft">Status</span>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {['All', ...TRIP_STATUS].map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
        {allowed && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> New Trip
          </Button>
        )}
      </div>

      <DataTable columns={columns} rows={rows} emptyLabel="No trips in this stage." />

      {/* Create Trip Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Trip" subtitle="Only available vehicles & compliant drivers may be selected.">
        <form onSubmit={submitTrip}>
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Source">
              <Input required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            </Field>
            <Field label="Destination">
              <Input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            </Field>
            <Field label="Vehicle" hint={`${availableVehicles.length} available`}>
              <Select required value={form.vehicleId} onChange={(e) => { setForm({ ...form, vehicleId: e.target.value }); setErr('') }}>
                <option value="">Select vehicle…</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.regNo} — {v.name} (max {v.maxLoad}kg)</option>
                ))}
              </Select>
            </Field>
            <Field label="Driver" hint={`${availableDrivers.length} eligible`}>
              <Select required value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                <option value="">Select driver…</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} — {d.category}</option>
                ))}
              </Select>
            </Field>
            <Field label="Cargo Weight (kg)" error={err}>
              <Input required type="number" min="1" value={form.cargoWeight} onChange={(e) => { setForm({ ...form, cargoWeight: e.target.value }); setErr('') }} />
            </Field>
            <Field label="Planned Distance (km)">
              <Input required type="number" min="1" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit"><Route size={15} /> Save as Draft</Button>
          </div>
        </form>
      </Modal>

      {/* Complete Trip Modal */}
      <Modal open={!!completeOpen} onClose={() => setCompleteOpen(null)} title="Complete Trip" subtitle="Record closing odometer and fuel consumed.">
        <form onSubmit={handleComplete}>
          <Field label="Final Odometer (km)">
            <Input required type="number" min="0" value={completeForm.finalOdometer} onChange={(e) => setCompleteForm({ ...completeForm, finalOdometer: e.target.value })} />
          </Field>
          <Field label="Fuel Consumed (liters)">
            <Input required type="number" min="0" step="0.1" value={completeForm.fuelConsumed} onChange={(e) => setCompleteForm({ ...completeForm, fuelConsumed: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setCompleteOpen(null)}>Cancel</Button>
            <Button type="submit">Mark Completed</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

function IconBtn({ icon: Icon, onClick, title, tone }) {
  const toneClass = {
    navy: 'hover:text-navy dark:hover:text-navy-brighter',
    racing: 'hover:text-racing dark:hover:text-racing-dark',
    oxblood: 'hover:text-oxblood dark:hover:text-oxblood-dark',
  }[tone]
  return (
    <button
      title={title}
      onClick={onClick}
      className={`rounded-sm p-1.5 text-ink-soft dark:text-ink-darksoft hover:bg-ink/5 dark:hover:bg-white/5 transition-colors ${toneClass}`}
    >
      <Icon size={16} />
    </button>
  )
}

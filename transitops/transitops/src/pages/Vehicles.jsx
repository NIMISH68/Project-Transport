import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { Field, Input, Select, Button } from '../components/Field'
import { VEHICLE_TYPES, VEHICLE_STATUS, REGIONS } from '../data/seed'
import { can } from '../utils/permissions'
import { Plus, Search, Archive } from 'lucide-react'

const empty = { regNo: '', name: '', type: VEHICLE_TYPES[0], maxLoad: '', odometer: '', cost: '', region: REGIONS[0], acquired: '' }

export default function Vehicles() {
  const { vehicles, addVehicle, retireVehicle } = useData()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [err, setErr] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const allowed = can(user.role, 'manage_vehicles')

  const rows = useMemo(() => {
    return vehicles.filter(
      (v) =>
        (statusFilter === 'All' || v.status === statusFilter) &&
        (v.regNo.toLowerCase().includes(query.toLowerCase()) || v.name.toLowerCase().includes(query.toLowerCase()))
    )
  }, [vehicles, query, statusFilter])

  const submit = (e) => {
    e.preventDefault()
    const res = addVehicle({
      ...form,
      maxLoad: Number(form.maxLoad),
      odometer: Number(form.odometer || 0),
      cost: Number(form.cost),
    })
    if (!res.ok) { setErr(res.error); return }
    setForm(empty)
    setErr('')
    setOpen(false)
  }

  const columns = [
    { key: 'regNo', label: 'Reg. No.', sortable: true, render: (r) => <span className="font-mono text-sm">{r.regNo}</span> },
    { key: 'name', label: 'Model', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'maxLoad', label: 'Max Load', sortable: true, render: (r) => <span className="tabular">{r.maxLoad.toLocaleString()} kg</span> },
    { key: 'odometer', label: 'Odometer', sortable: true, render: (r) => <span className="tabular">{r.odometer.toLocaleString()} km</span> },
    { key: 'cost', label: 'Acquisition Cost', sortable: true, render: (r) => <span className="tabular">₹{r.cost.toLocaleString()}</span> },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    ...(allowed
      ? [{
          key: 'actions',
          label: '',
          render: (r) =>
            r.status !== 'Retired' && (
              <button
                onClick={() => retireVehicle(r.id)}
                title="Retire vehicle"
                className="rounded-sm p-1.5 text-ink-soft hover:text-oxblood dark:text-ink-darksoft dark:hover:text-oxblood-dark hover:bg-ink/5 dark:hover:bg-white/5 transition-colors"
              >
                <Archive size={15} />
              </button>
            ),
        }]
      : []),
  ]

  return (
    <Layout title="Vehicle Registry" subtitle="Master record of every asset in the fleet.">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest2 text-ink-soft dark:text-ink-darksoft">Search</span>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-darksoft" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Reg. no. or model" className="pl-8 w-56" />
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest2 text-ink-soft dark:text-ink-darksoft">Status</span>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {['All', ...VEHICLE_STATUS].map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
        </div>
        {allowed && (
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Register Vehicle
          </Button>
        )}
      </div>

      <DataTable columns={columns} rows={rows} emptyLabel="No vehicles match this filter." />

      <Modal open={open} onClose={() => setOpen(false)} title="Register Vehicle" subtitle="Add a new asset to the master registry.">
        <form onSubmit={submit}>
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Registration Number" error={err}>
              <Input required value={form.regNo} onChange={(e) => { setForm({ ...form, regNo: e.target.value }); setErr('') }} placeholder="VAN-05" />
            </Field>
            <Field label="Model / Name">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ford Transit 350" />
            </Field>
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Region">
              <Select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Max Load Capacity (kg)">
              <Input required type="number" min="1" value={form.maxLoad} onChange={(e) => setForm({ ...form, maxLoad: e.target.value })} />
            </Field>
            <Field label="Current Odometer (km)">
              <Input type="number" min="0" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
            </Field>
            <Field label="Acquisition Cost (₹)">
              <Input required type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </Field>
            <Field label="Acquisition Date">
              <Input type="date" value={form.acquired} onChange={(e) => setForm({ ...form, acquired: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Register</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

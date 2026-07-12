import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { Field, Input, Select, Button, Textarea } from '../components/Field'
import { can } from '../utils/permissions'
import { Plus, Lock } from 'lucide-react'

const TYPES = ['Oil Change', 'Brake Service', 'Tire Replacement', 'Engine Overhaul', 'Electrical Repair', 'Decommission Inspection', 'Other']
const empty = { vehicleId: '', type: TYPES[0], description: '', cost: '' }

export default function Maintenance() {
  const { maintenance, vehicles, openMaintenance, closeMaintenance } = useData()
  const { user } = useAuth()
  const allowed = can(user.role, 'manage_maintenance')

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [err, setErr] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Vehicles that can enter the shop: not already In Shop, not On Trip, not Retired
  const eligibleVehicles = vehicles.filter((v) => v.status === 'Available')

  const rows = useMemo(
    () => maintenance.filter((m) => statusFilter === 'All' || m.status === statusFilter),
    [maintenance, statusFilter]
  )

  const submit = (e) => {
    e.preventDefault()
    const res = openMaintenance({ ...form, cost: Number(form.cost) })
    if (!res.ok) { setErr(res.error); return }
    setForm(empty)
    setErr('')
    setOpen(false)
  }

  const columns = [
    { key: 'vehicleId', label: 'Vehicle', render: (r) => <span className="font-mono text-sm">{vehicles.find((v) => v.id === r.vehicleId)?.regNo || '—'}</span> },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'description', label: 'Description', render: (r) => <span className="text-ink-soft dark:text-ink-darksoft">{r.description}</span> },
    { key: 'cost', label: 'Cost', sortable: true, render: (r) => <span className="tabular">₹{r.cost.toLocaleString()}</span> },
    { key: 'openedAt', label: 'Opened', sortable: true },
    { key: 'closedAt', label: 'Closed', sortable: true, render: (r) => r.closedAt || '—' },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    ...(allowed
      ? [{
          key: 'actions',
          label: '',
          render: (r) =>
            r.status === 'Open' && (
              <Button variant="ghost" onClick={() => closeMaintenance(r.id)} className="!px-3 !py-1 text-xs">
                Close & Release
              </Button>
            ),
        }]
      : []),
  ]

  return (
    <Layout title="Maintenance" subtitle="Opening a record moves a vehicle to In Shop and removes it from dispatch.">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest2 text-ink-soft dark:text-ink-darksoft">Status</span>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {['All', 'Open', 'Closed'].map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
        {allowed && (
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> New Maintenance Record
          </Button>
        )}
      </div>

      <DataTable columns={columns} rows={rows} emptyLabel="No maintenance records in this stage." />

      <Modal open={open} onClose={() => setOpen(false)} title="New Maintenance Record" subtitle="Vehicle status will automatically switch to In Shop.">
        <form onSubmit={submit}>
          <Field label="Vehicle" hint={`${eligibleVehicles.length} eligible (must be Available)`} error={err}>
            <Select required value={form.vehicleId} onChange={(e) => { setForm({ ...form, vehicleId: e.target.value }); setErr('') }}>
              <option value="">Select vehicle…</option>
              {eligibleVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.regNo} — {v.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Maintenance Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Estimated Cost (₹)">
            <Input required type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit"><Lock size={14} /> Open Record</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

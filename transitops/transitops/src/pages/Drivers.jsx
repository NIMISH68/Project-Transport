import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { Field, Input, Select, Button } from '../components/Field'
import { DRIVER_STATUS, REGIONS } from '../data/seed'
import { can } from '../utils/permissions'
import { isLicenseExpired } from '../utils/businessRules'
import { Plus, Search, AlertTriangle } from 'lucide-react'

const CATEGORIES = ['Light Goods', 'Heavy Goods', 'Refrigerated']
const empty = { name: '', licenseNo: '', category: CATEGORIES[0], expiry: '', contact: '', safetyScore: 80, region: REGIONS[0] }

export default function Drivers() {
  const { drivers, addDriver, updateDriver } = useData()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const allowed = can(user.role, 'manage_drivers')

  const rows = useMemo(() => {
    return drivers.filter(
      (d) =>
        (statusFilter === 'All' || d.status === statusFilter) &&
        (d.name.toLowerCase().includes(query.toLowerCase()) || d.licenseNo.toLowerCase().includes(query.toLowerCase()))
    )
  }, [drivers, query, statusFilter])

  const submit = (e) => {
    e.preventDefault()
    addDriver({ ...form, safetyScore: Number(form.safetyScore) })
    setForm(empty)
    setOpen(false)
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'licenseNo', label: 'License No.', sortable: true, render: (r) => <span className="font-mono text-sm">{r.licenseNo}</span> },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'expiry',
      label: 'License Expiry',
      sortable: true,
      render: (r) => {
        const expired = isLicenseExpired(r)
        return (
          <span className={`tabular flex items-center gap-1.5 ${expired ? 'text-oxblood dark:text-oxblood-dark font-medium' : ''}`}>
            {r.expiry}
            {expired && <AlertTriangle size={13} />}
          </span>
        )
      },
    },
    { key: 'contact', label: 'Contact' },
    {
      key: 'safetyScore',
      label: 'Safety Score',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-ink/10 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full ${r.safetyScore >= 85 ? 'bg-racing dark:bg-racing-dark' : r.safetyScore >= 70 ? 'bg-brass dark:bg-brass-soft' : 'bg-oxblood dark:bg-oxblood-dark'}`}
              style={{ width: `${r.safetyScore}%` }}
            />
          </div>
          <span className="tabular text-xs">{r.safetyScore}</span>
        </div>
      ),
    },
    { key: 'region', label: 'Region', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r) =>
        allowed ? (
          <Select
            value={r.status}
            onChange={(e) => updateDriver(r.id, { status: e.target.value })}
            className="!py-1 !text-xs w-32"
          >
            {DRIVER_STATUS.map((s) => <option key={s}>{s}</option>)}
          </Select>
        ) : (
          <StatusBadge status={r.status} />
        ),
    },
  ]

  return (
    <Layout title="Driver Management" subtitle="Licensing, compliance and safety records for every driver.">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest2 text-ink-soft dark:text-ink-darksoft">Search</span>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft dark:text-ink-darksoft" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or license no." className="pl-8 w-56" />
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-[11px] font-mono uppercase tracking-widest2 text-ink-soft dark:text-ink-darksoft">Status</span>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {['All', ...DRIVER_STATUS].map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
        </div>
        {allowed && (
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Add Driver
          </Button>
        )}
      </div>

      <DataTable columns={columns} rows={rows} emptyLabel="No drivers match this filter." />

      <Modal open={open} onClose={() => setOpen(false)} title="Add Driver" subtitle="Register a driver profile.">
        <form onSubmit={submit}>
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Full Name">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="License Number">
              <Input required value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} />
            </Field>
            <Field label="License Category">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="License Expiry">
              <Input required type="date" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
            </Field>
            <Field label="Contact Number">
              <Input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="+91 …" />
            </Field>
            <Field label="Region">
              <Select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Safety Score (0–100)">
              <Input type="number" min="0" max="100" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Add Driver</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

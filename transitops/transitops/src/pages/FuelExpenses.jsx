import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { Field, Input, Select, Button } from '../components/Field'
import { can } from '../utils/permissions'
import { computeOperationalCost } from '../utils/businessRules'
import { Plus, Fuel as FuelIcon, Receipt } from 'lucide-react'

const EXPENSE_CATEGORIES = ['Toll', 'Parking', 'Permit', 'Fine', 'Cleaning', 'Other']

export default function FuelExpenses() {
  const { vehicles, fuelLogs, expenses, maintenance, addFuelLog, addExpense } = useData()
  const { user } = useAuth()
  const allowed = can(user.role, 'manage_expenses')
  const [tab, setTab] = useState('fuel')
  const [fuelOpen, setFuelOpen] = useState(false)
  const [expOpen, setExpOpen] = useState(false)
  const [fuelForm, setFuelForm] = useState({ vehicleId: '', liters: '', cost: '', date: '' })
  const [expForm, setExpForm] = useState({ vehicleId: '', category: EXPENSE_CATEGORIES[0], amount: '', date: '', note: '' })

  const perVehicleCost = useMemo(() => {
    return vehicles
      .map((v) => ({ vehicle: v, ...computeOperationalCost(v.id, fuelLogs, maintenance, expenses) }))
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [vehicles, fuelLogs, maintenance, expenses])

  const submitFuel = (e) => {
    e.preventDefault()
    addFuelLog({ ...fuelForm, liters: Number(fuelForm.liters), cost: Number(fuelForm.cost) })
    setFuelForm({ vehicleId: '', liters: '', cost: '', date: '' })
    setFuelOpen(false)
  }

  const submitExpense = (e) => {
    e.preventDefault()
    addExpense({ ...expForm, amount: Number(expForm.amount) })
    setExpForm({ vehicleId: '', category: EXPENSE_CATEGORIES[0], amount: '', date: '', note: '' })
    setExpOpen(false)
  }

  const fuelColumns = [
    { key: 'vehicleId', label: 'Vehicle', render: (r) => <span className="font-mono text-sm">{vehicles.find((v) => v.id === r.vehicleId)?.regNo || '—'}</span> },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'liters', label: 'Liters', sortable: true, render: (r) => <span className="tabular">{r.liters} L</span> },
    { key: 'cost', label: 'Cost', sortable: true, render: (r) => <span className="tabular">₹{r.cost.toLocaleString()}</span> },
  ]

  const expenseColumns = [
    { key: 'vehicleId', label: 'Vehicle', render: (r) => <span className="font-mono text-sm">{vehicles.find((v) => v.id === r.vehicleId)?.regNo || '—'}</span> },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, render: (r) => <span className="tabular">₹{r.amount.toLocaleString()}</span> },
    { key: 'note', label: 'Note', render: (r) => <span className="text-ink-soft dark:text-ink-darksoft">{r.note}</span> },
  ]

  const costColumns = [
    { key: 'reg', label: 'Vehicle', render: (r) => <span className="font-mono text-sm">{r.vehicle.regNo}</span> },
    { key: 'fuel', label: 'Fuel Cost', sortable: true, render: (r) => <span className="tabular">₹{r.fuel.toLocaleString()}</span> },
    { key: 'maintenance', label: 'Maintenance Cost', sortable: true, render: (r) => <span className="tabular">₹{r.maintenance.toLocaleString()}</span> },
    { key: 'other', label: 'Other Expenses', sortable: true, render: (r) => <span className="tabular">₹{r.other.toLocaleString()}</span> },
    { key: 'total', label: 'Total Operational Cost', sortable: true, render: (r) => <span className="tabular font-medium">₹{r.total.toLocaleString()}</span> },
  ]

  return (
    <Layout title="Fuel & Expenses" subtitle="Operational cost is computed automatically as Fuel + Maintenance + Other.">
      <div className="mb-6 flex gap-1 border-b hairline">
        {[
          { id: 'fuel', label: 'Fuel Logs', icon: FuelIcon },
          { id: 'expenses', label: 'Other Expenses', icon: Receipt },
          { id: 'cost', label: 'Cost per Vehicle', icon: Receipt },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-navy dark:border-navy-bright text-ink dark:text-ink-dark font-medium'
                : 'border-transparent text-ink-soft dark:text-ink-darksoft hover:text-ink dark:hover:text-ink-dark'
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'fuel' && (
        <>
          {allowed && (
            <div className="mb-4 flex justify-end">
              <Button onClick={() => setFuelOpen(true)}><Plus size={16} /> Log Fuel</Button>
            </div>
          )}
          <DataTable columns={fuelColumns} rows={fuelLogs} emptyLabel="No fuel logs recorded." />
        </>
      )}

      {tab === 'expenses' && (
        <>
          {allowed && (
            <div className="mb-4 flex justify-end">
              <Button onClick={() => setExpOpen(true)}><Plus size={16} /> Log Expense</Button>
            </div>
          )}
          <DataTable columns={expenseColumns} rows={expenses} emptyLabel="No expenses recorded." />
        </>
      )}

      {tab === 'cost' && (
        <DataTable columns={costColumns} rows={perVehicleCost} rowKey="reg" emptyLabel="No cost data yet." />
      )}

      <Modal open={fuelOpen} onClose={() => setFuelOpen(false)} title="Log Fuel" subtitle="Record a refuelling event.">
        <form onSubmit={submitFuel}>
          <Field label="Vehicle">
            <Select required value={fuelForm.vehicleId} onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}>
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNo} — {v.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Liters">
              <Input required type="number" min="0" step="0.1" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} />
            </Field>
            <Field label="Cost (₹)">
              <Input required type="number" min="0" value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} />
            </Field>
          </div>
          <Field label="Date">
            <Input required type="date" value={fuelForm.date} onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setFuelOpen(false)}>Cancel</Button>
            <Button type="submit">Save Log</Button>
          </div>
        </form>
      </Modal>

      <Modal open={expOpen} onClose={() => setExpOpen(false)} title="Log Expense" subtitle="Tolls, parking, permits and more.">
        <form onSubmit={submitExpense}>
          <Field label="Vehicle">
            <Select required value={expForm.vehicleId} onChange={(e) => setExpForm({ ...expForm, vehicleId: e.target.value })}>
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNo} — {v.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Category">
              <Select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}>
                {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Amount (₹)">
              <Input required type="number" min="0" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} />
            </Field>
          </div>
          <Field label="Date">
            <Input required type="date" value={expForm.date} onChange={(e) => setExpForm({ ...expForm, date: e.target.value })} />
          </Field>
          <Field label="Note">
            <Input value={expForm.note} onChange={(e) => setExpForm({ ...expForm, note: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={() => setExpOpen(false)}>Cancel</Button>
            <Button type="submit">Save Expense</Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

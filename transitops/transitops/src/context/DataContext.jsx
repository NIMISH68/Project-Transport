import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import {
  initialVehicles,
  initialDrivers,
  initialTrips,
  initialMaintenance,
  initialFuelLogs,
  initialExpenses,
  tripRevenue,
} from '../data/seed'
import {
  isRegNoUnique,
  vehicleEligibleForDispatch,
  driverEligibleForDispatch,
  cargoWithinCapacity,
} from '../utils/businessRules'

const DataContext = createContext(null)

let idCounter = 1000
const nextId = (prefix) => `${prefix}${idCounter++}`

export function DataProvider({ children }) {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [drivers, setDrivers] = useState(initialDrivers)
  const [trips, setTrips] = useState(initialTrips)
  const [maintenance, setMaintenance] = useState(initialMaintenance)
  const [fuelLogs, setFuelLogs] = useState(initialFuelLogs)
  const [expenses, setExpenses] = useState(initialExpenses)
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, tone = 'navy') => {
    setToast({ message, tone, id: Date.now() })
  }, [])

  // ---------- Vehicles ----------
  const addVehicle = useCallback((vehicle) => {
    if (!isRegNoUnique(vehicles, vehicle.regNo)) {
      return { ok: false, error: 'Registration number must be unique.' }
    }
    const record = { id: nextId('v'), status: 'Available', ...vehicle }
    setVehicles((prev) => [record, ...prev])
    notify(`Vehicle ${vehicle.regNo} registered.`, 'racing')
    return { ok: true }
  }, [vehicles, notify])

  const updateVehicle = useCallback((id, patch) => {
    if (patch.regNo && !isRegNoUnique(vehicles, patch.regNo, id)) {
      return { ok: false, error: 'Registration number must be unique.' }
    }
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)))
    return { ok: true }
  }, [vehicles])

  const retireVehicle = useCallback((id) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'Retired' } : v)))
    notify('Vehicle retired from active service.', 'oxblood')
  }, [notify])

  // ---------- Drivers ----------
  const addDriver = useCallback((driver) => {
    const record = { id: nextId('d'), status: 'Available', ...driver }
    setDrivers((prev) => [record, ...prev])
    notify(`Driver ${driver.name} added to roster.`, 'racing')
    return { ok: true }
  }, [notify])

  const updateDriver = useCallback((id, patch) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }, [])

  // ---------- Trips ----------
  const createTrip = useCallback((trip) => {
    const record = {
      id: nextId('t'),
      status: 'Draft',
      createdAt: new Date().toISOString().slice(0, 10),
      finalOdometer: null,
      fuelConsumed: null,
      ...trip,
    }
    setTrips((prev) => [record, ...prev])
    notify('Trip drafted. Dispatch when ready.', 'navy')
    return { ok: true, id: record.id }
  }, [notify])

  const dispatchTrip = useCallback((tripId) => {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return { ok: false, error: 'Trip not found.' }
    const vehicle = vehicles.find((v) => v.id === trip.vehicleId)
    const driver = drivers.find((d) => d.id === trip.driverId)
    if (!vehicle || !driver) return { ok: false, error: 'Vehicle or driver missing.' }

    const vCheck = vehicleEligibleForDispatch(vehicle)
    if (!vCheck.ok) return { ok: false, error: `Vehicle: ${vCheck.reason}` }
    const dCheck = driverEligibleForDispatch(driver)
    if (!dCheck.ok) return { ok: false, error: `Driver: ${dCheck.reason}` }
    if (!cargoWithinCapacity(vehicle, trip.cargoWeight)) {
      return { ok: false, error: `Cargo weight (${trip.cargoWeight}kg) exceeds max load (${vehicle.maxLoad}kg).` }
    }

    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'Dispatched' } : t)))
    setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? { ...v, status: 'On Trip' } : v)))
    setDrivers((prev) => prev.map((d) => (d.id === driver.id ? { ...d, status: 'On Trip' } : d)))
    notify(`Trip dispatched — ${vehicle.regNo} & ${driver.name} are now On Trip.`, 'navy')
    return { ok: true }
  }, [trips, vehicles, drivers, notify])

  const completeTrip = useCallback((tripId, { finalOdometer, fuelConsumed }) => {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return { ok: false, error: 'Trip not found.' }
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'Completed', finalOdometer, fuelConsumed } : t)))
    setVehicles((prev) => prev.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'Available', odometer: finalOdometer || v.odometer } : v)))
    setDrivers((prev) => prev.map((d) => (d.id === trip.driverId ? { ...d, status: 'Available' } : d)))
    if (fuelConsumed) {
      setFuelLogs((prev) => [
        { id: nextId('f'), vehicleId: trip.vehicleId, liters: Number(fuelConsumed), cost: Math.round(Number(fuelConsumed) * 95), date: new Date().toISOString().slice(0, 10) },
        ...prev,
      ])
    }
    notify('Trip completed. Vehicle & driver are Available again.', 'racing')
    return { ok: true }
  }, [trips, notify])

  const cancelTrip = useCallback((tripId) => {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return { ok: false, error: 'Trip not found.' }
    const wasDispatched = trip.status === 'Dispatched'
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'Cancelled' } : t)))
    if (wasDispatched) {
      setVehicles((prev) => prev.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'Available' } : v)))
      setDrivers((prev) => prev.map((d) => (d.id === trip.driverId ? { ...d, status: 'Available' } : d)))
    }
    notify('Trip cancelled.', 'oxblood')
    return { ok: true }
  }, [trips, notify])

  // ---------- Maintenance ----------
  const openMaintenance = useCallback((record) => {
    const vehicle = vehicles.find((v) => v.id === record.vehicleId)
    if (!vehicle) return { ok: false, error: 'Vehicle not found.' }
    if (vehicle.status === 'On Trip') {
      return { ok: false, error: 'Vehicle is currently on a trip and cannot enter the shop.' }
    }
    const entry = { id: nextId('m'), status: 'Open', closedAt: null, openedAt: new Date().toISOString().slice(0, 10), ...record }
    setMaintenance((prev) => [entry, ...prev])
    setVehicles((prev) => prev.map((v) => (v.id === record.vehicleId ? { ...v, status: 'In Shop' } : v)))
    notify(`${vehicle.regNo} moved to In Shop for ${record.type}.`, 'brass')
    return { ok: true }
  }, [vehicles, notify])

  const closeMaintenance = useCallback((id) => {
    const rec = maintenance.find((m) => m.id === id)
    if (!rec) return { ok: false, error: 'Record not found.' }
    setMaintenance((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'Closed', closedAt: new Date().toISOString().slice(0, 10) } : m)))
    setVehicles((prev) => prev.map((v) => {
      if (v.id !== rec.vehicleId) return v
      if (v.status === 'Retired') return v
      return { ...v, status: 'Available' }
    }))
    notify('Maintenance closed. Vehicle restored to Available.', 'racing')
    return { ok: true }
  }, [maintenance, notify])

  // ---------- Fuel & Expenses ----------
  const addFuelLog = useCallback((log) => {
    setFuelLogs((prev) => [{ id: nextId('f'), ...log }, ...prev])
    notify('Fuel log recorded.', 'navy')
  }, [notify])

  const addExpense = useCallback((exp) => {
    setExpenses((prev) => [{ id: nextId('e'), ...exp }, ...prev])
    notify('Expense recorded.', 'navy')
  }, [notify])

  const value = useMemo(() => ({
    vehicles, drivers, trips, maintenance, fuelLogs, expenses, tripRevenue, toast, setToast,
    addVehicle, updateVehicle, retireVehicle,
    addDriver, updateDriver,
    createTrip, dispatchTrip, completeTrip, cancelTrip,
    openMaintenance, closeMaintenance,
    addFuelLog, addExpense,
  }), [vehicles, drivers, trips, maintenance, fuelLogs, expenses, toast,
      addVehicle, updateVehicle, retireVehicle, addDriver, updateDriver,
      createTrip, dispatchTrip, completeTrip, cancelTrip, openMaintenance, closeMaintenance,
      addFuelLog, addExpense])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

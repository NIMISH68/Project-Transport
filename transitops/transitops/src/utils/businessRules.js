// Central business-rule helpers, mirroring the mandatory rules in the spec.

export function isLicenseExpired(driver, today = new Date()) {
  return new Date(driver.expiry) < today
}

export function driverEligibleForDispatch(driver, today = new Date()) {
  if (driver.status === 'Suspended') return { ok: false, reason: 'Driver is suspended.' }
  if (isLicenseExpired(driver, today)) return { ok: false, reason: 'License has expired.' }
  if (driver.status === 'On Trip') return { ok: false, reason: 'Driver is already on a trip.' }
  if (driver.status === 'Off Duty') return { ok: false, reason: 'Driver is off duty.' }
  return { ok: true }
}

export function vehicleEligibleForDispatch(vehicle) {
  if (vehicle.status === 'Retired') return { ok: false, reason: 'Vehicle is retired.' }
  if (vehicle.status === 'In Shop') return { ok: false, reason: 'Vehicle is in the shop.' }
  if (vehicle.status === 'On Trip') return { ok: false, reason: 'Vehicle is already on a trip.' }
  return { ok: true }
}

export function cargoWithinCapacity(vehicle, cargoWeight) {
  return Number(cargoWeight) <= Number(vehicle.maxLoad)
}

export function selectableVehicles(vehicles) {
  return vehicles.filter((v) => v.status === 'Available')
}

export function selectableDrivers(drivers, today = new Date()) {
  return drivers.filter((d) => driverEligibleForDispatch(d, today).ok)
}

export function isRegNoUnique(vehicles, regNo, excludeId = null) {
  return !vehicles.some((v) => v.regNo.toLowerCase() === regNo.toLowerCase() && v.id !== excludeId)
}

export function computeOperationalCost(vehicleId, fuelLogs, maintenanceLogs, expenses = []) {
  const fuel = fuelLogs.filter((f) => f.vehicleId === vehicleId).reduce((s, f) => s + f.cost, 0)
  const maintenance = maintenanceLogs.filter((m) => m.vehicleId === vehicleId).reduce((s, m) => s + m.cost, 0)
  const other = expenses.filter((e) => e.vehicleId === vehicleId).reduce((s, e) => s + e.amount, 0)
  return { fuel, maintenance, other, total: fuel + maintenance + other }
}

export function computeFuelEfficiency(vehicleId, trips, fuelLogs) {
  const completed = trips.filter((t) => t.vehicleId === vehicleId && t.status === 'Completed' && t.fuelConsumed)
  const totalDistance = completed.reduce((s, t) => s + (t.distance || 0), 0)
  const totalFuel = completed.reduce((s, t) => s + (t.fuelConsumed || 0), 0)
  if (totalFuel === 0) return null
  return totalDistance / totalFuel
}

export function computeROI(vehicle, revenue, fuelLogs, maintenanceLogs, expenses = []) {
  const { fuel, maintenance } = computeOperationalCost(vehicle.id, fuelLogs, maintenanceLogs, expenses)
  if (!vehicle.cost) return null
  return (revenue - (maintenance + fuel)) / vehicle.cost
}

export function computeFleetUtilization(vehicles) {
  const eligible = vehicles.filter((v) => v.status !== 'Retired')
  if (eligible.length === 0) return 0
  const onTrip = eligible.filter((v) => v.status === 'On Trip').length
  return (onTrip / eligible.length) * 100
}

export const STATUS_TONES = {
  Available: 'racing',
  'On Trip': 'navy',
  'In Shop': 'brass',
  Retired: 'ink',
  Draft: 'ink',
  Dispatched: 'navy',
  Completed: 'racing',
  Cancelled: 'oxblood',
  'Off Duty': 'brass',
  Suspended: 'oxblood',
  Open: 'oxblood',
  Closed: 'racing',
}

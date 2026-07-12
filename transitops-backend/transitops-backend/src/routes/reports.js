const express = require('express')
const db = require('../config/db')
const requireAuth = require('../middleware/auth')
const { toCSV } = require('../utils/csv')
const { TRIP_STATUS, VEHICLE_STATUS } = require('../config/constants')

const router = express.Router()
router.use(requireAuth)

function buildReport() {
  const vehicles = db.get('vehicles').value()
  const trips = db.get('trips').value()
  const maintenanceLogs = db.get('maintenanceLogs').value()
  const fuelLogs = db.get('fuelLogs').value()
  const expenses = db.get('expenses').value()

  const rows = vehicles.map(v => {
    const completedTrips = trips.filter(t => t.vehicleId === v.id && t.status === TRIP_STATUS.COMPLETED)
    const vehicleFuelLogs = fuelLogs.filter(f => f.vehicleId === v.id)
    const vehicleMaintenance = maintenanceLogs.filter(m => m.vehicleId === v.id)
    const vehicleExpenses = expenses.filter(e => e.vehicleId === v.id)

    const totalDistanceKm = completedTrips.reduce((sum, t) => sum + (t.plannedDistanceKm || 0), 0)
    const totalFuelL = vehicleFuelLogs.reduce((sum, f) => sum + f.liters, 0)
    const totalFuelCost = vehicleFuelLogs.reduce((sum, f) => sum + f.cost, 0)
    const totalMaintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + m.cost, 0)
    const totalOtherExpenses = vehicleExpenses.reduce((sum, e) => sum + e.amount, 0)
    const totalRevenue = completedTrips.reduce((sum, t) => sum + (t.revenue || 0), 0)

    const operationalCost = totalFuelCost + totalMaintenanceCost + totalOtherExpenses
    const fuelEfficiencyKmPerL = totalFuelL > 0 ? Number((totalDistanceKm / totalFuelL).toFixed(2)) : null
    const roi = v.acquisitionCost > 0
      ? Number((((totalRevenue - (totalMaintenanceCost + totalFuelCost)) / v.acquisitionCost) * 100).toFixed(2))
      : null

    return {
      vehicleId: v.id,
      regNumber: v.regNumber,
      name: v.name,
      type: v.type,
      status: v.status,
      region: v.region,
      totalTrips: completedTrips.length,
      totalDistanceKm,
      totalFuelL,
      fuelEfficiencyKmPerL,
      totalFuelCost,
      totalMaintenanceCost,
      totalOtherExpenses,
      operationalCost,
      totalRevenue,
      roiPercent: roi
    }
  })

  const nonRetired = vehicles.filter(v => v.status !== VEHICLE_STATUS.RETIRED)
  const onTrip = vehicles.filter(v => v.status === VEHICLE_STATUS.ON_TRIP)
  const fleetUtilization = nonRetired.length > 0
    ? Number(((onTrip.length / nonRetired.length) * 100).toFixed(1))
    : 0

  return { perVehicle: rows, fleetUtilization }
}

// GET /api/reports — JSON report, per-vehicle + fleet-level summary
router.get('/', (req, res) => {
  res.json(buildReport())
})

// GET /api/reports/export.csv — per-vehicle report as CSV
router.get('/export.csv', (req, res) => {
  const { perVehicle } = buildReport()
  const csv = toCSV(perVehicle)
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="transitops-report.csv"')
  res.send(csv)
})

module.exports = router

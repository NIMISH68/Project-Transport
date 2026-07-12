const express = require('express')
const db = require('../config/db')
const requireAuth = require('../middleware/auth')
const { VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS } = require('../config/constants')

const router = express.Router()
router.use(requireAuth)

// GET /api/dashboard?type=&status=&region=
// Filters apply to the vehicle-derived KPIs, matching the "filters by vehicle
// type, status, and region" requirement.
router.get('/', (req, res) => {
  const { type, status, region } = req.query

  let vehicles = db.get('vehicles').value()
  if (type) vehicles = vehicles.filter(v => v.type.toLowerCase() === String(type).toLowerCase())
  if (status) vehicles = vehicles.filter(v => v.status === status)
  if (region) vehicles = vehicles.filter(v => (v.region || '').toLowerCase() === String(region).toLowerCase())

  const trips = db.get('trips').value()
  const drivers = db.get('drivers').value()

  const nonRetired = vehicles.filter(v => v.status !== VEHICLE_STATUS.RETIRED)
  const activeVehicles = nonRetired.length
  const availableVehicles = vehicles.filter(v => v.status === VEHICLE_STATUS.AVAILABLE).length
  const vehiclesInMaintenance = vehicles.filter(v => v.status === VEHICLE_STATUS.IN_SHOP).length
  const onTripVehicles = vehicles.filter(v => v.status === VEHICLE_STATUS.ON_TRIP).length

  const activeTrips = trips.filter(t => t.status === TRIP_STATUS.DISPATCHED).length
  const pendingTrips = trips.filter(t => t.status === TRIP_STATUS.DRAFT).length
  const driversOnDuty = drivers.filter(d => d.status === DRIVER_STATUS.ON_TRIP).length

  const fleetUtilization = activeVehicles > 0
    ? Number(((onTripVehicles / activeVehicles) * 100).toFixed(1))
    : 0

  res.json({
    kpis: {
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization
    },
    filtersApplied: { type: type || null, status: status || null, region: region || null }
  })
})

module.exports = router

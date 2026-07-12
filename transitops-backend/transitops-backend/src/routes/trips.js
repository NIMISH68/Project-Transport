const express = require('express')
const { v4: uuid } = require('uuid')
const db = require('../config/db')
const requireAuth = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const httpError = require('../utils/httpError')
const { ROLES, VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS } = require('../config/constants')

const router = express.Router()
router.use(requireAuth)

const CAN_MANAGE_TRIPS = [ROLES.DRIVER, ROLES.FLEET_MANAGER]

function getVehicleOr404(id) {
  const vehicle = db.get('vehicles').find({ id }).value()
  if (!vehicle) throw httpError(404, 'Selected vehicle does not exist.')
  return vehicle
}
function getDriverOr404(id) {
  const driver = db.get('drivers').find({ id }).value()
  if (!driver) throw httpError(404, 'Selected driver does not exist.')
  return driver
}
function isLicenseExpired(driver) {
  return new Date(driver.licenseExpiry) < new Date()
}

function assertDispatchable(vehicle, driver, cargoWeightKg) {
  if (vehicle.status === VEHICLE_STATUS.RETIRED) {
    throw httpError(409, `Vehicle ${vehicle.regNumber} is retired and cannot be dispatched.`)
  }
  if (vehicle.status === VEHICLE_STATUS.IN_SHOP) {
    throw httpError(409, `Vehicle ${vehicle.regNumber} is in the shop and cannot be dispatched.`)
  }
  if (vehicle.status === VEHICLE_STATUS.ON_TRIP) {
    throw httpError(409, `Vehicle ${vehicle.regNumber} is already assigned to another trip.`)
  }
  if (driver.status === DRIVER_STATUS.SUSPENDED) {
    throw httpError(409, `Driver ${driver.name} is suspended and cannot be assigned.`)
  }
  if (driver.status === DRIVER_STATUS.ON_TRIP) {
    throw httpError(409, `Driver ${driver.name} is already assigned to another trip.`)
  }
  if (isLicenseExpired(driver)) {
    throw httpError(409, `Driver ${driver.name}'s license expired on ${driver.licenseExpiry}.`)
  }
  if (Number(cargoWeightKg) > vehicle.maxLoadKg) {
    throw httpError(409, `Cargo weight (${cargoWeightKg} kg) exceeds ${vehicle.regNumber}'s max load of ${vehicle.maxLoadKg} kg.`)
  }
}

// GET /api/trips?status=&vehicleId=&driverId=
router.get('/', (req, res) => {
  const { status, vehicleId, driverId } = req.query
  let list = db.get('trips').value()
  if (status) list = list.filter(t => t.status === status)
  if (vehicleId) list = list.filter(t => t.vehicleId === vehicleId)
  if (driverId) list = list.filter(t => t.driverId === driverId)
  res.json({ trips: list })
})

router.get('/:id', (req, res, next) => {
  const trip = db.get('trips').find({ id: req.params.id }).value()
  if (!trip) return next(httpError(404, 'Trip not found.'))
  res.json({ trip })
})

// POST /api/trips — creates a Draft trip. Availability + cargo/license rules
// are checked now (so users can't even draft an impossible trip) and are
// re-checked at dispatch time in case circumstances changed meanwhile.
router.post('/', requireRole(...CAN_MANAGE_TRIPS), (req, res, next) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm, revenue } = req.body
    if (!source || !destination || !vehicleId || !driverId || cargoWeightKg === undefined || !plannedDistanceKm) {
      throw httpError(400, 'source, destination, vehicleId, driverId, cargoWeightKg and plannedDistanceKm are required.')
    }
    const vehicle = getVehicleOr404(vehicleId)
    const driver = getDriverOr404(driverId)
    assertDispatchable(vehicle, driver, cargoWeightKg)

    const trip = {
      id: uuid(),
      source,
      destination,
      vehicleId,
      driverId,
      cargoWeightKg: Number(cargoWeightKg),
      plannedDistanceKm: Number(plannedDistanceKm),
      revenue: revenue !== undefined ? Number(revenue) : 0,
      status: TRIP_STATUS.DRAFT,
      createdAt: new Date().toISOString(),
      dispatchedAt: null,
      completedAt: null,
      finalOdometerKm: null,
      fuelConsumedL: null
    }
    db.get('trips').push(trip).write()
    res.status(201).json({ trip })
  } catch (err) { next(err) }
})

// PATCH /api/trips/:id/dispatch
router.patch('/:id/dispatch', requireRole(...CAN_MANAGE_TRIPS), (req, res, next) => {
  try {
    const trip = db.get('trips').find({ id: req.params.id }).value()
    if (!trip) throw httpError(404, 'Trip not found.')
    if (trip.status !== TRIP_STATUS.DRAFT) {
      throw httpError(409, `Only Draft trips can be dispatched (current status: ${trip.status}).`)
    }
    const vehicle = getVehicleOr404(trip.vehicleId)
    const driver = getDriverOr404(trip.driverId)
    assertDispatchable(vehicle, driver, trip.cargoWeightKg)

    db.get('vehicles').find({ id: vehicle.id }).assign({ status: VEHICLE_STATUS.ON_TRIP }).write()
    db.get('drivers').find({ id: driver.id }).assign({ status: DRIVER_STATUS.ON_TRIP }).write()
    const updated = db.get('trips').find({ id: trip.id })
      .assign({ status: TRIP_STATUS.DISPATCHED, dispatchedAt: new Date().toISOString() })
      .write()

    res.json({ trip: updated })
  } catch (err) { next(err) }
})

// PATCH /api/trips/:id/complete  { finalOdometerKm, fuelConsumedL, fuelCost, revenue }
router.patch('/:id/complete', requireRole(...CAN_MANAGE_TRIPS), (req, res, next) => {
  try {
    const trip = db.get('trips').find({ id: req.params.id }).value()
    if (!trip) throw httpError(404, 'Trip not found.')
    if (trip.status !== TRIP_STATUS.DISPATCHED) {
      throw httpError(409, `Only Dispatched trips can be completed (current status: ${trip.status}).`)
    }
    const { finalOdometerKm, fuelConsumedL, fuelCost, revenue } = req.body
    if (finalOdometerKm === undefined || fuelConsumedL === undefined) {
      throw httpError(400, 'finalOdometerKm and fuelConsumedL are required to complete a trip.')
    }

    const vehicle = getVehicleOr404(trip.vehicleId)
    const driver = getDriverOr404(trip.driverId)

    if (Number(finalOdometerKm) < vehicle.odometerKm) {
      throw httpError(400, `finalOdometerKm (${finalOdometerKm}) cannot be less than the current odometer (${vehicle.odometerKm}).`)
    }

    db.get('vehicles').find({ id: vehicle.id })
      .assign({ status: VEHICLE_STATUS.AVAILABLE, odometerKm: Number(finalOdometerKm) })
      .write()
    db.get('drivers').find({ id: driver.id }).assign({ status: DRIVER_STATUS.AVAILABLE }).write()

    // Auto-log the fuel consumed against this trip's vehicle (feeds Reports).
    if (Number(fuelConsumedL) > 0) {
      db.get('fuelLogs').push({
        id: uuid(),
        vehicleId: vehicle.id,
        tripId: trip.id,
        liters: Number(fuelConsumedL),
        cost: fuelCost !== undefined ? Number(fuelCost) : 0,
        date: new Date().toISOString().slice(0, 10)
      }).write()
    }

    const updated = db.get('trips').find({ id: trip.id }).assign({
      status: TRIP_STATUS.COMPLETED,
      completedAt: new Date().toISOString(),
      finalOdometerKm: Number(finalOdometerKm),
      fuelConsumedL: Number(fuelConsumedL),
      revenue: revenue !== undefined ? Number(revenue) : trip.revenue
    }).write()

    res.json({ trip: updated })
  } catch (err) { next(err) }
})

// PATCH /api/trips/:id/cancel
router.patch('/:id/cancel', requireRole(...CAN_MANAGE_TRIPS), (req, res, next) => {
  try {
    const trip = db.get('trips').find({ id: req.params.id }).value()
    if (!trip) throw httpError(404, 'Trip not found.')
    if (![TRIP_STATUS.DRAFT, TRIP_STATUS.DISPATCHED].includes(trip.status)) {
      throw httpError(409, `Only Draft or Dispatched trips can be cancelled (current status: ${trip.status}).`)
    }

    if (trip.status === TRIP_STATUS.DISPATCHED) {
      db.get('vehicles').find({ id: trip.vehicleId }).assign({ status: VEHICLE_STATUS.AVAILABLE }).write()
      db.get('drivers').find({ id: trip.driverId }).assign({ status: DRIVER_STATUS.AVAILABLE }).write()
    }

    const updated = db.get('trips').find({ id: trip.id }).assign({ status: TRIP_STATUS.CANCELLED }).write()
    res.json({ trip: updated })
  } catch (err) { next(err) }
})

module.exports = router

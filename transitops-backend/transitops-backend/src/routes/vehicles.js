const express = require('express')
const { v4: uuid } = require('uuid')
const db = require('../config/db')
const requireAuth = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const httpError = require('../utils/httpError')
const { ROLES, VEHICLE_STATUS } = require('../config/constants')

const router = express.Router()
router.use(requireAuth)

const VALID_STATUSES = Object.values(VEHICLE_STATUS)

// GET /api/vehicles?type=&status=&region=
router.get('/', (req, res) => {
  const { type, status, region } = req.query
  let list = db.get('vehicles').value()
  if (type) list = list.filter(v => v.type.toLowerCase() === String(type).toLowerCase())
  if (status) list = list.filter(v => v.status === status)
  if (region) list = list.filter(v => (v.region || '').toLowerCase() === String(region).toLowerCase())
  res.json({ vehicles: list })
})

router.get('/:id', (req, res, next) => {
  const vehicle = db.get('vehicles').find({ id: req.params.id }).value()
  if (!vehicle) return next(httpError(404, 'Vehicle not found.'))
  res.json({ vehicle })
})

// POST /api/vehicles — Fleet Manager only
router.post('/', requireRole(ROLES.FLEET_MANAGER), (req, res, next) => {
  try {
    const { regNumber, name, type, maxLoadKg, odometerKm, acquisitionCost, region } = req.body
    if (!regNumber || !name || !type || !maxLoadKg || acquisitionCost === undefined) {
      throw httpError(400, 'regNumber, name, type, maxLoadKg and acquisitionCost are required.')
    }
    const normalizedReg = String(regNumber).trim().toUpperCase()
    const clash = db.get('vehicles').find(v => v.regNumber.toUpperCase() === normalizedReg).value()
    if (clash) throw httpError(409, `Registration number "${regNumber}" is already in use.`)

    const vehicle = {
      id: uuid(),
      regNumber: normalizedReg,
      name,
      type,
      maxLoadKg: Number(maxLoadKg),
      odometerKm: Number(odometerKm) || 0,
      acquisitionCost: Number(acquisitionCost),
      status: VEHICLE_STATUS.AVAILABLE,
      region: region || 'Unassigned'
    }
    db.get('vehicles').push(vehicle).write()
    res.status(201).json({ vehicle })
  } catch (err) { next(err) }
})

// PUT /api/vehicles/:id — Fleet Manager only
router.put('/:id', requireRole(ROLES.FLEET_MANAGER), (req, res, next) => {
  try {
    const vehicle = db.get('vehicles').find({ id: req.params.id }).value()
    if (!vehicle) throw httpError(404, 'Vehicle not found.')

    const { regNumber, name, type, maxLoadKg, odometerKm, acquisitionCost, region, status } = req.body

    if (regNumber && regNumber.toUpperCase() !== vehicle.regNumber) {
      const normalizedReg = String(regNumber).trim().toUpperCase()
      const clash = db.get('vehicles')
        .find(v => v.id !== vehicle.id && v.regNumber.toUpperCase() === normalizedReg)
        .value()
      if (clash) throw httpError(409, `Registration number "${regNumber}" is already in use.`)
      vehicle.regNumber = normalizedReg
    }
    if (status && !VALID_STATUSES.includes(status)) {
      throw httpError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`)
    }
    if (status === VEHICLE_STATUS.AVAILABLE || status === VEHICLE_STATUS.RETIRED) {
      // manual override guard — don't let a manager silently free a vehicle
      // that is mid-trip via a raw status edit
      if (vehicle.status === VEHICLE_STATUS.ON_TRIP) {
        throw httpError(409, 'Vehicle is currently on a dispatched trip. Complete or cancel the trip first.')
      }
    }

    if (name) vehicle.name = name
    if (type) vehicle.type = type
    if (maxLoadKg !== undefined) vehicle.maxLoadKg = Number(maxLoadKg)
    if (odometerKm !== undefined) vehicle.odometerKm = Number(odometerKm)
    if (acquisitionCost !== undefined) vehicle.acquisitionCost = Number(acquisitionCost)
    if (region) vehicle.region = region
    if (status) vehicle.status = status

    db.get('vehicles').find({ id: req.params.id }).assign(vehicle).write()
    res.json({ vehicle })
  } catch (err) { next(err) }
})

// DELETE /api/vehicles/:id — Fleet Manager only. Blocked if vehicle has an
// active (Dispatched-linked) trip or open maintenance record.
router.delete('/:id', requireRole(ROLES.FLEET_MANAGER), (req, res, next) => {
  try {
    const vehicle = db.get('vehicles').find({ id: req.params.id }).value()
    if (!vehicle) throw httpError(404, 'Vehicle not found.')
    if (vehicle.status === VEHICLE_STATUS.ON_TRIP) {
      throw httpError(409, 'Cannot delete a vehicle that is currently on a trip.')
    }
    const openMaintenance = db.get('maintenanceLogs')
      .find(m => m.vehicleId === vehicle.id && m.status === 'Open').value()
    if (openMaintenance) throw httpError(409, 'Cannot delete a vehicle with an open maintenance record.')

    db.get('vehicles').remove({ id: req.params.id }).write()
    res.status(204).end()
  } catch (err) { next(err) }
})

module.exports = router

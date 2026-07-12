const express = require('express')
const { v4: uuid } = require('uuid')
const db = require('../config/db')
const requireAuth = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const httpError = require('../utils/httpError')
const { ROLES, VEHICLE_STATUS, MAINTENANCE_STATUS } = require('../config/constants')

const router = express.Router()
router.use(requireAuth)

// GET /api/maintenance?status=&vehicleId=
router.get('/', (req, res) => {
  const { status, vehicleId } = req.query
  let list = db.get('maintenanceLogs').value()
  if (status) list = list.filter(m => m.status === status)
  if (vehicleId) list = list.filter(m => m.vehicleId === vehicleId)
  res.json({ maintenanceLogs: list })
})

// POST /api/maintenance — Fleet Manager only. Opening a record locks the
// vehicle to "In Shop", removing it from the dispatch pool.
router.post('/', requireRole(ROLES.FLEET_MANAGER), (req, res, next) => {
  try {
    const { vehicleId, description, cost, date } = req.body
    if (!vehicleId || !description) throw httpError(400, 'vehicleId and description are required.')

    const vehicle = db.get('vehicles').find({ id: vehicleId }).value()
    if (!vehicle) throw httpError(404, 'Vehicle not found.')
    if (vehicle.status === VEHICLE_STATUS.RETIRED) {
      throw httpError(409, 'Cannot open a maintenance record for a retired vehicle.')
    }
    if (vehicle.status === VEHICLE_STATUS.ON_TRIP) {
      throw httpError(409, 'Vehicle is currently on a dispatched trip. Complete or cancel the trip first.')
    }

    const record = {
      id: uuid(),
      vehicleId,
      description,
      cost: cost !== undefined ? Number(cost) : 0,
      status: MAINTENANCE_STATUS.OPEN,
      createdAt: date || new Date().toISOString().slice(0, 10),
      closedAt: null
    }
    db.get('maintenanceLogs').push(record).write()
    db.get('vehicles').find({ id: vehicleId }).assign({ status: VEHICLE_STATUS.IN_SHOP }).write()

    res.status(201).json({ maintenanceLog: record })
  } catch (err) { next(err) }
})

// PATCH /api/maintenance/:id/close — Fleet Manager only. Restores the
// vehicle to Available, unless it was separately marked Retired, or another
// open maintenance record still exists for it.
router.patch('/:id/close', requireRole(ROLES.FLEET_MANAGER), (req, res, next) => {
  try {
    const record = db.get('maintenanceLogs').find({ id: req.params.id }).value()
    if (!record) throw httpError(404, 'Maintenance record not found.')
    if (record.status === MAINTENANCE_STATUS.CLOSED) throw httpError(409, 'Maintenance record is already closed.')

    const closedRecord = db.get('maintenanceLogs').find({ id: record.id }).assign({
      status: MAINTENANCE_STATUS.CLOSED,
      closedAt: new Date().toISOString().slice(0, 10)
    }).write()

    const vehicle = db.get('vehicles').find({ id: record.vehicleId }).value()
    const otherOpenRecords = db.get('maintenanceLogs')
      .filter(m => m.vehicleId === record.vehicleId && m.status === MAINTENANCE_STATUS.OPEN && m.id !== record.id)
      .value()

    if (vehicle && vehicle.status !== VEHICLE_STATUS.RETIRED && otherOpenRecords.length === 0) {
      db.get('vehicles').find({ id: vehicle.id }).assign({ status: VEHICLE_STATUS.AVAILABLE }).write()
    }

    res.json({ maintenanceLog: closedRecord })
  } catch (err) { next(err) }
})

module.exports = router

const express = require('express')
const { v4: uuid } = require('uuid')
const db = require('../config/db')
const requireAuth = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const httpError = require('../utils/httpError')
const { ROLES } = require('../config/constants')

const router = express.Router()
router.use(requireAuth)

const CAN_WRITE = [ROLES.FINANCIAL_ANALYST, ROLES.FLEET_MANAGER]

// GET /api/fuel-logs?vehicleId=
router.get('/', (req, res) => {
  const { vehicleId } = req.query
  let list = db.get('fuelLogs').value()
  if (vehicleId) list = list.filter(f => f.vehicleId === vehicleId)
  res.json({ fuelLogs: list })
})

// POST /api/fuel-logs — Financial Analyst or Fleet Manager
router.post('/', requireRole(...CAN_WRITE), (req, res, next) => {
  try {
    const { vehicleId, liters, cost, date } = req.body
    if (!vehicleId || !liters || cost === undefined) {
      throw httpError(400, 'vehicleId, liters and cost are required.')
    }
    const vehicle = db.get('vehicles').find({ id: vehicleId }).value()
    if (!vehicle) throw httpError(404, 'Vehicle not found.')

    const log = {
      id: uuid(),
      vehicleId,
      tripId: null,
      liters: Number(liters),
      cost: Number(cost),
      date: date || new Date().toISOString().slice(0, 10)
    }
    db.get('fuelLogs').push(log).write()
    res.status(201).json({ fuelLog: log })
  } catch (err) { next(err) }
})

router.delete('/:id', requireRole(...CAN_WRITE), (req, res, next) => {
  try {
    const log = db.get('fuelLogs').find({ id: req.params.id }).value()
    if (!log) throw httpError(404, 'Fuel log not found.')
    db.get('fuelLogs').remove({ id: req.params.id }).write()
    res.status(204).end()
  } catch (err) { next(err) }
})

module.exports = router

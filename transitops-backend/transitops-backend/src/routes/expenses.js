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

// GET /api/expenses?vehicleId=&category=
router.get('/', (req, res) => {
  const { vehicleId, category } = req.query
  let list = db.get('expenses').value()
  if (vehicleId) list = list.filter(e => e.vehicleId === vehicleId)
  if (category) list = list.filter(e => e.category.toLowerCase() === String(category).toLowerCase())
  res.json({ expenses: list })
})

// POST /api/expenses — Financial Analyst or Fleet Manager
router.post('/', requireRole(...CAN_WRITE), (req, res, next) => {
  try {
    const { vehicleId, category, amount, date, notes } = req.body
    if (!vehicleId || !category || amount === undefined) {
      throw httpError(400, 'vehicleId, category and amount are required.')
    }
    const vehicle = db.get('vehicles').find({ id: vehicleId }).value()
    if (!vehicle) throw httpError(404, 'Vehicle not found.')

    const expense = {
      id: uuid(),
      vehicleId,
      category, // e.g. Toll, Permit, Fine, Parking
      amount: Number(amount),
      date: date || new Date().toISOString().slice(0, 10),
      notes: notes || ''
    }
    db.get('expenses').push(expense).write()
    res.status(201).json({ expense })
  } catch (err) { next(err) }
})

router.delete('/:id', requireRole(...CAN_WRITE), (req, res, next) => {
  try {
    const expense = db.get('expenses').find({ id: req.params.id }).value()
    if (!expense) throw httpError(404, 'Expense not found.')
    db.get('expenses').remove({ id: req.params.id }).write()
    res.status(204).end()
  } catch (err) { next(err) }
})

module.exports = router

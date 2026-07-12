const express = require('express')
const { v4: uuid } = require('uuid')
const db = require('../config/db')
const requireAuth = require('../middleware/auth')
const requireRole = require('../middleware/roles')
const httpError = require('../utils/httpError')
const { ROLES, DRIVER_STATUS } = require('../config/constants')

const router = express.Router()
router.use(requireAuth)

const VALID_STATUSES = Object.values(DRIVER_STATUS)
const CAN_WRITE = [ROLES.SAFETY_OFFICER, ROLES.FLEET_MANAGER]

// GET /api/drivers?status=&licenseCategory=
router.get('/', (req, res) => {
  const { status, licenseCategory } = req.query
  let list = db.get('drivers').value()
  if (status) list = list.filter(d => d.status === status)
  if (licenseCategory) list = list.filter(d => d.licenseCategory === licenseCategory)
  res.json({ drivers: list })
})

router.get('/:id', (req, res, next) => {
  const driver = db.get('drivers').find({ id: req.params.id }).value()
  if (!driver) return next(httpError(404, 'Driver not found.'))
  res.json({ driver })
})

// POST /api/drivers — Safety Officer or Fleet Manager
router.post('/', requireRole(...CAN_WRITE), (req, res, next) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiry, contact, safetyScore } = req.body
    if (!name || !licenseNumber || !licenseCategory || !licenseExpiry) {
      throw httpError(400, 'name, licenseNumber, licenseCategory and licenseExpiry are required.')
    }
    const clash = db.get('drivers')
      .find(d => d.licenseNumber.toUpperCase() === String(licenseNumber).toUpperCase()).value()
    if (clash) throw httpError(409, `License number "${licenseNumber}" is already registered.`)

    const driver = {
      id: uuid(),
      name,
      licenseNumber: String(licenseNumber).toUpperCase(),
      licenseCategory,
      licenseExpiry, // ISO date string YYYY-MM-DD
      contact: contact || '',
      safetyScore: safetyScore !== undefined ? Number(safetyScore) : 100,
      status: DRIVER_STATUS.AVAILABLE
    }
    db.get('drivers').push(driver).write()
    res.status(201).json({ driver })
  } catch (err) { next(err) }
})

// PUT /api/drivers/:id — Safety Officer or Fleet Manager
router.put('/:id', requireRole(...CAN_WRITE), (req, res, next) => {
  try {
    const driver = db.get('drivers').find({ id: req.params.id }).value()
    if (!driver) throw httpError(404, 'Driver not found.')

    const { name, licenseNumber, licenseCategory, licenseExpiry, contact, safetyScore, status } = req.body

    if (licenseNumber && licenseNumber.toUpperCase() !== driver.licenseNumber) {
      const clash = db.get('drivers')
        .find(d => d.id !== driver.id && d.licenseNumber.toUpperCase() === String(licenseNumber).toUpperCase())
        .value()
      if (clash) throw httpError(409, `License number "${licenseNumber}" is already registered.`)
      driver.licenseNumber = String(licenseNumber).toUpperCase()
    }
    if (status && !VALID_STATUSES.includes(status)) {
      throw httpError(400, `status must be one of: ${VALID_STATUSES.join(', ')}`)
    }
    if (status && driver.status === DRIVER_STATUS.ON_TRIP && status !== DRIVER_STATUS.ON_TRIP) {
      throw httpError(409, 'Driver is currently on a dispatched trip. Complete or cancel the trip first.')
    }

    if (name) driver.name = name
    if (licenseCategory) driver.licenseCategory = licenseCategory
    if (licenseExpiry) driver.licenseExpiry = licenseExpiry
    if (contact !== undefined) driver.contact = contact
    if (safetyScore !== undefined) driver.safetyScore = Number(safetyScore)
    if (status) driver.status = status

    db.get('drivers').find({ id: req.params.id }).assign(driver).write()
    res.json({ driver })
  } catch (err) { next(err) }
})

// DELETE /api/drivers/:id
router.delete('/:id', requireRole(...CAN_WRITE), (req, res, next) => {
  try {
    const driver = db.get('drivers').find({ id: req.params.id }).value()
    if (!driver) throw httpError(404, 'Driver not found.')
    if (driver.status === DRIVER_STATUS.ON_TRIP) {
      throw httpError(409, 'Cannot delete a driver who is currently on a trip.')
    }
    db.get('drivers').remove({ id: req.params.id }).write()
    res.status(204).end()
  } catch (err) { next(err) }
})

module.exports = router

const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require('uuid')
const db = require('../config/db')
const requireAuth = require('../middleware/auth')
const httpError = require('../utils/httpError')
const { ROLES } = require('../config/constants')

const router = express.Router()

function sign(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  )
}

function publicUser(user) {
  const { passwordHash, ...rest } = user
  return rest
}

// POST /api/auth/login
router.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) throw httpError(400, 'Email and password are required.')

    const user = db.get('users').find({ email: String(email).toLowerCase() }).value()
    if (!user) throw httpError(401, 'Incorrect email or password.')

    const ok = bcrypt.compareSync(password, user.passwordHash)
    if (!ok) throw httpError(401, 'Incorrect email or password.')

    res.json({ token: sign(user), user: publicUser(user) })
  } catch (err) { next(err) }
})

// POST /api/auth/register — convenience endpoint for the hackathon demo so any
// role can be created without touching the seed file. In production this
// would typically be admin-only.
router.post('/register', (req, res, next) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password || !role) {
      throw httpError(400, 'name, email, password and role are all required.')
    }
    if (!Object.values(ROLES).includes(role)) {
      throw httpError(400, `role must be one of: ${Object.values(ROLES).join(', ')}`)
    }
    const normalizedEmail = String(email).toLowerCase()
    const exists = db.get('users').find({ email: normalizedEmail }).value()
    if (exists) throw httpError(409, 'An account with this email already exists.')

    const user = {
      id: uuid(),
      name,
      email: normalizedEmail,
      passwordHash: bcrypt.hashSync(password, 8),
      role
    }
    db.get('users').push(user).write()

    res.status(201).json({ token: sign(user), user: publicUser(user) })
  } catch (err) { next(err) }
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})

module.exports = router

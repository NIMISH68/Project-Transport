const jwt = require('jsonwebtoken')

function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header.' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload // { id, name, email, role }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or token invalid. Please sign in again.' })
  }
}

module.exports = requireAuth

// Usage: requireRole('fleet_manager', 'safety_officer')
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated.' })
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `This action requires one of the following roles: ${allowedRoles.join(', ')}.`
      })
    }
    next()
  }
}

module.exports = requireRole

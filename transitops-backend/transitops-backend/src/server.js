require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const { notFound, errorHandler } = require('./middleware/errorHandler')

const authRoutes = require('./routes/auth')
const vehicleRoutes = require('./routes/vehicles')
const driverRoutes = require('./routes/drivers')
const tripRoutes = require('./routes/trips')
const maintenanceRoutes = require('./routes/maintenance')
const fuelRoutes = require('./routes/fuel')
const expenseRoutes = require('./routes/expenses')
const dashboardRoutes = require('./routes/dashboard')
const reportRoutes = require('./routes/reports')

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'transitops-backend' }))

app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/drivers', driverRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/fuel-logs', fuelRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/reports', reportRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`TransitOps backend running on http://localhost:${PORT}`)
})

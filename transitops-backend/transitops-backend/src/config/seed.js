const bcrypt = require('bcryptjs')
const { v4: uuid } = require('uuid')
const db = require('./db')
const { ROLES, VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS } = require('./constants')

function hash(pw) {
  return bcrypt.hashSync(pw, 8)
}

function daysFromNow(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function seed() {
  if (db.get('users').size().value() > 0) {
    console.log('Database already seeded. Delete data/db.json to reseed.')
    return
  }

  const users = [
    { id: uuid(), name: 'Meera Holbrook', email: 'fleet.manager@transitops.dev', passwordHash: hash('password123'), role: ROLES.FLEET_MANAGER },
    { id: uuid(), name: 'Ravi Chaudhary', email: 'driver@transitops.dev', passwordHash: hash('password123'), role: ROLES.DRIVER },
    { id: uuid(), name: 'Nikhil Kapoor', email: 'safety.officer@transitops.dev', passwordHash: hash('password123'), role: ROLES.SAFETY_OFFICER },
    { id: uuid(), name: 'Ananya Verma', email: 'finance@transitops.dev', passwordHash: hash('password123'), role: ROLES.FINANCIAL_ANALYST }
  ]
  db.set('users', users).write()

  const vehicles = [
    { id: uuid(), regNumber: 'UP65-AT-3312', name: 'Tata 1109 Haulier', type: 'Heavy Haulier', maxLoadKg: 9000, odometerKm: 84210, acquisitionCost: 2200000, status: VEHICLE_STATUS.AVAILABLE, region: 'Varanasi' },
    { id: uuid(), regNumber: 'UP65-AT-2887', name: 'Ashok Leyland Reefer', type: 'Refrigerated', maxLoadKg: 6000, odometerKm: 41120, acquisitionCost: 1850000, status: VEHICLE_STATUS.AVAILABLE, region: 'Lucknow' },
    { id: uuid(), regNumber: 'UP65-AT-3390', name: 'Eicher Tanker', type: 'Tanker', maxLoadKg: 12000, odometerKm: 19040, acquisitionCost: 2600000, status: VEHICLE_STATUS.AVAILABLE, region: 'Varanasi' },
    { id: uuid(), regNumber: 'UP65-AT-2951', name: 'Mahindra Bolero Van', type: 'Light Van', maxLoadKg: 900, odometerKm: 132900, acquisitionCost: 650000, status: VEHICLE_STATUS.IN_SHOP, region: 'Kanpur' },
    { id: uuid(), regNumber: 'UP65-AT-4102', name: 'Tata Flatbed', type: 'Flatbed', maxLoadKg: 8000, odometerKm: 318760, acquisitionCost: 1900000, status: VEHICLE_STATUS.RETIRED, region: 'Prayagraj' }
  ]
  db.set('vehicles', vehicles).write()

  const drivers = [
    { id: uuid(), name: 'Ravi Chaudhary', licenseNumber: 'UP14-2021-0093', licenseCategory: 'HMV', licenseExpiry: daysFromNow(180), contact: '+91 98765 43210', safetyScore: 91, status: DRIVER_STATUS.AVAILABLE },
    { id: uuid(), name: 'Sunita Mehta', licenseNumber: 'UP32-2019-1187', licenseCategory: 'HMV', licenseExpiry: daysFromNow(400), contact: '+91 98111 22334', safetyScore: 88, status: DRIVER_STATUS.AVAILABLE },
    { id: uuid(), name: 'Arjun Verma', licenseNumber: 'UP14-2023-0441', licenseCategory: 'LMV', licenseExpiry: daysFromNow(-5), contact: '+91 99887 66554', safetyScore: 74, status: DRIVER_STATUS.AVAILABLE },
    { id: uuid(), name: 'Farhan Ali', licenseNumber: 'UP53-2020-0765', licenseCategory: 'HMV', licenseExpiry: daysFromNow(20), contact: '+91 90000 11122', safetyScore: 95, status: DRIVER_STATUS.SUSPENDED }
  ]
  db.set('drivers', drivers).write()

  db.set('trips', []).write()
  db.set('maintenanceLogs', []).write()
  db.set('fuelLogs', []).write()
  db.set('expenses', []).write()

  console.log('Seed complete. Demo logins (password: password123):')
  users.forEach(u => console.log(`  ${u.role.padEnd(18)} ${u.email}`))
}

seed()

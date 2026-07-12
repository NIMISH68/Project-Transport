const path = require('path')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const dbFile = path.join(__dirname, '..', '..', 'data', 'db.json')
const adapter = new FileSync(dbFile)
const db = low(adapter)

// Default shape — lowdb persists this to data/db.json on first run.
db.defaults({
  users: [],
  vehicles: [],
  drivers: [],
  trips: [],
  maintenanceLogs: [],
  fuelLogs: [],
  expenses: []
}).write()

module.exports = db

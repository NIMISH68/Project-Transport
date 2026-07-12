// Seed / mock data for TransitOps. In a real deployment these would be API-backed.

export const ROLES = {
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
}

export const USERS = [
  { id: 'u1', name: 'Eleanor Whitfield', email: 'eleanor@transitops.io', password: 'demo1234', role: ROLES.FLEET_MANAGER, region: 'Northern Depot' },
  { id: 'u2', name: 'Marcus Doyle', email: 'marcus@transitops.io', password: 'demo1234', role: ROLES.DISPATCHER, region: 'Northern Depot' },
  { id: 'u3', name: 'Priya Nathan', email: 'priya@transitops.io', password: 'demo1234', role: ROLES.SAFETY_OFFICER, region: 'Southern Depot' },
  { id: 'u4', name: 'Julian Cross', email: 'julian@transitops.io', password: 'demo1234', role: ROLES.FINANCIAL_ANALYST, region: 'Southern Depot' },
]

export const VEHICLE_TYPES = ['Van', 'Truck', 'Refrigerated Truck', 'Flatbed', 'Trailer']
export const VEHICLE_STATUS = ['Available', 'On Trip', 'In Shop', 'Retired']
export const REGIONS = ['Northern Depot', 'Southern Depot', 'Eastern Yard', 'Western Yard']

export const initialVehicles = [
  { id: 'v1', regNo: 'VAN-05', name: 'Ford Transit 350', type: 'Van', maxLoad: 500, odometer: 48210, cost: 3200000, status: 'Available', region: 'Northern Depot', acquired: '2022-03-14' },
  { id: 'v2', regNo: 'TRK-11', name: 'Volvo FH16', type: 'Truck', maxLoad: 12000, odometer: 132400, cost: 9800000, status: 'On Trip', region: 'Northern Depot', acquired: '2021-07-02' },
  { id: 'v3', regNo: 'RFT-02', name: 'Mercedes Actros Reefer', type: 'Refrigerated Truck', maxLoad: 8000, odometer: 76300, cost: 8600000, status: 'In Shop', region: 'Southern Depot', acquired: '2020-11-19' },
  { id: 'v4', regNo: 'FLB-07', name: 'Scania Flatbed R500', type: 'Flatbed', maxLoad: 15000, odometer: 98040, cost: 7100000, status: 'Available', region: 'Eastern Yard', acquired: '2019-05-30' },
  { id: 'v5', regNo: 'VAN-09', name: 'Mercedes Sprinter', type: 'Van', maxLoad: 650, odometer: 21050, cost: 3550000, status: 'Available', region: 'Southern Depot', acquired: '2023-01-10' },
  { id: 'v6', regNo: 'TRL-03', name: 'Kogel Box Trailer', type: 'Trailer', maxLoad: 20000, odometer: 154200, cost: 4200000, status: 'Retired', region: 'Western Yard', acquired: '2016-09-08' },
  { id: 'v7', regNo: 'TRK-14', name: 'MAN TGX 18', type: 'Truck', maxLoad: 11500, odometer: 61870, cost: 9100000, status: 'On Trip', region: 'Eastern Yard', acquired: '2022-10-21' },
  { id: 'v8', regNo: 'VAN-12', name: 'Ford Transit Custom', type: 'Van', maxLoad: 450, odometer: 15300, cost: 2900000, status: 'Available', region: 'Western Yard', acquired: '2023-06-02' },
]

export const DRIVER_STATUS = ['Available', 'On Trip', 'Off Duty', 'Suspended']

export const initialDrivers = [
  { id: 'd1', name: 'Alex Renner', licenseNo: 'LIC-88213', category: 'Heavy Goods', expiry: '2027-04-12', contact: '+91 98200 11223', safetyScore: 92, status: 'Available', region: 'Northern Depot' },
  { id: 'd2', name: 'Sofia Marchetti', licenseNo: 'LIC-77012', category: 'Light Goods', expiry: '2026-08-30', contact: '+91 98200 33445', safetyScore: 88, status: 'On Trip', region: 'Northern Depot' },
  { id: 'd3', name: 'Devraj Malhotra', licenseNo: 'LIC-65920', category: 'Heavy Goods', expiry: '2025-12-01', contact: '+91 98200 55667', safetyScore: 74, status: 'Available', region: 'Southern Depot' },
  { id: 'd4', name: 'Naomi Osei', licenseNo: 'LIC-99120', category: 'Refrigerated', expiry: '2026-11-05', contact: '+91 98200 77889', safetyScore: 95, status: 'Off Duty', region: 'Southern Depot' },
  { id: 'd5', name: 'Thiago Alvez', licenseNo: 'LIC-40118', category: 'Heavy Goods', expiry: '2026-02-18', contact: '+91 98200 99001', safetyScore: 61, status: 'Suspended', region: 'Eastern Yard' },
  { id: 'd6', name: 'Isabelle Fontaine', licenseNo: 'LIC-30298', category: 'Light Goods', expiry: '2027-01-22', contact: '+91 98200 12121', safetyScore: 90, status: 'On Trip', region: 'Eastern Yard' },
  { id: 'd7', name: 'Rowan Blackwood', licenseNo: 'LIC-51884', category: 'Heavy Goods', expiry: '2026-06-09', contact: '+91 98200 34343', safetyScore: 85, status: 'Available', region: 'Western Yard' },
]

export const TRIP_STATUS = ['Draft', 'Dispatched', 'Completed', 'Cancelled']

export const initialTrips = [
  { id: 't1', source: 'Varanasi Depot', destination: 'Lucknow Hub', vehicleId: 'v2', driverId: 'd2', cargoWeight: 9800, distance: 320, status: 'Dispatched', createdAt: '2026-07-08', finalOdometer: null, fuelConsumed: null },
  { id: 't2', source: 'Chennai Yard', destination: 'Bengaluru Depot', vehicleId: 'v7', driverId: 'd6', cargoWeight: 7200, distance: 350, status: 'Dispatched', createdAt: '2026-07-09', finalOdometer: null, fuelConsumed: null },
  { id: 't3', source: 'Delhi Hub', destination: 'Jaipur Depot', vehicleId: 'v1', driverId: 'd1', cargoWeight: 420, distance: 280, status: 'Completed', createdAt: '2026-07-01', finalOdometer: 48210, fuelConsumed: 38 },
  { id: 't4', source: 'Pune Yard', destination: 'Mumbai Port', vehicleId: 'v5', driverId: 'd3', cargoWeight: 300, distance: 150, status: 'Draft', createdAt: '2026-07-11', finalOdometer: null, fuelConsumed: null },
  { id: 't5', source: 'Kolkata Depot', destination: 'Bhubaneswar Hub', vehicleId: 'v4', driverId: 'd7', cargoWeight: 11200, distance: 440, status: 'Completed', createdAt: '2026-06-24', finalOdometer: 97600, fuelConsumed: 152 },
  { id: 't6', source: 'Hyderabad Yard', destination: 'Nagpur Depot', vehicleId: 'v3', driverId: 'd4', cargoWeight: 6100, distance: 500, status: 'Cancelled', createdAt: '2026-06-18', finalOdometer: null, fuelConsumed: null },
]

export const initialMaintenance = [
  { id: 'm1', vehicleId: 'v3', type: 'Engine Overhaul', description: 'Turbocharger replacement and diagnostics', cost: 84000, openedAt: '2026-07-05', closedAt: null, status: 'Open' },
  { id: 'm2', vehicleId: 'v6', type: 'Decommission Inspection', description: 'Final inspection before retirement', cost: 12000, openedAt: '2026-05-02', closedAt: '2026-05-10', status: 'Closed' },
  { id: 'm3', vehicleId: 'v1', type: 'Oil Change', description: 'Routine oil and filter change', cost: 4200, openedAt: '2026-06-28', closedAt: '2026-06-29', status: 'Closed' },
  { id: 'm4', vehicleId: 'v4', type: 'Brake Service', description: 'Brake pad replacement, all axles', cost: 21500, openedAt: '2026-06-14', closedAt: '2026-06-16', status: 'Closed' },
]

export const initialFuelLogs = [
  { id: 'f1', vehicleId: 'v2', liters: 210, cost: 19800, date: '2026-07-08' },
  { id: 'f2', vehicleId: 'v7', liters: 180, cost: 17100, date: '2026-07-09' },
  { id: 'f3', vehicleId: 'v1', liters: 38, cost: 3610, date: '2026-07-01' },
  { id: 'f4', vehicleId: 'v4', liters: 152, cost: 14440, date: '2026-06-24' },
  { id: 'f5', vehicleId: 'v5', liters: 44, cost: 4180, date: '2026-06-20' },
  { id: 'f6', vehicleId: 'v8', liters: 30, cost: 2850, date: '2026-06-19' },
]

export const initialExpenses = [
  { id: 'e1', vehicleId: 'v2', category: 'Toll', amount: 2400, date: '2026-07-08', note: 'NH-19 toll plaza' },
  { id: 'e2', vehicleId: 'v7', category: 'Toll', amount: 1800, date: '2026-07-09', note: 'Chennai bypass toll' },
  { id: 'e3', vehicleId: 'v4', category: 'Permit', amount: 5200, date: '2026-06-24', note: 'Interstate permit renewal' },
  { id: 'e4', vehicleId: 'v1', category: 'Parking', amount: 300, date: '2026-07-01', note: 'Jaipur depot parking' },
]

// Approximate revenue per completed trip for ROI computation (mock — would come from billing in production)
export const tripRevenue = {
  t3: 68000,
  t5: 210000,
}

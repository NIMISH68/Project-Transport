import { ROLES } from '../data/seed'

// Maps each role to the actions it may perform. Every role can view every page —
// RBAC here governs mutating actions, consistent with the brief's four personas.
export const PERMISSIONS = {
  [ROLES.FLEET_MANAGER]: ['manage_vehicles', 'manage_maintenance', 'view_reports', 'manage_trips'],
  [ROLES.DISPATCHER]: ['manage_trips', 'view_reports'],
  [ROLES.SAFETY_OFFICER]: ['manage_drivers', 'view_reports'],
  [ROLES.FINANCIAL_ANALYST]: ['manage_expenses', 'view_reports'],
}

export function can(role, action) {
  return PERMISSIONS[role]?.includes(action) ?? false
}

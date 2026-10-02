export const WORKSPACE_PAGES = new Set([
  'operator', 'admin', 'admin-add-train', 'admin-edit-train',
  'admin-assign-trip', 'admin-cancellations', 'admin-operator-approvals',
])

export function workspaceFor(user) {
  if (user?.role === 'ADMIN') return { page: 'admin', label: 'Admin workspace', icon: 'grid' }
  if (user?.role === 'OPERATOR') return { page: 'operator', label: 'Operator console', icon: 'signal' }
  return null
}

export const WORKSPACE_NAV = {
  ADMIN: [
    { group: 'Overview', items: [['admin', 'Operations overview', 'grid']] },
    { group: 'Operations', items: [['admin-assign-trip', 'Trips & trainsets', 'layers']] },
    { group: 'Train management', items: [['admin-add-train', 'Add train service', 'plus'], ['admin-edit-train', 'Edit train', 'settings']] },
    { group: 'Requests', items: [['admin-cancellations', 'Cancellations', 'receipt'], ['admin-operator-approvals', 'Operator approvals', 'userCheck']] },
  ],
  OPERATOR: [
    { group: 'Operations', items: [['operator', 'Station console', 'signal']] },
    { group: 'Network', items: [['track', 'Track a train', 'route'], ['notifications', 'Notifications', 'bell']] },
  ],
}

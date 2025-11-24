// Constantes de la aplicación
export const ROLES = {
  CUSTOMER: 'cliente',
  VENDOR: 'vendedor',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
}

export const PRODUCT_CATEGORIES = [
  'Manga',
  'Anime',
  'Figuras',
  'Merchandising',
  'Libros',
  'Ropa',
  'Accesorios',
]

export const ORDER_STATUS = {
  PENDING: 'pendiente',
  PROCESSING: 'procesando',
  SHIPPED: 'enviado',
  DELIVERED: 'entregado',
  CANCELLED: 'cancelado',
}

export const PAYMENT_STATUS = {
  PENDING: 'pendiente',
  PAID: 'pagado',
  FAILED: 'fallido',
  REFUNDED: 'reembolsado',
}

export const TOAST_DURATION = 3000

export const DEBOUNCE_DELAY = 500

export const PAGINATION_LIMIT = 12

export const API_TIMEOUT = 10000

// URLs de API (será sobrescrita por VITE_API_BASE_URL)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// Rutas públicas
export const PUBLIC_ROUTES = [
  '/',
  '/productos',
  '/login',
  '/registro',
  '/conocenos',
]

// Rutas protegidas
export const PROTECTED_ROUTES = {
  [ROLES.CUSTOMER]: ['/cliente/dashboard'],
  [ROLES.VENDOR]: ['/vendedor/dashboard'],
  [ROLES.ADMIN]: ['/admin/dashboard'],
  [ROLES.SUPERADMIN]: ['/superadmin/dashboard'],
}

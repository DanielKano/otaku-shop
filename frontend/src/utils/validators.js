/**
 * 🎯 VALIDADORES MEJORADOS CON MENSAJES CLAROS
 */

// NOMBRE COMPLETO - Con validaciones avanzadas
export const validateName = (name) => {
  const errors = []
  const trimmed = name.trim()

  if (!trimmed) {
    errors.push('El nombre es requerido')
    return { isValid: false, errors }
  }

  if (trimmed.length < 3) {
    errors.push('El nombre debe tener al menos 3 caracteres')
  }
  if (trimmed.length > 50) {
    errors.push('El nombre no puede exceder 50 caracteres')
  }
  if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s\-']+$/.test(trimmed)) {
    errors.push('Solo letras, espacios, guiones y apóstrofes permitidos')
  }
  if (/\s{2,}/.test(trimmed)) {
    errors.push('No se permiten espacios múltiples')
  }

  // Validar que tenga al menos 2 palabras (nombre y apellido)
  const words = trimmed.split(/\s+/).filter(w => w.length > 0)
  if (words.length < 2) {
    errors.push('Ingresa nombre y apellido (mínimo 2 palabras)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// EMAIL - Con validaciones de dominio
export const validateEmail = (email) => {
  const errors = []
  const trimmed = email.trim().toLowerCase()
  const allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'otaku.com', 'otakushop.com']

  if (!trimmed) {
    errors.push('El email es requerido')
    return { isValid: false, errors }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    errors.push('Formato de email inválido')
  }

  // Validar dominio permitido
  const [, domain] = trimmed.split('@') || []
  if (domain && !allowedDomains.includes(domain)) {
    errors.push(`Solo se permiten: ${allowedDomains.join(', ')}`)
  }

  if (trimmed.includes('..')) {
    errors.push('El email no puede tener puntos consecutivos')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// TELÉFONO COLOMBIANO - Con validación de prefijo
export const validatePhone = (phone) => {
  const errors = []
  let normalized = phone.replace(/[^\d]/g, '')

  // Remover prefijo 57 si existe
  if (normalized.startsWith('57') && normalized.length === 12) {
    normalized = normalized.slice(2)
  }

  if (!normalized) {
    errors.push('El teléfono es requerido')
    return { isValid: false, errors }
  }

  if (normalized.length !== 10) {
    errors.push('El teléfono debe tener exactamente 10 dígitos')
  }

  // Prefijos válidos de operadores colombianos
  const validPrefixes = ['300', '301', '302', '303', '304', '305', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321']
  const prefix = normalized.slice(0, 3)
  
  if (normalized.length === 10 && !validPrefixes.includes(prefix)) {
    errors.push('Prefijo no válido para operadores colombianos')
  }

  // Validar que no sea una secuencia obvia
  if (/^(.)\1{3,}$/.test(normalized)) {
    errors.push('El número parece inválido (números repetidos)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// CONTRASEÑA - Con indicador de fortaleza
export const validatePassword = (password) => {
  const errors = []

  if (!password) {
    errors.push('La contraseña es requerida')
    return { isValid: false, errors, strength: 0 }
  }

  const hasMinLength = password.length >= 8
  const hasMaxLength = password.length <= 32
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[@$!%*?&_\-+=#]/.test(password)
  const hasNoSpaces = !/\s/.test(password)

  if (!hasMinLength) errors.push('Mínimo 8 caracteres')
  if (!hasMaxLength) errors.push('Máximo 32 caracteres')
  if (!hasUppercase) errors.push('Debe incluir mayúscula (A-Z)')
  if (!hasLowercase) errors.push('Debe incluir minúscula (a-z)')
  if (!hasNumber) errors.push('Debe incluir número (0-9)')
  if (!hasSpecial) errors.push('Debe incluir símbolo especial (@$!%*?&_-+=#)')
  if (!hasNoSpaces) errors.push('No se permiten espacios')

  // Calcular fortaleza (0-5)
  let strength = 0
  if (hasMinLength) strength++
  if (hasUppercase && hasLowercase) strength++
  if (hasNumber) strength++
  if (hasSpecial) strength++
  if (hasNoSpaces && password.length >= 12) strength++

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    minLength: hasMinLength,
    uppercase: hasUppercase,
    lowercase: hasLowercase,
    number: hasNumber,
    special: hasSpecial,
  }
}

// URL - Validación básica
export const validateURL = (url) => {
  const errors = []
  
  if (!url) {
    errors.push('La URL es requerida')
    return { isValid: false, errors }
  }

  try {
    new URL(url)
    return { isValid: true, errors }
  } catch {
    errors.push('Formato de URL inválido')
    return { isValid: false, errors }
  }
}

// PRECIO - Con rango validado
export const validatePrice = (price) => {
  const errors = []
  const num = parseFloat(price)

  if (!price) {
    errors.push('El precio es requerido')
    return { isValid: false, errors }
  }

  if (isNaN(num)) {
    errors.push('El precio debe ser un número válido')
    return { isValid: false, errors }
  }

  if (num <= 0) {
    errors.push('El precio debe ser mayor a 0')
  }

  if (num < 5) {
    errors.push('Precio mínimo permitido: $5')
  }

  if (num > 1000000) {
    errors.push('Precio máximo permitido: $1,000,000')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

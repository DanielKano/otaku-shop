/**
 * 🎯 VALIDADORES MEJORADOS CON MENSAJES CLAROS
 */

// NOMBRE COMPLETO - Con validaciones avanzadas
export const validateName = (name) => {
  const errors = []
  const trimmed = name.trim()

  if (!trimmed) {
    errors.push('⚠️ El nombre es requerido - Por favor ingresa tu nombre completo')
    return { isValid: false, errors }
  }

  if (trimmed.length < 3) {
    errors.push('❌ Nombre muy corto - Debe tener al menos 3 caracteres (ej: "Ana", "Luis")')
  }
  
  if (trimmed.length > 50) {
    errors.push('❌ Nombre muy largo - No puede exceder 50 caracteres')
  }
  
  // Validar caracteres especiales
  if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s\-']+$/.test(trimmed)) {
    errors.push("❌ Caracteres inválidos - Solo se permiten: letras, espacios, guiones (-) y apóstrofes (')")
  }
  
  if (/\s{2,}/.test(trimmed)) {
    errors.push('❌ Espacios múltiples - No se permiten espacios consecutivos (ej: "Juan  Pérez")')
  }

  // Validar que tenga al menos 2 palabras (nombre y apellido)
  const words = trimmed.split(/\s+/).filter(w => w.length > 0)
  if (words.length < 2) {
    errors.push('👤 Nombre incompleto - Ingresa nombre Y apellido (ej: "Juan Pérez", no solo "Juan")')
  }

  // Validar que cada palabra tenga al menos 2 caracteres (excepto nombres especiales)
  const shortWords = words.filter(w => w.length < 2)
  if (shortWords.length > 0) {
    errors.push(`⚠️ Palabras muy cortas - Todas las palabras deben tener mínimo 2 caracteres. Verifica: "${shortWords.join(', ')}"`)
  }

  // Detectar patrones sospechosos
  if (/^(.)\1{2,}/.test(trimmed.replace(/\s/g, ''))) {
    errors.push('❌ Caracteres repetidos - El nombre contiene demasiados caracteres iguales (ej: "AAA")')
  }

  // Detectar solo números
  if (/^\d+\s*\d*$/.test(trimmed)) {
    errors.push('❌ Solo números - El nombre no puede ser solo números')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// EMAIL - Con validaciones de dominio y mensajes detallados
export const validateEmail = (email) => {
  const errors = []
  const trimmed = email.trim().toLowerCase()
  const allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'otaku.com', 'otakushop.com']

  if (!trimmed) {
    errors.push('⚠️ El email es requerido - Por favor ingresa tu correo electrónico')
    return { isValid: false, errors }
  }

  // Validación de formato básico
  if (!trimmed.includes('@')) {
    errors.push('❌ Falta el símbolo @ - Formato válido: usuario@ejemplo.com')
  }

  if (!trimmed.includes('.')) {
    errors.push('❌ Falta el punto (.) - El dominio debe tener un punto (ej: gmail.com)')
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    errors.push('❌ Formato de email inválido - Verifica que sea: usuario@dominio.com')
  }

  // Validar dominio específicamente
  const parts = trimmed.split('@')
  const [localPart, domain] = parts
  
  if (parts.length !== 2) {
    errors.push('❌ Email con múltiples @ - Solo debe haber un símbolo @')
  }

  if (localPart && localPart.length < 3) {
    errors.push('⚠️ Usuario muy corto - La parte antes de @ debe tener al menos 3 caracteres')
  }

  if (domain) {
    // Validar si el dominio está en la lista de permitidos
    if (!allowedDomains.includes(domain)) {
      const suggestion = domain.replace(/^(g|h|o|y|a|t|w|gm|ho|ya|gmai|hotmai|outlok|yaho)/, '')
      errors.push(`🚫 Dominio no permitido: "${domain}" - Solo se permiten estos: gmail.com, hotmail.com, outlook.com, yahoo.com`)
    }

    // Validar que no tenga puntos consecutivos
    if (domain.includes('..')) {
      errors.push('❌ Puntos consecutivos - El email no puede tener ".." (ej: user..name@gmail.com)')
    }

    // Validar que comience o termine con punto
    if (domain.startsWith('.') || domain.endsWith('.')) {
      errors.push('❌ Punto al inicio/final - El dominio no puede comenzar o terminar con punto')
    }
  }

  // Validar que no tenga espacios
  if (trimmed.includes(' ')) {
    errors.push('❌ Espacios en el email - Los emails no pueden contener espacios')
  }

  // Validar caracteres inválidos
  if (!/^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(trimmed)) {
    if (!errors.some(e => e.includes('inválido'))) {
      errors.push('❌ Caracteres no permitidos en el email - Solo: letras, números, punto, guion y guion bajo')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// TELÉFONO COLOMBIANO - Con validación de prefijo y mensajes detallados
export const validatePhone = (phone) => {
  const errors = []
  let normalized = phone.replace(/[^\d]/g, '')

  // Remover prefijo 57 si existe
  if (normalized.startsWith('57') && normalized.length === 12) {
    normalized = normalized.slice(2)
  }

  if (!normalized) {
    errors.push('⚠️ El teléfono es requerido - Por favor ingresa tu número de celular')
    return { isValid: false, errors }
  }

  if (normalized.length !== 10) {
    errors.push(`❌ Longitud incorrecta - Debe tener 10 dígitos, has ingresado ${normalized.length}`)
  }

  // Prefijos válidos de operadores colombianos
  const validPrefixes = ['300', '301', '302', '303', '304', '305', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321']
  const prefix = normalized.slice(0, 3)
  
  if (normalized.length === 10 && !validPrefixes.includes(prefix)) {
    errors.push(`🚫 Prefijo inválido "${prefix}" - Operadores válidos: Claro (300-305), Movistar (310-319), Tigo (320-321)`)
  }

  // Validar que no sea una secuencia obvia
  if (/^(.)\1{3,}$/.test(normalized)) {
    errors.push('❌ Números repetidos - El teléfono tiene demasiados dígitos iguales (ej: "3000000000")')
  }

  // Validar secuencias obvias
  if (/0123456789|1234567890|9876543210|1111111111|2222222222|3333333333|4444444444|5555555555|6666666666|7777777777|8888888888|9999999999/.test(normalized)) {
    errors.push('⚠️ Número sospechoso - El teléfono parece ser una secuencia. ¿Es correcto?')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// CONTRASEÑA - Con indicador de fortaleza y mensajes claros
export const validatePassword = (password) => {
  const errors = []

  if (!password) {
    errors.push('⚠️ La contraseña es requerida - Por favor crea una contraseña segura')
    return { isValid: false, errors, strength: 0 }
  }

  const hasMinLength = password.length >= 8
  const hasMaxLength = password.length <= 32
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[@$!%*?&_\-+=#]/.test(password)
  const hasNoSpaces = !/\s/.test(password)

  // Mensajes más claros para cada requisito
  if (!hasMinLength) {
    errors.push(`❌ Muy corta - Mínimo 8 caracteres (tienes ${password.length})`)
  }
  if (!hasMaxLength) {
    errors.push(`❌ Muy larga - Máximo 32 caracteres (tienes ${password.length})`)
  }
  if (!hasUppercase) {
    errors.push('❌ Falta mayúscula - Incluye al menos una letra en MAYÚSCULA (A-Z)')
  }
  if (!hasLowercase) {
    errors.push('❌ Falta minúscula - Incluye al menos una letra en minúscula (a-z)')
  }
  if (!hasNumber) {
    errors.push('❌ Falta número - Incluye al menos un número (0-9)')
  }
  if (!hasSpecial) {
    errors.push('❌ Falta símbolo - Incluye al menos uno: @ $ ! % * ? & _ - + = #')
  }
  if (!hasNoSpaces) {
    errors.push('❌ Contiene espacios - Las contraseñas no pueden tener espacios')
  }

  // Validaciones adicionales de seguridad
  const commonPasswords = ['password', 'contraseña', 'admin', 'qwerty', '123456', 'password123', 'abc123']
  if (commonPasswords.some(p => password.toLowerCase().includes(p))) {
    errors.push('⚠️ Contraseña común - Evita palabras comunes o secuencias obvias')
  }

  // Calcular fortaleza (0-5)
  let strength = 0
  if (hasMinLength) strength++
  if (hasUppercase && hasLowercase) strength++
  if (hasNumber) strength++
  if (hasSpecial) strength++
  if (hasNoSpaces && password.length >= 12) strength++

  const strengthLabels = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte', 'Excelente']
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
    strengthLabel: strengthLabels[strength] || 'Muy débil',
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
    errors.push('⚠️ La URL es requerida - Por favor ingresa la dirección web')
    return { isValid: false, errors }
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    errors.push('❌ Falta protocolo - Comienza con "http://" o "https://"')
  }

  try {
    new URL(url)
    return { isValid: true, errors }
  } catch {
    errors.push('❌ Formato de URL inválido - Ejemplo válido: https://ejemplo.com/imagen.jpg')
    return { isValid: false, errors }
  }
}

// PRECIO - Con rango validado y mensajes claros
export const validatePrice = (price) => {
  const errors = []
  const num = parseFloat(price)

  if (!price) {
    errors.push('⚠️ El precio es requerido - Por favor ingresa el precio del producto')
    return { isValid: false, errors }
  }

  if (isNaN(num)) {
    errors.push('❌ Precio inválido - Debe ser un número (ej: 99.99, 150, 45.50)')
    return { isValid: false, errors }
  }

  if (num <= 0) {
    errors.push('❌ Precio no válido - Debe ser mayor a 0')
  }

  if (num < 5) {
    errors.push(`⚠️ Precio muy bajo - Mínimo permitido: $5 (ingresaste: $${num})`)
  }

  if (num > 1000000) {
    errors.push(`❌ Precio muy alto - Máximo permitido: $1,000,000 (ingresaste: $${num.toLocaleString()})`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

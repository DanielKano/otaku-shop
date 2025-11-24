// Validadores de formulario
export const validateName = (name) => {
  return name.length >= 3 && name.length <= 50 && /^[a-zA-Z\s]+$/.test(name)
}

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validatePhone = (phone) => {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''))
}

export const validatePassword = (password) => {
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[@$!%*?&]/.test(password)

  return {
    isValid: hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial,
    minLength: hasMinLength,
    uppercase: hasUppercase,
    lowercase: hasLowercase,
    number: hasNumber,
    special: hasSpecial,
  }
}

export const validateURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validatePrice = (price) => {
  const num = parseFloat(price)
  return !isNaN(num) && num > 0
}

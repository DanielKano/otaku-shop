import { useState } from 'react'
import Button from '../ui/Button'
import services from '../../services'

const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'cliente',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Calculador de requisitos de contraseña (solo visual)
  const getPasswordRequirements = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
    }
  }

  // Validadores en tiempo real
  const validators = {
    name: (value) => {
      const errors = []
      if (!value) return { isValid: false, errors: ['Campo requerido'] }
      if (value.trim() === '') return { isValid: false, errors: ['No puede contener solo espacios'] }

      const trimmedValue = value.trim()

      if (trimmedValue.length < 3) errors.push('Mínimo 3 caracteres')
      if (trimmedValue.length > 50) errors.push('Máximo 50 caracteres')

      const nameRegex = /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/
      if (!nameRegex.test(trimmedValue)) {
        errors.push('Solo letras, espacios, guiones y apóstrofes')
      }

      if (/\s{2,}/.test(trimmedValue)) errors.push('No se permiten espacios consecutivos')
      if (/\-{2,}/.test(trimmedValue)) errors.push('No se permiten guiones consecutivos')
      if (/'{2,}/.test(trimmedValue)) errors.push('No se permiten apóstrofes consecutivas')

      if (/^[\s\-']/.test(trimmedValue)) errors.push('No puede comenzar con espacio, guión o apóstrofe')
      if (/[\s\-']$/.test(trimmedValue)) errors.push('No puede terminar con espacio, guión o apóstrofe')

      const words = trimmedValue.split(/[\s\-]+/).filter(w => w.length > 0)
      if (words.length < 2) errors.push('Debe incluir nombre y apellido (mínimo 2 palabras)')
      if (words.some(word => word.length < 2)) errors.push('Cada palabra debe tener mínimo 2 caracteres')
      if (words.some(word => word && !/^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ]/.test(word))) {
        errors.push('Cada palabra debe comenzar con una letra')
      }
      if (/(.)\1{2,}/.test(trimmedValue)) {
        errors.push('No se permiten letras repetidas consecutivamente (ej: "aaa")')
      }

      // Nueva validación: debe contener al menos una vocal y una consonante
      const hasVowel = /[aeiouáéíóúüAEIOUÁÉÍÓÚÜ]/.test(trimmedValue)
      const hasConsonant = /[bcdfghjklmnñpqrstvwxyzBCDFGHJKLMNÑPQRSTVWXYZ]/.test(trimmedValue)
      if (!hasVowel || !hasConsonant) {
        errors.push('Debe contener al menos una vocal y una consonante')
      }

      return { isValid: errors.length === 0, errors }
    },
    email: (value) => {
      const errors = []
      if (!value) return { isValid: false, errors: ['Campo requerido'] }
      const allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'otaku.com', 'otakushop.com']
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) errors.push('Email con formato inválido')
      const domain = value.split('@')[1]
      if (domain && !allowedDomains.includes(domain)) errors.push(`Dominio no permitido. Usa: ${allowedDomains.join(', ')}`)
      return { isValid: errors.length === 0, errors }
    },
    phone: (value) => {
      const errors = []
      if (!value) return { isValid: true, errors: [] } // Opcional
      const cleanPhone = value.replace(/\D/g, '')
      if (cleanPhone.length !== 10) errors.push('Debe tener 10 dígitos (sin caracteres especiales)')
      const colombianPrefixes = ['300', '301', '302', '303', '304', '305', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323']
      const prefix = cleanPhone.slice(0, 3)
      if (cleanPhone.length === 10 && !colombianPrefixes.includes(prefix)) errors.push(`Prefijo inválido. Prefijos válidos: ${colombianPrefixes.slice(0, 5).join(', ')}...`)
      return { isValid: errors.length === 0, errors }
    },
    password: (value) => {
      const errors = []
      if (!value) return { isValid: false, errors: ['Campo requerido'] }
      if (value.length < 6) errors.push('Mínimo 6 caracteres')
      if (/\s/.test(value)) errors.push('No se permiten espacios')
      return { isValid: errors.length === 0, errors }
    },
    confirmPassword: (value, password) => {
      const errors = []
      if (!value) return { isValid: false, errors: ['Campo requerido'] }
      if (value !== password) errors.push('Las contraseñas no coinciden')
      return { isValid: errors.length === 0, errors }
    },
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError('')

    // Validar en tiempo real
    if (name === 'confirmPassword') {
      const validation = validators[name](value, formData.password)
      setFieldErrors(prev => ({
        ...prev,
        [name]: validation.errors
      }))
    } else if (validators[name]) {
      const validation = validators[name](value)
      setFieldErrors(prev => ({
        ...prev,
        [name]: validation.errors
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validación
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos requeridos')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const response = await services.authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
        role: formData.role,
      })

      onUserCreated(response.data)
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'cliente',
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-effect rounded-xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto border border-neon-purple/30 animate-fade-in"
           style={{ animationDelay: '0.1s' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Crear Nuevo Usuario
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
              👤 Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border text-sm rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.name?.length > 0 
                  ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' 
                  : formData.name && fieldErrors.name?.length === 0
                  ? 'border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="Juan María García López"
              required
            />
            {fieldErrors.name && fieldErrors.name.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {fieldErrors.name.map((err, idx) => (
                  <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                    ✗ {err}
                  </p>
                ))}
              </div>
            )}
            {formData.name && fieldErrors.name?.length === 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Válido</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ej: María José López Rodríguez (3-50 caracteres)
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.email?.length > 0 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="usuario@gmail.com"
              required
            />
            {fieldErrors.email && fieldErrors.email.length > 0 && (
              <div className="mt-2 space-y-1">
                {fieldErrors.email.map((err, idx) => (
                  <p key={idx} className="text-sm text-red-600 dark:text-red-400">
                    ✗ {err}
                  </p>
                ))}
              </div>
            )}
            {formData.email && fieldErrors.email?.length === 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ Email válido</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              💡 Dominios permitidos: Gmail, Hotmail, Outlook, Yahoo, Otaku
            </p>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono <span className="text-gray-400">(Opcional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.phone?.length > 0 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="300 1234567"
            />
            {fieldErrors.phone && fieldErrors.phone.length > 0 && (
              <div className="mt-2 space-y-1">
                {fieldErrors.phone.map((err, idx) => (
                  <p key={idx} className="text-sm text-red-600 dark:text-red-400">
                    ✗ {err}
                  </p>
                ))}
              </div>
            )}
            {formData.phone && fieldErrors.phone?.length === 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ Teléfono válido</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              💡 Teléfono colombiano (10 dígitos, prefijos 300-323)
            </p>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cliente">👤 Cliente - Acceso a compra de productos</option>
              <option value="vendedor">🏪 Vendedor - Gestión de productos propios</option>
              <option value="admin">⚙️ Admin - Gestión global de contenidos</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              💡 Define los permisos del usuario en el sistema
            </p>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
              🔐 Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border text-sm rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.password?.length > 0 
                  ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="••••••••"
              required
            />
            {fieldErrors.password && fieldErrors.password.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {fieldErrors.password.map((err, idx) => (
                  <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                    ✗ {err}
                  </p>
                ))}
              </div>
            )}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  <div className={`flex items-center gap-1 ${getPasswordRequirements(formData.password).length ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {getPasswordRequirements(formData.password).length ? '✓' : '○'} 8+ caracteres
                  </div>
                  <div className={`flex items-center gap-1 ${getPasswordRequirements(formData.password).uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {getPasswordRequirements(formData.password).uppercase ? '✓' : '○'} Mayúscula
                  </div>
                  <div className={`flex items-center gap-1 ${getPasswordRequirements(formData.password).lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {getPasswordRequirements(formData.password).lowercase ? '✓' : '○'} Minúscula
                  </div>
                  <div className={`flex items-center gap-1 ${getPasswordRequirements(formData.password).number ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {getPasswordRequirements(formData.password).number ? '✓' : '○'} Número
                  </div>
                  <div className={`col-span-2 flex items-center gap-1 ${getPasswordRequirements(formData.password).special ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {getPasswordRequirements(formData.password).special ? '✓' : '○'} Carácter especial (!@#$%...)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmar Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
                fieldErrors.confirmPassword?.length > 0 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              placeholder="••••••••"
              required
            />
            {fieldErrors.confirmPassword && fieldErrors.confirmPassword.length > 0 && (
              <div className="mt-2 space-y-1">
                {fieldErrors.confirmPassword.map((err, idx) => (
                  <p key={idx} className="text-sm text-red-600 dark:text-red-400">
                    ✗ {err}
                  </p>
                ))}
              </div>
            )}
            {formData.confirmPassword && fieldErrors.confirmPassword?.length === 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ Contraseñas coinciden</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              💡 Debe coincidir exactamente con la contraseña anterior
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateUserModal

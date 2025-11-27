import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../ui/Button'
import ValidatedInput from '../ui/ValidatedInput'
import PasswordStrengthIndicator from '../ui/PasswordStrengthIndicator'
import Alert from '../ui/Alert'
import {
  validateEmail,
  validatePhone,
  validatePassword,
} from '../../utils/validation/validators';

const validateFullName = (value) => {
  const errors = []
  if (!value) return { ok: false, errors: ['Campo requerido'] }
  if (value.trim() === '') return { ok: false, errors: ['No puede contener solo espacios'] }

  const trimmedValue = value.trim()

  if (trimmedValue.length < 3) errors.push('Mínimo 3 caracteres')
  if (trimmedValue.length > 50) errors.push('Máximo 50 caracteres')

  const nameRegex = /^[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\-']+$/
  if (!nameRegex.test(trimmedValue)) {
    errors.push('Solo letras, espacios, guiones y apóstrofes')
  }

  if (/\s{2,}/.test(trimmedValue)) errors.push('No se permiten espacios consecutivos')
  if (/\-{2,}/.test(trimmedValue)) errors.push('No se permiten guiones consecutivos')
  if (/'{2,}/.test(trimmedValue)) errors.push('No se permiten apóstrofes consecutivos')

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

  return { ok: errors.length === 0, errors }
}

const registerSchema = z
  .object({
    name: z.string().refine((val) => validateFullName(val).ok, {
      message: 'Nombre inválido',
    }),
    email: z.string().refine((val) => validateEmail(val).ok, {
      message: 'Email inválido',
    }),
    phone: z.string().refine((val) => validatePhone(val).ok, {
      message: 'Teléfono inválido',
    }),
    password: z
      .string()
      .refine((val) => validatePassword(val).ok, {
        message: 'Contraseña inválida',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
  .refine((data) => data.phone.length === 10, {
    message: 'El teléfono debe tener 10 dígitos',
    path: ['phone'],
  })

const RegisterForm = ({ onRegister, onLoginClick, isLoading = false }) => {
  const [apiError, setApiError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({}) // Errores mejorados
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur', // Validar al salir del campo
  })

  const password = watch('password', '')
  const name = watch('name', '')
  const email = watch('email', '')
  const phone = watch('phone', '')
  const confirmPassword = watch('confirmPassword', '')

  const onSubmit = async (data) => {
    setApiError(null)
    setFieldErrors({}) // Limpiar errores previos
    try {
      // Validación final antes de enviar
      const nameValidation = validateFullName(data.name)
      const emailValidation = validateEmail(data.email)
      const phoneValidation = validatePhone(data.phone)
      const passwordValidation = validatePassword(data.password)

      const allErrors = {}
      if (!nameValidation.ok) allErrors.name = nameValidation.errors
      if (!emailValidation.ok) allErrors.email = emailValidation.errors
      if (!phoneValidation.ok) allErrors.phone = phoneValidation.errors
      if (!passwordValidation.ok) allErrors.password = passwordValidation.errors

      if (Object.keys(allErrors).length > 0) {
        setFieldErrors(allErrors)
        return
      }

      // Send all data to backend
      await onRegister?.(data)
    } catch (error) {
      // Mostrar errores de validación del backend
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const errorMessages = Object.entries(backendErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
        setApiError(errorMessages);
      } else {
        setApiError(error.message || 'Error al registrarse');
      }
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="glass-effect rounded-2xl shadow-2xl p-8 border-2 border-white/10 hover:border-neon-cyan/30 transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold neon-text mb-2">
            🎌 Otaku Shop
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crear Cuenta
          </p>
        </div>

        {/* Alerts */}
        {apiError && (
          <Alert type="error" message={apiError} className="mb-6" dismissible />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <ValidatedInput
            label="Nombre Completo"
            type="text"
            placeholder="Tu nombre completo"
            fieldName="fullName"
            value={name}
            {...register('name')}
            error={errors.name?.message}
            disabled={isLoading}
            showValidationIcon={true}
          />

          {/* Email */}
          <ValidatedInput
            label="Email"
            type="email"
            placeholder="tu@email.com"
            fieldName="email"
            value={email}
            {...register('email')}
            error={errors.email?.message}
            disabled={isLoading}
            showValidationIcon={true}
          />

          {/* Phone */}
          <ValidatedInput
            label="Teléfono"
            type="tel"
            placeholder="3001234567"
            fieldName="phone"
            value={phone}
            {...register('phone')}
            error={errors.phone?.message}
            disabled={isLoading}
            showValidationIcon={true}
          />

          {/* Password */}
          <div>
            <ValidatedInput
              label="Contraseña"
              type="password"
              placeholder="Crea una contraseña segura"
              fieldName="password"
              value={password}
              {...register('password')}
              error={errors.password?.message}
              disabled={isLoading}
              showValidationIcon={false}
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          {/* Confirm Password */}
          <ValidatedInput
            label="Confirmar Contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            fieldName="confirmPassword"
            value={confirmPassword}
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            disabled={isLoading}
            customValidator={(value) => {
              if (!value) return null;
              if (value !== password) {
                return 'Las contraseñas no coinciden';
              }
              return null;
            }}
            showValidationIcon={true}
          />

          {/* Terms */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 rounded border-gray-300 mt-1"
              required
            />
            <label
              htmlFor="terms"
              className="ml-2 text-sm text-gray-600 dark:text-gray-400"
            >
              Acepto los{' '}
              <a href="#" className="text-neon-purple hover:text-neon-pink transition-colors">
                Términos y Condiciones
              </a>{' '}
              y la{' '}
              <a href="#" className="text-neon-purple hover:text-neon-pink transition-colors">
                Política de Privacidad
              </a>
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            Registrarse
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={onLoginClick}
            className="text-neon-cyan hover:text-neon-pink font-semibold transition-colors"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm

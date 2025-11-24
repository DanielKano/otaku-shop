import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Alert from '../ui/Alert'

const registerSchema = z
  .object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener una mayúscula')
      .regex(/[a-z]/, 'Debe contener una minúscula')
      .regex(/[0-9]/, 'Debe contener un número')
      .regex(/[@$!%*?&]/, 'Debe contener un carácter especial'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

const RegisterForm = ({ onRegister, onLoginClick, isLoading = false }) => {
  const [apiError, setApiError] = useState(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')

  const getPasswordStrength = (pass) => {
    let strength = 0
    if (pass.length >= 8) strength += 25
    if (/[A-Z]/.test(pass)) strength += 25
    if (/[a-z]/.test(pass)) strength += 25
    if (/[0-9]/.test(pass) && /[@$!%*?&]/.test(pass)) strength += 25
    return strength
  }

  const onSubmit = async (data) => {
    setApiError(null)
    try {
      // Send all data to backend (it needs confirmPassword for validation)
      await onRegister?.(data)
    } catch (error) {
      setApiError(error.message || 'Error al registrarse')
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
          <Input
            label="Nombre Completo"
            type="text"
            placeholder="Tu nombre completo"
            {...register('name')}
            error={errors.name?.message}
            disabled={isLoading}
          />

          {/* Email */}
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            {...register('email')}
            error={errors.email?.message}
            disabled={isLoading}
          />

          {/* Phone */}
          <Input
            label="Teléfono"
            type="tel"
            placeholder="1234567890"
            {...register('phone')}
            error={errors.phone?.message}
            disabled={isLoading}
          />

          {/* Password */}
          <div>
            <Input
              label="Contraseña"
              type="password"
              placeholder="Crea una contraseña segura"
              {...register('password')}
              error={errors.password?.message}
              disabled={isLoading}
              onChange={(e) => {
                register('password').onChange(e)
                setPasswordStrength(getPasswordStrength(e.target.value))
              }}
            />
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 h-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded ${
                        i < passwordStrength / 25
                          ? passwordStrength < 50
                            ? 'bg-red-500'
                            : passwordStrength < 75
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {passwordStrength < 50
                    ? 'Débil'
                    : passwordStrength < 75
                      ? 'Media'
                      : 'Fuerte'}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <Input
            label="Confirmar Contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            disabled={isLoading}
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

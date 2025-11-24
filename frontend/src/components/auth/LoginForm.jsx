import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../ui/Button'
import ValidatedInput from '../ui/ValidatedInput'
import Alert from '../ui/Alert'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

const LoginForm = ({ onLogin, onRegisterClick, isLoading = false }) => {
  const [apiError, setApiError] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const email = watch('email', '')
  const password = watch('password', '')

  const onSubmit = async (data) => {
    setApiError(null)
    try {
      await onLogin?.(data)
    } catch (error) {
      setApiError(error.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="glass-effect rounded-2xl shadow-2xl p-8 border-2 border-white/10 hover:border-neon-purple/30 transition-all duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold neon-text mb-2">
            🎌 Otaku Shop
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Iniciar Sesión
          </p>
        </div>

        {/* Alerts */}
        {apiError && (
          <Alert type="error" message={apiError} className="mb-6" dismissible />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {/* Password */}
          <ValidatedInput
            label="Contraseña"
            type="password"
            placeholder="Tu contraseña"
            fieldName="password"
            value={password}
            {...register('password')}
            error={errors.password?.message}
            disabled={isLoading}
            showValidationIcon={false}
          />

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-gray-300"
            />
            <label
              htmlFor="remember"
              className="ml-2 text-sm text-gray-600 dark:text-gray-400"
            >
              Recuérdame
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
            Ingresar
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          <span className="px-3 text-gray-500 dark:text-gray-400 text-sm">o</span>
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
        </div>

        {/* Social Login */}
        <div className="space-y-3 mb-6">
          <Button 
            variant="glass" 
            size="lg" 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              window.location.href = 'http://localhost:8080/api/oauth2/authorization/google';
            }}
          >
            <span className="text-xl">🔍</span> Continuar con Google
          </Button>
          <Button 
            variant="glass" 
            size="lg" 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              window.location.href = 'http://localhost:8080/api/oauth2/authorization/facebook';
            }}
          >
            <span className="text-xl">📘</span> Continuar con Facebook
          </Button>
        </div>

        {/* Forgot Password */}
        <div className="text-center mb-6">
          <Link 
            to="/forgot-password" 
            className="text-neon-cyan hover:text-neon-pink text-sm transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Register Link */}
        <p className="text-center text-gray-600 dark:text-gray-400">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-neon-purple hover:text-neon-pink font-semibold transition-colors"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginForm

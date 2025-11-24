import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../ui/Button'
import Input from '../ui/Input'
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
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setApiError(null)
    try {
      await onLogin?.(data)
    } catch (error) {
      setApiError(error.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
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
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            {...register('email')}
            error={errors.email?.message}
            disabled={isLoading}
          />

          {/* Password */}
          <Input
            label="Contraseña"
            type="password"
            placeholder="Tu contraseña"
            {...register('password')}
            error={errors.password?.message}
            disabled={isLoading}
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
            variant="primary"
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
          <Button variant="outline" size="lg" className="w-full">
            Google
          </Button>
          <Button variant="outline" size="lg" className="w-full">
            Facebook
          </Button>
        </div>

        {/* Forgot Password */}
        <div className="text-center mb-6">
          <a href="#" className="text-blue-600 hover:text-blue-700 text-sm">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Register Link */}
        <p className="text-center text-gray-600 dark:text-gray-400">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            onClick={onRegisterClick}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginForm

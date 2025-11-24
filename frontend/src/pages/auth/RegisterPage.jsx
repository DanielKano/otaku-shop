import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import RegisterForm from '../../components/auth/RegisterForm'
import services from '../../services'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { login: contextLogin } = useAuth()
  const { addNotification } = useNotification()
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (data) => {
    setIsLoading(true)
    try {
      const response = await services.authService.register(data)
      // Guardar token y usuario en localStorage
      const userData = response.data || response
      // Convertir role a minúsculas para consistencia en frontend
      const userDataWithLowerRole = {
        ...userData,
        role: userData.role?.toLowerCase() || 'cliente'
      }
      localStorage.setItem('token', userDataWithLowerRole.token)
      if (userDataWithLowerRole.refreshToken) {
        localStorage.setItem('refreshToken', userDataWithLowerRole.refreshToken)
      }
      localStorage.setItem('user', JSON.stringify(userDataWithLowerRole))
      // Actualizar contexto de autenticación
      contextLogin(userDataWithLowerRole)
      addNotification({
        type: 'success',
        message: `¡Bienvenido ${userDataWithLowerRole.name}!`,
      })
      // Redirigir según el rol
      const role = userDataWithLowerRole.role
      switch (role) {
        case 'vendedor':
          navigate('/vendedor/dashboard')
          break
        case 'admin':
          navigate('/admin/dashboard')
          break
        case 'superadmin':
          navigate('/superadmin/dashboard')
          break
        default:
          navigate('/cliente/dashboard')
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al registrarse',
      })
      throw new Error(error.response?.data?.message || 'Error al registrarse')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <RegisterForm
        onRegister={handleRegister}
        onLoginClick={() => navigate('/login')}
        isLoading={isLoading}
      />
    </div>
  )
}

export default RegisterPage

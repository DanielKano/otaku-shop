import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import LoginForm from '../../components/auth/LoginForm'
import services from '../../services'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login: contextLogin } = useAuth()
  const { addNotification } = useNotification()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (data) => {
    setIsLoading(true)
    try {
      const response = await services.authService.login(data)
      // API retorna los datos directamente, no en response.data.user
      const userData = response.data || response
      // Convertir role a minúsculas para consistencia en frontend
      const userDataWithLowerRole = {
        ...userData,
        role: userData.role?.toLowerCase() || 'cliente'
      }
      localStorage.setItem('token', userDataWithLowerRole.token)
      localStorage.setItem('user', JSON.stringify(userDataWithLowerRole))
      contextLogin(userDataWithLowerRole)
      addNotification({
        type: 'success',
        message: `¡Bienvenido ${userDataWithLowerRole.name}!`,
      })

      // Redirect based on role
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
        message: error.response?.data?.message || 'Error al iniciar sesión',
      })
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <LoginForm
        onLogin={handleLogin}
        onRegisterClick={() => navigate('/registro')}
        isLoading={isLoading}
      />
    </div>
  )
}

export default LoginPage

import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { useTheme } from '../../hooks/useTheme'
import Button from '../ui/Button'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const { itemCount } = useCart()
  const { isDark, toggleTheme } = useTheme()

  const getDashboardLink = () => {
    if (!user?.role) return null
    if (user.role === 'superadmin') return '/superadmin/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
    if (user.role === 'vendedor') return '/vendedor/dashboard'
    if (user.role === 'cliente') return '/cliente/dashboard'
    return null
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              🎌 Otaku Shop
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Inicio
            </Link>
            <Link to="/productos" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Productos
            </Link>
            <Link to="/conocenos" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Conócenos
            </Link>
            <Link to="/favoritos" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Favoritos
            </Link>
            <Link to="/politicas" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Políticas
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="text-2xl hover:opacity-70 transition-opacity"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Auth or Cart */}
            {isAuthenticated ? (
              <>
                <Link to="/carrito" className="relative">
                  <span className="text-2xl">🛒</span>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
                {getDashboardLink() && (
                  <Link to={getDashboardLink()}>
                    <Button variant="primary" size="sm">
                      📊 Dashboard
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user?.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/registro">
                  <Button variant="primary" size="sm">
                    Registro
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

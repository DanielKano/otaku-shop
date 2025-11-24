import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import services from '../../services'
import Button from '../../components/ui/Button'
import CreateUserModal from '../../components/modals/CreateUserModal'
import ChangeRolesModal from '../../components/modals/ChangeRolesModal'
import CategoriesModal from '../../components/modals/CategoriesModal'
import ReportsModal from '../../components/modals/ReportsModal'
import UsersListModal from '../../components/modals/UsersListModal'

const SuperAdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  const [isChangeRolesModalOpen, setIsChangeRolesModalOpen] = useState(false)
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false)
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false)
  const [isUsersListModalOpen, setIsUsersListModalOpen] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    // Fetch dashboard stats - pero no desloguear si falla
    const fetchStats = async () => {
      try {
        console.log('Fetching stats...')
        console.log('Token:', localStorage.getItem('token') ? 'Presente' : 'No presente')
        
        // Solo intentar cargar productos que es un endpoint público
        try {
          const products = await services.productService.getAll()
          setStats(prev => ({
            ...prev,
            totalProducts: products.data.products?.length || 0,
          }))
        } catch (e) {
          console.log('No se pudieron cargar los productos')
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [])

  const handleViewUsers = () => {
    setIsUsersListModalOpen(true)
  }

  const handleViewProducts = () => {
    navigate('/productos')
  }

  const handleUserCreated = (userData) => {
    addNotification({
      type: 'success',
      message: `Usuario ${userData.name} creado exitosamente`,
    })
  }

  const handleRoleChanged = (user, newRole) => {
    addNotification({
      type: 'success',
      message: `Rol de ${user.name} cambiado a ${newRole}`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Panel SuperAdministrador
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Control total de la plataforma, {user?.name}
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="whitespace-nowrap"
          >
            ← Volver
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Usuarios', value: stats.totalUsers, color: 'blue' },
            { title: 'Productos', value: stats.totalProducts, color: 'green' },
            { title: 'Órdenes', value: stats.totalOrders, color: 'purple' },
            { title: 'Ingresos', value: `$${stats.totalRevenue.toFixed(2)}`, color: 'yellow' },
          ].map((stat, idx) => (
            <div key={idx} className={`bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-lg p-6 border border-${stat.color}-200 dark:border-${stat.color}-700`}>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                {stat.title}
              </h3>
              <p className={`text-3xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Gestión de Usuarios
            </h2>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={handleViewUsers}
              >
                Ver Todos los Usuarios
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsCreateUserModalOpen(true)}
              >
                Crear Usuario
              </Button>
              <Button 
                variant="danger" 
                className="w-full"
                onClick={() => setIsChangeRolesModalOpen(true)}
              >
                Cambiar Roles
              </Button>
            </div>
          </div>

          {/* Product Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Gestión de Productos
            </h2>
            <div className="space-y-3">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={handleViewProducts}
              >
                Ver Todos los Productos
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsCategoriesModalOpen(true)}
              >
                Ver Categorías
              </Button>
              <Button 
                variant="danger" 
                className="w-full"
                onClick={() => setIsReportsModalOpen(true)}
              >
                Gestionar Denuncias
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      <ChangeRolesModal
        isOpen={isChangeRolesModalOpen}
        onClose={() => setIsChangeRolesModalOpen(false)}
        onRoleChanged={handleRoleChanged}
      />

      <CategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />

      <UsersListModal
        isOpen={isUsersListModalOpen}
        onClose={() => setIsUsersListModalOpen(false)}
      />
    </div>
  )
}

export default SuperAdminDashboard

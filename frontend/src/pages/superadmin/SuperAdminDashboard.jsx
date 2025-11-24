import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import services from '../../services'
import Button from '../../components/ui/Button'
import StatsCardEnhanced from '../../components/ui/StatsCardEnhanced'
import NeonCard from '../../components/ui/NeonCard'
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-8 flex justify-between items-start animate-fade-in">
          <div>
            <h1 className="text-5xl font-bold neon-text">
              🔑 Panel SuperAdministrador
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Control total de la plataforma, {user?.name}
            </p>
          </div>
          <Button 
            variant="glass"
            onClick={() => navigate(-1)}
            className="whitespace-nowrap"
          >
            ← Volver
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCardEnhanced
            title="Usuarios"
            value={stats.totalUsers}
            icon="👥"
            trend="neutral"
            color="purple"
            neonEffect
          />
          <StatsCardEnhanced
            title="Productos"
            value={stats.totalProducts}
            icon="📦"
            trend="up"
            color="cyan"
            neonEffect
          />
          <StatsCardEnhanced
            title="Órdenes"
            value={stats.totalOrders}
            icon="📝"
            trend="neutral"
            color="pink"
            neonEffect
          />
          <StatsCardEnhanced
            title="Ingresos"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon="💰"
            trend="up"
            color="green"
            neonEffect
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Management */}
          <NeonCard neonColor="purple" className="p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              👥 Gestión de Usuarios
            </h2>
            <div className="space-y-3">
              <Button 
                variant="gradient" 
                className="w-full"
                onClick={handleViewUsers}
              >
                Ver Todos los Usuarios
              </Button>
              <Button 
                variant="gradient-outline" 
                className="w-full"
                onClick={() => setIsCreateUserModalOpen(true)}
              >
                ➕ Crear Usuario
              </Button>
              <Button 
                variant="animated-neon" 
                className="w-full"
                onClick={() => setIsChangeRolesModalOpen(true)}
              >
                🔄 Cambiar Roles
              </Button>
            </div>
          </NeonCard>

          {/* Product Management */}
          <NeonCard neonColor="cyan" className="p-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              📦 Gestión de Productos
            </h2>
            <div className="space-y-3">
              <Button 
                variant="gradient" 
                className="w-full"
                onClick={handleViewProducts}
              >
                Ver Todos los Productos
              </Button>
              <Button 
                variant="gradient-outline" 
                className="w-full"
                onClick={() => setIsCategoriesModalOpen(true)}
              >
                📊 Ver Categorías
              </Button>
              <Button 
                variant="animated-neon" 
                className="w-full"
                onClick={() => setIsReportsModalOpen(true)}
              >
                ⚠️ Gestionar Denuncias
              </Button>
            </div>
          </NeonCard>
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

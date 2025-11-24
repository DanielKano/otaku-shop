import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import services from '../../services'
import Button from '../../components/ui/Button'
import StatsCardEnhanced from '../../components/ui/StatsCardEnhanced'
import NeonCard from '../../components/ui/NeonCard'
import PendingProductsModal from '../../components/modals/PendingProductsModal'
import ManageUsersModal from '../../components/modals/ManageUsersModal'
import AdminReportsModal from '../../components/modals/AdminReportsModal'

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [isPendingProductsModalOpen, setIsPendingProductsModalOpen] = useState(false)
  const [isManageUsersModalOpen, setIsManageUsersModalOpen] = useState(false)
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await services.productService.getPending?.()
        setPendingCount(response?.data?.length || 0)
        const allProducts = await services.productService.getApproved()
        setProducts(allProducts.data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-8 flex justify-between items-start animate-fade-in">
          <div>
            <h1 className="text-5xl font-bold neon-text">
              🛡️ Panel Administrativo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Administra la plataforma, {user?.name}
            </p>
          </div>
          <div className="flex gap-2">
            {user?.role === 'superadmin' && (
              <Button 
                variant="gradient"
                onClick={() => navigate('/superadmin/dashboard')}
                className="whitespace-nowrap"
              >
                ⚡ SuperAdmin
              </Button>
            )}
            <Button 
              variant="glass"
              onClick={() => navigate(-1)}
              className="whitespace-nowrap"
            >
              ← Volver
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCardEnhanced
            title="Productos Pendientes"
            value={pendingCount}
            icon="⏳"
            trend={pendingCount > 0 ? 'up' : 'neutral'}
            trendValue={pendingCount > 0 ? `${pendingCount} pendientes` : 'Todo al día'}
            color="purple"
            neonEffect
          />
          <StatsCardEnhanced
            title="Productos Activos"
            value={products.length}
            icon="✅"
            trend="up"
            trendValue="+5 esta semana"
            color="cyan"
            neonEffect
          />
          <StatsCardEnhanced
            title="Usuarios Activos"
            value="143"
            icon="👥"
            trend="up"
            trendValue="+12 este mes"
            color="pink"
            neonEffect
          />
        </div>

        {/* Actions */}
        <NeonCard neonColor="gradient" className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            ⚙️ Acciones de Administración
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="neon" 
              className="w-full"
              onClick={() => setIsPendingProductsModalOpen(true)}
            >
              📋 Revisar Productos Pendientes
            </Button>
            <Button 
              variant="gradient" 
              className="w-full"
              onClick={() => setIsManageUsersModalOpen(true)}
            >
              👥 Gestionar Usuarios
            </Button>
            <Button 
              variant="animated-neon" 
              className="w-full"
              onClick={() => setIsReportsModalOpen(true)}
            >
              📊 Ver Reportes
            </Button>
          </div>
        </NeonCard>
      </div>

      <PendingProductsModal
        isOpen={isPendingProductsModalOpen}
        onClose={() => setIsPendingProductsModalOpen(false)}
      />

      <ManageUsersModal
        isOpen={isManageUsersModalOpen}
        onClose={() => setIsManageUsersModalOpen(false)}
      />

      <AdminReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />
    </div>
  )
}

export default AdminDashboard

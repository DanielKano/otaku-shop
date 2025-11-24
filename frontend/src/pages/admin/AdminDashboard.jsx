import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import services from '../../services'
import Button from '../../components/ui/Button'
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Panel Administrativo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Administra la plataforma, {user?.name}
            </p>
          </div>
          <div className="flex gap-2">
            {user?.role === 'superadmin' && (
              <Button 
                variant="primary"
                onClick={() => navigate('/superadmin/dashboard')}
                className="whitespace-nowrap"
              >
                → SuperAdmin
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => navigate(-1)}
              className="whitespace-nowrap"
            >
              ← Volver
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-700">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              Productos Pendientes
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {pendingCount}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              Productos Activos
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {products.length}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              Usuarios Activos
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              0
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Acciones de Administración
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="primary" 
              className="w-full"
              onClick={() => setIsPendingProductsModalOpen(true)}
            >
              Revisar Productos Pendientes
            </Button>
            <Button 
              variant="primary" 
              className="w-full"
              onClick={() => setIsManageUsersModalOpen(true)}
            >
              Gestionar Usuarios
            </Button>
            <Button 
              variant="primary" 
              className="w-full"
              onClick={() => setIsReportsModalOpen(true)}
            >
              Ver Reportes
            </Button>
          </div>
        </div>
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

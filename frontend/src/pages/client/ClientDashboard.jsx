import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import services from '../../services'
import Button from '../../components/ui/Button'
import OrderDetailsModal from '../../components/modals/OrderDetailsModal'

const ClientDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await services.orderService.getAll()
        setOrders(response.orders || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Bienvenido, {user?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Aquí puedes ver tu perfil y tus órdenes
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

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Mi Perfil
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Nombre</label>
              <p className="text-gray-900 dark:text-white">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
              <p className="text-gray-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Teléfono</label>
              <p className="text-gray-900 dark:text-white">{user?.phone || 'No especificado'}</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Mis Órdenes
          </h2>

          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Cargando órdenes...</p>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Orden #{order.id}
                    </h3>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Fecha: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Total: ${order.total.toFixed(2)}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order)
                        setIsModalOpen(true)
                      }}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Aún no has realizado ninguna compra
            </p>
          )}
        </div>

        <OrderDetailsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
        />
      </div>
    </div>
  )
}

export default ClientDashboard

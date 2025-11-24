import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import services from '../../services'
import Button from '../../components/ui/Button'
import NeonCard from '../../components/ui/NeonCard'
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-8 flex justify-between items-start animate-fade-in">
          <div>
            <h1 className="text-5xl font-bold neon-text">
              👋 Bienvenido, {user?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Aquí puedes ver tu perfil y tus órdenes
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

        {/* Profile Card */}
        <NeonCard neonColor="purple" className="p-6 mb-8 animate-slide-in-right">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            👤 Mi Perfil
          </h2>
          <div className="space-y-4">
            <div className="glass-effect p-4 rounded-lg">
              <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold">📛 Nombre</label>
              <p className="text-gray-900 dark:text-white text-lg mt-1">{user?.name}</p>
            </div>
            <div className="glass-effect p-4 rounded-lg">
              <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold">📧 Email</label>
              <p className="text-gray-900 dark:text-white text-lg mt-1">{user?.email}</p>
            </div>
            <div className="glass-effect p-4 rounded-lg">
              <label className="text-sm text-gray-600 dark:text-gray-400 font-semibold">📞 Teléfono</label>
              <p className="text-gray-900 dark:text-white text-lg mt-1">{user?.phone || 'No especificado'}</p>
            </div>
          </div>
        </NeonCard>

        {/* Orders */}
        <NeonCard neonColor="gradient" className="p-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            📝 Mis Órdenes
          </h2>

          {loading ? (
            <p className="text-gray-600 dark:text-gray-400 animate-pulse">✨ Cargando órdenes...</p>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="glass-effect border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:scale-[1.02] transition-transform">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      🛒 Orden #{order.id}
                    </h3>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    📅 Fecha: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-white text-lg">
                      💵 Total: ${order.total.toFixed(2)}
                    </span>
                    <Button 
                      variant="gradient-outline" 
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
            <p className="text-gray-600 dark:text-gray-400 text-center py-8 text-lg">
              🛍️ Aún no has realizado ninguna compra
            </p>
          )}
        </NeonCard>

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

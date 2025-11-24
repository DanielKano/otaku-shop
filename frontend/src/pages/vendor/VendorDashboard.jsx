import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'
import services from '../../services'
import Button from '../../components/ui/Button'
import EditProductModal from '../../components/modals/EditProductModal'
import CreateProductModal from '../../components/modals/CreateProductModal'

const VendorDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addNotification } = useNotification()
  
  // Estado de productos por categoría
  const [productsByStatus, setProductsByStatus] = useState({
    PENDING: [],
    APPROVED: [],
    REJECTED: [],
    CANCELLED: [],
  })
  
  const [activeTab, setActiveTab] = useState('PENDING')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
  })
  
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Cargar productos del vendedor actual
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        // Cargar todos los productos del vendedor
        const response = await services.productService.getMyProducts()
        const allProducts = response.data.products || []
        
        // Agrupar por estado
        const grouped = {
          PENDING: [],
          APPROVED: [],
          REJECTED: [],
          CANCELLED: [],
        }
        
        allProducts.forEach(product => {
          const status = product.status || 'PENDING'
          if (grouped[status]) {
            grouped[status].push(product)
          }
        })
        
        setProductsByStatus(grouped)
        
        // Actualizar stats
        setStats({
          totalProducts: allProducts.length,
          pendingApproval: grouped.PENDING.length,
          approved: grouped.APPROVED.length,
          rejected: grouped.REJECTED.length,
        })
      } catch (error) {
        console.error('Error fetching products:', error)
        addNotification({
          type: 'error',
          message: 'Error al cargar los productos',
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [addNotification])

  const handleCreateProduct = async (formData) => {
    try {
      await services.productService.create(formData)
      addNotification({
        type: 'success',
        message: 'Producto creado exitosamente en estado PENDING',
      })
      setIsCreateModalOpen(false)
      
      // Recargar productos
      const response = await services.productService.getMyProducts()
      const allProducts = response.data.products || []
      
      const grouped = {
        PENDING: [],
        APPROVED: [],
        REJECTED: [],
        CANCELLED: [],
      }
      
      allProducts.forEach(product => {
        const status = product.status || 'PENDING'
        if (grouped[status]) {
          grouped[status].push(product)
        }
      })
      
      setProductsByStatus(grouped)
      setStats({
        totalProducts: allProducts.length,
        pendingApproval: grouped.PENDING.length,
        approved: grouped.APPROVED.length,
        rejected: grouped.REJECTED.length,
      })
    } catch (error) {
      console.error('Error creating product:', error)
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al crear el producto',
      })
    }
  }

  const handleCancelProduct = async (productId) => {
    if (!confirm('¿Estás seguro de que deseas cancelar este producto?')) {
      return
    }
    
    try {
      await services.productService.cancel(productId)
      
      // Actualizar estado local
      const newProductsByStatus = { ...productsByStatus }
      
      // Encontrar en qué tab está
      for (const status in newProductsByStatus) {
        newProductsByStatus[status] = newProductsByStatus[status].filter(p => p.id !== productId)
      }
      
      // Si estaba en APPROVED, moverlo a CANCELLED
      const cancelledProduct = productsByStatus[activeTab].find(p => p.id === productId)
      if (cancelledProduct) {
        cancelledProduct.status = 'CANCELLED'
        newProductsByStatus.CANCELLED.push(cancelledProduct)
      }
      
      setProductsByStatus(newProductsByStatus)
      
      addNotification({
        type: 'success',
        message: 'Producto cancelado exitosamente',
      })
    } catch (error) {
      console.error('Error cancelling product:', error)
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Error al cancelar el producto',
      })
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return
    }
    
    try {
      await services.productService.delete(productId)
      
      const newProductsByStatus = { ...productsByStatus }
      newProductsByStatus[activeTab] = newProductsByStatus[activeTab].filter(p => p.id !== productId)
      setProductsByStatus(newProductsByStatus)
      
      addNotification({
        type: 'success',
        message: 'Producto eliminado',
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      addNotification({
        type: 'error',
        message: 'Error al eliminar el producto',
      })
    }
  }

  const tabs = [
    { key: 'PENDING', label: 'Pendientes de Aprobación', color: 'yellow', count: stats.pendingApproval },
    { key: 'APPROVED', label: 'Aprobados', color: 'green', count: stats.approved },
    { key: 'REJECTED', label: 'Rechazados', color: 'red', count: stats.rejected },
    { key: 'CANCELLED', label: 'Cancelados', color: 'gray', count: productsByStatus.CANCELLED.length },
  ]

  const currentProducts = productsByStatus[activeTab] || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Panel de Vendedor
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Bienvenido, {user?.name}
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
            { title: 'Total Productos', value: stats.totalProducts, color: 'blue' },
            { title: 'Pendientes', value: stats.pendingApproval, color: 'yellow' },
            { title: 'Aprobados', value: stats.approved, color: 'green' },
            { title: 'Rechazados', value: stats.rejected, color: 'red' },
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

        {/* Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mis Productos ({stats.totalProducts})
            </h2>
            <Button 
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              + Nuevo Producto
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition ${
                    activeTab === tab.key
                      ? `border-${tab.color}-500 text-${tab.color}-600 dark:text-${tab.color}-400`
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-${tab.color}-100 dark:bg-${tab.color}-900/30 text-${tab.color}-700 dark:text-${tab.color}-300`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Products List */}
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Cargando productos...</p>
          ) : currentProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-900 dark:text-white font-semibold">Producto</th>
                    <th className="text-left py-3 px-4 text-gray-900 dark:text-white font-semibold">Categoría</th>
                    <th className="text-right py-3 px-4 text-gray-900 dark:text-white font-semibold">Precio</th>
                    <th className="text-right py-3 px-4 text-gray-900 dark:text-white font-semibold">Stock</th>
                    <th className="text-left py-3 px-4 text-gray-900 dark:text-white font-semibold">Estado</th>
                    <th className="text-center py-3 px-4 text-gray-900 dark:text-white font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map(product => (
                    <tr key={product.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{product.description?.substring(0, 30)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{product.category || 'N/A'}</td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-medium">${product.price?.toFixed(2) || '0.00'}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          product.stock > 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {product.stock || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          product.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : product.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : product.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {product.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center flex-wrap">
                          {/* ✅ Solo se puede editar si es PENDING */}
                          {product.status === 'PENDING' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product)
                                setIsEditModalOpen(true)
                              }}
                            >
                              ✏️ Editar
                            </Button>
                          )}
                          
                          {/* ✅ Se puede cancelar si es PENDING o APPROVED */}
                          {(product.status === 'PENDING' || product.status === 'APPROVED') && (
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleCancelProduct(product.id)}
                            >
                              ❌ Cancelar
                            </Button>
                          )}
                          
                          {/* ✅ Siempre se puede ver detalles */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/productos/${product.id}`)}
                          >
                            👁️ Ver
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No hay productos en este estado. {activeTab === 'PENDING' && '¡Crea uno para comenzar!'}
            </p>
          )}
        </div>
      </div>

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={selectedProduct}
        onProductUpdated={() => {
          setIsEditModalOpen(false)
          addNotification({
            type: 'success',
            message: 'Producto actualizado',
          })
          // Recargar productos
          window.location.reload()
        }}
      />

      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProductCreated={handleCreateProduct}
      />
    </div>
  )
}

export default VendorDashboard

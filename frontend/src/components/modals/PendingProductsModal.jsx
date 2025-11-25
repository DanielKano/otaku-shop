import { useState, useEffect } from 'react'
import services from '../../services'
import Button from '../ui/Button'

const PendingProductsModal = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchPendingProducts()
    }
  }, [isOpen])

  const fetchPendingProducts = async () => {
    try {
      setLoading(true)
      const response = await services.productService.getPending?.()
      setProducts(response?.data || [])
    } catch (error) {
      console.error('Error fetching pending products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (productId) => {
    try {
      setActionLoading(productId)
      await services.productService.approve?.(productId)
      setProducts(products.filter(p => p.id !== productId))
    } catch (error) {
      console.error('Error approving product:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (productId) => {
    try {
      setActionLoading(productId)
      await services.productService.reject?.(productId)
      setProducts(products.filter(p => p.id !== productId))
    } catch (error) {
      console.error('Error rejecting product:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Productos Pendientes de Revisión
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-600 dark:text-gray-400">Cargando productos...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-4">
              {products.map(product => (
                <div
                  key={product.id}
                  className="border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {product.description?.substring(0, 100)}...
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          💰 ${product.price?.toFixed(2)}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          📦 Stock: {product.stock}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          🏷️ {product.category}
                        </span>
                      </div>
                    </div>
                    {product.imageUrl && (
                      <img
                        src={`http://localhost:8080/api/uploads/images/${product.imageUrl}`}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded ml-4"
                      />
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(product.id)}
                      disabled={actionLoading === product.id}
                    >
                      ✓ Aprobar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(product.id)}
                      disabled={actionLoading === product.id}
                    >
                      ✗ Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              ✓ No hay productos pendientes. ¡Todo aprobado!
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {products.length === 1 
              ? '1 producto pendiente' 
              : `${products.length} productos pendientes`}
          </p>
          <Button 
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PendingProductsModal

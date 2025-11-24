import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import services from '../../services'

const CategoriesModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      // Intenta primero con endpoint específico de categorías
      try {
        const response = await services.api.get('/categories')
        setCategories(response.data || [])
      } catch (err) {
        // Si no existe, agrupa productos por categoría
        const productsResponse = await services.productService.getAll()
        const products = productsResponse.data.products || []
        
        const categoryMap = {}
        products.forEach(product => {
          const cat = product.category || 'Sin Categoría'
          if (!categoryMap[cat]) {
            categoryMap[cat] = {
              name: cat,
              count: 0,
              products: [],
            }
          }
          categoryMap[cat].count++
          categoryMap[cat].products.push(product)
        })

        setCategories(Object.values(categoryMap))
      }
      setError('')
    } catch (err) {
      setError('Error al cargar categorías')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Categorías
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando categorías...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No hay categorías disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {category.count} producto{category.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="bg-blue-500 text-white text-lg font-bold px-3 py-1 rounded-full">
                      {category.count}
                    </span>
                  </div>

                  {category.products && category.products.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-300 dark:border-blue-600">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Productos:
                      </p>
                      <ul className="space-y-1">
                        {category.products.slice(0, 3).map((product, pidx) => (
                          <li
                            key={pidx}
                            className="text-xs text-gray-700 dark:text-gray-300 truncate"
                          >
                            • {product.name}
                          </li>
                        ))}
                        {category.products.length > 3 && (
                          <li className="text-xs text-gray-500 dark:text-gray-500 italic">
                            + {category.products.length - 3} más...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky bottom-0">
          <Button
            variant="primary"
            className="w-full"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CategoriesModal

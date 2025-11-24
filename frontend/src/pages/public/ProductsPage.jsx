import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../../hooks/useDebounce'
import ProductGrid from '../../components/products/ProductGrid'
import FilterPanel from '../../components/filters/FilterPanel'
import Pagination from '../../components/filters/Pagination'
import services from '../../services'

const ProductsPage = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterOpen, setFilterOpen] = useState(true)

  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await services.productService.getAll({
          search: debouncedSearch,
          category: selectedCategory,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          page: currentPage,
          limit: 12,
        })

        setProducts(response.data.products || [])
        setTotalPages(response.data.pages || 1)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [debouncedSearch, selectedCategory, priceRange, currentPage])

  const handleProductClick = (productId) => {
    // Navigate to product detail page
    navigate(`/productos/${productId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-5xl font-bold neon-text mb-3">
            🎌 Nuestros Productos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Descubre nuestra amplia colección de productos otaku
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="w-full px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-lg font-medium shadow-lg"
          >
            {filterOpen ? '✖ Ocultar Filtros' : '🔍 Mostrar Filtros'}
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <FilterPanel
              onSearch={setSearchTerm}
              onCategoryChange={setSelectedCategory}
              onPriceChange={setPriceRange}
              isOpen={filterOpen}
            />
          </div>

          {/* Products */}
          <div className="md:col-span-3">
            <ProductGrid
              products={products}
              loading={loading}
              onProductClick={handleProductClick}
              columns={3}
            />

            {products.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No se encontraron productos
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Intenta ajustar tus filtros
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage

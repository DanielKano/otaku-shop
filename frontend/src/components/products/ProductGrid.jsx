import ProductCard from './ProductCard'

const ProductGrid = ({ products = [], loading = false, onProductClick, columns = 4 }) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="col-span-full py-12 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No se encontraron productos
        </p>
      </div>
    )
  }

  const gridColsClass = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  }[columns] || 'lg:grid-cols-4'

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridColsClass} gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onViewDetails={onProductClick}
        />
      ))}
    </div>
  )
}

export default ProductGrid

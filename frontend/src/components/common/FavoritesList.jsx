import Button from '../ui/Button'

const FavoritesList = ({ favorites = [], onRemove, onAddToCart }) => {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Aún no tienes productos favoritos
        </p>
        <Button href="/productos" variant="primary">
          Explorar productos
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((product) => (
        <div
          key={product.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Image */}
          <div className="bg-gray-200 dark:bg-gray-700 aspect-square flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img
                src={`http://localhost:8080/api/uploads/images/${product.imageUrl}`}
                alt={product.name}
                className="w-full h-full object-contain p-4 hover:scale-105 transition-transform"
              />
            ) : (
              <span className="text-6xl">🎀</span>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
              {product.name}
            </h3>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${product.price?.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Stock: {product.stock}
              </span>
            </div>

            {product.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★ {product.rating}</span>
                <span className="text-sm text-gray-500">({product.reviews})</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => onAddToCart(product)}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Agregar
              </Button>
              <Button
                onClick={() => onRemove(product.id)}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                Remover
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FavoritesList

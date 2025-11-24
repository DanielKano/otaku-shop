import { useState } from 'react'
import { PRODUCT_CATEGORIES } from '../../utils/constants'

const AdvancedFilter = ({ onFilterChange, onClear }) => {
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [rating, setRating] = useState(0)
  const [inStock, setInStock] = useState(false)

  const handleCategoryToggle = (category) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]
    setSelectedCategories(updated)
    onFilterChange({ categories: updated, priceRange, rating, inStock })
  }

  const handlePriceChange = (e) => {
    const newRange = [priceRange[0], parseInt(e.target.value)]
    setPriceRange(newRange)
    onFilterChange({ categories: selectedCategories, priceRange: newRange, rating, inStock })
  }

  const handleRatingChange = (value) => {
    setRating(value)
    onFilterChange({ categories: selectedCategories, priceRange, rating: value, inStock })
  }

  const handleStockChange = () => {
    const newInStock = !inStock
    setInStock(newInStock)
    onFilterChange({ categories: selectedCategories, priceRange, rating, inStock: newInStock })
  }

  const handleClear = () => {
    setPriceRange([0, 1000])
    setSelectedCategories([])
    setRating(0)
    setInStock(false)
    onClear()
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filtros</h2>
        {(selectedCategories.length > 0 || rating > 0 || inStock) && (
          <button
            onClick={handleClear}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Categorías</h3>
        <div className="space-y-2">
          {PRODUCT_CATEGORIES.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-gray-700 dark:text-gray-300">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Precio máximo</h3>
        <input
          type="range"
          min="0"
          max="1000"
          value={priceRange[1]}
          onChange={handlePriceChange}
          className="w-full"
        />
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          ${priceRange[0]} - ${priceRange[1]}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Calificación</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <label key={star} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={star}
                checked={rating === star}
                onChange={() => handleRatingChange(star)}
                className="rounded-full border-gray-300 text-blue-600"
              />
              <span className="text-yellow-500">{'★'.repeat(star)}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">y up</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stock Filter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={handleStockChange}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-gray-700 dark:text-gray-300">Solo en stock</span>
        </label>
      </div>
    </div>
  )
}

export default AdvancedFilter

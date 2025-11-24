import { useState } from 'react'
import { IoSearch, IoClose } from 'react-icons/io5'

const FilterPanel = ({
  onSearch,
  onCategoryChange,
  onPriceChange,
  categories = [
    'Manga',
    'Anime',
    'Figuras',
    'Merchandising',
    'Libros',
    'Ropa',
    'Accesorios',
  ],
  isOpen = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState([0, 1000])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch?.(value)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category)
    onCategoryChange?.(category === selectedCategory ? '' : category)
  }

  const handlePriceChange = (type, value) => {
    const newRange =
      type === 'min'
        ? [parseInt(value), priceRange[1]]
        : [priceRange[0], parseInt(value)]
    setPriceRange(newRange)
    onPriceChange?.(newRange)
  }

  if (!isOpen) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Buscar
        </label>
        <div className="relative">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange({ target: { value: '' } })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <IoClose />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Categoría
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <label key={category} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategory === category}
                onChange={() => handleCategoryChange(category)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Rango de Precio
        </label>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">
              Mín: ${priceRange[0]}
            </label>
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">
              Máx: ${priceRange[1]}
            </label>
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {(searchTerm || selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000) && (
        <button
          onClick={() => {
            setSearchTerm('')
            setSelectedCategory('')
            setPriceRange([0, 1000])
            onSearch?.('')
            onCategoryChange?.('')
            onPriceChange?.([0, 1000])
          }}
          className="w-full py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

export default FilterPanel

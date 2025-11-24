import { useState } from 'react'
import { IoSearch, IoClose } from 'react-icons/io5'
import Button from '../ui/Button'

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
    <div className="glass-effect rounded-xl shadow-lg p-6 space-y-6 border border-white/10 hover:border-neon-purple/30 transition-all duration-300 animate-fade-in">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          🔍 Buscar
        </label>
        <div className="relative">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-purple" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-neon-purple focus:border-neon-purple outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange({ target: { value: '' } })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neon-pink transition-colors"
            >
              <IoClose size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          🏷️ Categoría
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {categories.map((category) => (
            <label 
              key={category} 
              className={`flex items-center cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-all ${
                selectedCategory === category ? 'bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/50' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategory === category}
                onChange={() => handleCategoryChange(category)}
                className="w-4 h-4 rounded border-gray-300 text-neon-purple focus:ring-neon-purple"
              />
              <span className={`ml-3 text-sm ${
                selectedCategory === category 
                  ? 'text-neon-purple dark:text-neon-cyan font-semibold' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          💰 Rango de Precio
        </label>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-neon-purple/10 to-neon-pink/10 p-3 rounded-lg border border-neon-purple/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Mínimo</span>
              <span className="text-sm font-bold text-neon-purple">${priceRange[0]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-neon-purple"
            />
          </div>
          <div className="bg-gradient-to-r from-neon-pink/10 to-neon-cyan/10 p-3 rounded-lg border border-neon-pink/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Máximo</span>
              <span className="text-sm font-bold text-neon-pink">${priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-neon-pink"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {(searchTerm || selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000) && (
        <Button
          variant="neon-outline"
          size="md"
          className="w-full"
          onClick={() => {
            setSearchTerm('')
            setSelectedCategory('')
            setPriceRange([0, 1000])
            onSearch?.('')
            onCategoryChange?.('')
            onPriceChange?.([0, 1000])
          }}
        >
          ✨ Limpiar filtros
        </Button>
      )}
    </div>
  )
}

export default FilterPanel

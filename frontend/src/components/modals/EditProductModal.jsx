import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ValidatedInput from '../ui/ValidatedInput'
import services from '../../services'

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const categories = [
    'Manga',
    'Anime',
    'Figuras',
    'Ropa',
    'Accesorios',
    'Libros',
    'Otros',
  ]

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        category: product.category || '',
        imageUrl: product.imageUrl || '',
      })
      setErrors({})
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0'
    }
    if (!formData.category) {
      newErrors.category = 'La categoría es requerida'
    }
    if (!formData.stock || formData.stock < 0) {
      newErrors.stock = 'El stock debe ser mayor o igual a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validación: Solo se pueden editar productos PENDING
    if (product?.status !== 'PENDING') {
      setErrors({ submit: `No se puede editar un producto en estado ${product?.status}` })
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      const updateData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        imageUrl: formData.imageUrl,
      }

      await services.productService.update(product.id, updateData)
      
      onProductUpdated(product.id)
      onClose()
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || err.message || 'Error al actualizar el producto' })
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Bloquear edición si no es PENDING
  const canEdit = product?.status === 'PENDING'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Producto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        {!canEdit && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            ⚠️ Este producto no puede ser editado porque ya ha sido {product?.status === 'APPROVED' ? 'aprobado' : 'procesado'}
          </div>
        )}

        {/* Nombre */}
        <ValidatedInput
          label="Nombre del Producto"
          name="productName"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange({ target: { name: 'name', value: e.target.value } })}
          disabled={!canEdit || loading}
          placeholder="Ej: Manga One Piece Vol. 1"
          required
        />

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={!canEdit || loading}
            placeholder="Describe tu producto..."
            rows="3"
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
          )}
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInput
            label="Precio"
            name="productPrice"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange({ target: { name: 'price', value: e.target.value } })}
            disabled={!canEdit || loading}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
          
          <ValidatedInput
            label="Stock"
            name="productStock"
            type="number"
            value={formData.stock}
            onChange={(e) => handleChange({ target: { name: 'stock', value: e.target.value } })}
            disabled={!canEdit || loading}
            placeholder="0"
            min="0"
            required
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={!canEdit || loading}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
          )}
        </div>

        {/* URL de Imagen */}
        <ValidatedInput
          label="URL de la Imagen (opcional)"
          name="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => handleChange({ target: { name: 'imageUrl', value: e.target.value } })}
          disabled={!canEdit || loading}
          placeholder="https://ejemplo.com/imagen.jpg"
        />

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || !canEdit}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditProductModal
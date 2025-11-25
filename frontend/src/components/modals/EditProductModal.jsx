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
    imageFile: null,
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [currentImageUrl, setCurrentImageUrl] = useState(null)
  const [errors, setErrors] = useState({})
  const [validationState, setValidationState] = useState({}) // Para saber qué campos son válidos
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

  // Función auxiliar para obtener estado visual de campo
  const getFieldStatus = (fieldName) => {
    // Si hay errores, rojo
    if (errors[fieldName]?.length > 0) return 'invalid'
    // Si tiene valor y no hay errores, verde
    if ((formData[fieldName] || formData[fieldName] === 0) && !errors[fieldName]?.length) return 'valid'
    // Si no tiene nada, neutral
    return 'neutral'
  }

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        category: product.category || '',
        imageFile: null,
      })
      setCurrentImageUrl(product.imageUrl || null)
      setImagePreview(null)
      setErrors({})
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Validación en tiempo real
    let validation = { isValid: true, errors: [] }
    switch (name) {
      case 'name':
        validation = validateProductName(value)
        break
      case 'description':
        validation = validateDescription(value)
        break
      case 'price':
        validation = validatePrice(value)
        break
      case 'stock':
        validation = validateStock(value)
        break
      case 'category':
        validation = validateCategory(value)
        break
      default:
        break
    }

    if (validation.errors.length > 0) {
      setErrors(prev => ({
        ...prev,
        [name]: validation.errors,
      }))
      setValidationState(prev => ({
        ...prev,
        [name]: false
      }))
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: [],
      }))
      // Si tiene valor y no hay errores, marcar como válido
      if (value || value === 0) {
        setValidationState(prev => ({
          ...prev,
          [name]: true
        }))
      } else {
        setValidationState(prev => ({
          ...prev,
          [name]: false
        }))
      }
    }
  }

  // Validadores específicos para productos - MEJORADOS
  const validateProductName = (name) => {
    const errors = []
    const trimmed = name.trim()

    if (!trimmed) {
      errors.push('El nombre del producto es requerido')
    } else {
      if (trimmed.length < 3) {
        errors.push('Mínimo 3 caracteres')
      } else if (trimmed.length > 100) {
        errors.push('Máximo 100 caracteres')
      }

      if (!/^[a-zA-Z0-9\s\-.,ñáéíóúÁÉÍÓÚÑ()&/\\]+$/i.test(trimmed)) {
        errors.push('Solo letras, números, espacios y caracteres: - . , ( ) & /')
      }

      if (/([a-zA-Z0-9])\1{3,}/.test(trimmed)) {
        errors.push('No repetir caracteres 4+ veces consecutivas')
      }

      if (/^\d+$/.test(trimmed)) {
        errors.push('El nombre no puede ser solo números')
      }

      if (/^[\s\-.,()&/\\]+$/.test(trimmed)) {
        errors.push('El nombre debe incluir letras o números')
      }

      const symbolCount = (trimmed.match(/[-.,()&/\\]/g) || []).length
      if (symbolCount > 5) {
        errors.push('Demasiados símbolos especiales')
      }

      const commonGeneric = /^(producto|item|cosa|objeto)$/i.test(trimmed)
      if (commonGeneric) {
        errors.push('El nombre es demasiado genérico, sé más específico')
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  const validateDescription = (description) => {
    const errors = []
    const trimmed = description.trim()

    if (!trimmed) {
      errors.push('La descripción es requerida')
    } else {
      if (trimmed.length < 10) {
        errors.push('Mínimo 10 caracteres')
      } else if (trimmed.length > 500) {
        errors.push('Máximo 500 caracteres')
      }

      const words = trimmed.split(/\s+/).filter(w => w.length > 0)
      if (words.length < 3) {
        errors.push('Describe con al menos 3 palabras')
      }

      if (/(.)\1{5,}/.test(trimmed)) {
        errors.push('Evita repetir caracteres muchas veces')
      }

      if (!/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(trimmed)) {
        errors.push('La descripción debe contener letras')
      }

      const links = (trimmed.match(/http[s]?:\/\//g) || []).length
      if (links > 1) {
        errors.push('Máximo 1 enlace en la descripción')
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  const validatePrice = (price) => {
    const errors = []
    const num = parseFloat(price)

    if (!price) {
      errors.push('El precio es requerido')
    } else if (isNaN(num)) {
      errors.push('El precio debe ser un número válido')
    } else {
      if (num <= 0) {
        errors.push('El precio debe ser mayor a 0')
      } else if (num < 5) {
        errors.push('Precio mínimo: $5')
      } else if (num > 1000) {
        errors.push('Precio máximo: $1,000')
      }

      if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        errors.push('Máximo 2 decimales (ej: 99.99)')
      }

      if (num === 666 || num === 1337) {
        errors.push('Precio no permitido por política de plataforma')
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  const validateStock = (stock) => {
    const errors = []
    const num = parseInt(stock, 10)

    if (stock === '') {
      errors.push('El stock es requerido')
    } else if (isNaN(num)) {
      errors.push('El stock debe ser un número válido')
    } else {
      if (num < 0) {
        errors.push('El stock no puede ser negativo')
      } else if (num === 0) {
        errors.push('Stock mínimo: 1 unidad')
      } else if (num > 100) {
        errors.push('Stock máximo: 100 unidades')
      }

      if (!Number.isInteger(num)) {
        errors.push('El stock debe ser un número entero')
      }

      if (num > 0 && num < 3) {
        errors.push('⚠️ Stock muy bajo - riesgo de agotar rápido')
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  const validateCategory = (category) => {
    const errors = []
    if (!category) {
      errors.push('Debes seleccionar una categoría')
    }
    return { isValid: errors.length === 0, errors }
  }

  const validateImageUrl = (url) => {
    const errors = []
    if (url && url.trim()) {
      try {
        new URL(url)
      } catch {
        errors.push('La URL de la imagen no es válida')
      }
    }
    return { isValid: errors.length === 0, errors }
  }

  const validateImageFile = (file) => {
    const errors = []
    
    if (file) {
      const maxSize = 5 * 1024 * 1024 // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      
      if (file.size > maxSize) {
        errors.push('El archivo excede 5MB')
      }
      
      if (!allowedTypes.includes(file.type)) {
        errors.push('Formato permitido: JPG, PNG, WebP, GIF')
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    
    if (file) {
      const validation = validateImageFile(file)
      
      if (validation.errors.length > 0) {
        setErrors(prev => ({
          ...prev,
          imageFile: validation.errors,
        }))
        setImagePreview(null)
        setFormData(prev => ({
          ...prev,
          imageFile: null,
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
        }))
        
        // Preview
        const reader = new FileReader()
        reader.onload = (event) => {
          setImagePreview(event.target.result)
        }
        reader.readAsDataURL(file)
        
        setErrors(prev => ({
          ...prev,
          imageFile: [],
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        imageFile: null,
      }))
      setImagePreview(null)
      setErrors(prev => ({
        ...prev,
        imageFile: [],
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validación: Solo se pueden editar productos PENDING
    if (product?.status !== 'PENDING') {
      setErrors({ submit: `No se puede editar un producto en estado ${product?.status}` })
      return
    }

    // Validar todos los campos
    const nameValidation = validateProductName(formData.name)
    const descValidation = validateDescription(formData.description)
    const priceValidation = validatePrice(formData.price)
    const stockValidation = validateStock(formData.stock)
    const categoryValidation = validateCategory(formData.category)

    const newErrors = {}
    if (!nameValidation.isValid) newErrors.name = nameValidation.errors
    if (!descValidation.isValid) newErrors.description = descValidation.errors
    if (!priceValidation.isValid) newErrors.price = priceValidation.errors
    if (!stockValidation.isValid) newErrors.stock = stockValidation.errors
    if (!categoryValidation.isValid) newErrors.category = categoryValidation.errors

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)

      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('stock', formData.stock)
      formDataToSend.append('category', formData.category)
      if (formData.imageFile) {
        formDataToSend.append('imageFile', formData.imageFile)
      }

      await services.productService.update(product.id, formDataToSend)
      
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
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
            📦 Nombre del Producto <span className="text-red-500">*</span>
            {validationState.name && <span className="text-green-500 ml-1">✓</span>}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!canEdit || loading}
            placeholder="Ej: Manga One Piece Vol. 1"
            className={`w-full px-3 py-2 border text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              getFieldStatus('name') === 'invalid'
                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                : getFieldStatus('name') === 'valid'
                ? 'border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            required
          />
          {errors.name && errors.name.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {(Array.isArray(errors.name) ? errors.name : [errors.name]).map((err, idx) => (
                <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                  ✗ {err}
                </p>
              ))}
            </div>
          )}
          {validationState.name && !errors.name?.length && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Nombre válido</p>
          )}
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">3-100 caracteres</p>
            <p className="text-xs text-gray-400">{formData.name.length}/100</p>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
            📝 Descripción <span className="text-red-500">*</span>
            {validationState.description && <span className="text-green-500 ml-1">✓</span>}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={!canEdit || loading}
            placeholder="Describe tu producto detalladamente..."
            rows="3"
            className={`w-full px-3 py-2 border text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
              getFieldStatus('description') === 'invalid'
                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                : getFieldStatus('description') === 'valid'
                ? 'border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
          />
          {errors.description && errors.description.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {(Array.isArray(errors.description) ? errors.description : [errors.description]).map((err, idx) => (
                <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                  ✗ {err}
                </p>
              ))}
            </div>
          )}
          {validationState.description && !errors.description?.length && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Descripción válida</p>
          )}
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Mínimo 10 caracteres, 3+ palabras</p>
            <p className="text-xs text-gray-400">{formData.description.length}/500</p>
          </div>
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
              💰 Precio <span className="text-red-500">*</span>
              {validationState.price && <span className="text-green-500 ml-1">✓</span>}
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              disabled={!canEdit || loading}
              placeholder="0.00"
              step="0.01"
              min="0"
              max="1000"
              className={`w-full px-3 py-2 border text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                getFieldStatus('price') === 'invalid'
                  ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                  : getFieldStatus('price') === 'valid'
                  ? 'border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              required
            />
            {errors.price && errors.price.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {(Array.isArray(errors.price) ? errors.price : [errors.price]).map((err, idx) => (
                  <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                    ✗ {err}
                  </p>
                ))}
              </div>
            )}
            {validationState.price && !errors.price?.length && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Válido</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Máx: $1,000</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
              📊 Stock <span className="text-red-500">*</span>
              {validationState.stock && <span className="text-green-500 ml-1">✓</span>}
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              disabled={!canEdit || loading}
              placeholder="0"
              min="0"
              max="100"
              className={`w-full px-3 py-2 border text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                getFieldStatus('stock') === 'invalid'
                  ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                  : getFieldStatus('stock') === 'valid'
                  ? 'border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
              required
            />
            {errors.stock && errors.stock.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {(Array.isArray(errors.stock) ? errors.stock : [errors.stock]).map((err, idx) => (
                  <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                    ✗ {err}
                  </p>
                ))}
              </div>
            )}
            {validationState.stock && !errors.stock?.length && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Válido</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Máx: 100 unid.</p>
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
            🏷️ Categoría <span className="text-red-500">*</span>
            {validationState.category && <span className="text-green-500 ml-1">✓</span>}
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={!canEdit || loading}
            className={`w-full px-3 py-2 border text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              getFieldStatus('category') === 'invalid'
                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                : getFieldStatus('category') === 'valid'
                ? 'border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && errors.category.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {(Array.isArray(errors.category) ? errors.category : [errors.category]).map((err, idx) => (
                <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                  ✗ {err}
                </p>
              ))}
            </div>
          )}
          {validationState.category && !errors.category?.length && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Categoría seleccionada</p>
          )}
        </div>

        {/* URL de Imagen */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
            🖼️ Imagen del Producto <span className="text-gray-400 font-normal">(Opcional)</span>
          </label>
          
          {/* Current image */}
          {currentImageUrl && !imagePreview && (
            <div className="mb-2">
              <img
                src={`http://localhost:8080/api/uploads/images/${currentImageUrl}`}
                alt="Current"
                className="h-20 w-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Imagen actual</p>
            </div>
          )}

          {/* File Input */}
          <div className="mb-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              disabled={!canEdit || loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Error messages */}
          {errors.imageFile && errors.imageFile.length > 0 && (
            <div className="mt-1 space-y-0.5 mb-2">
              {errors.imageFile.map((err, idx) => (
                <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                  ✗ {err}
                </p>
              ))}
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-2 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-lg border border-green-300 dark:border-green-700"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null)
                  setFormData(prev => ({ ...prev, imageFile: null }))
                  const fileInput = document.querySelector('input[type="file"]')
                  if (fileInput) fileInput.value = ''
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                disabled={!canEdit || loading}
              >
                ✕
              </button>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Nueva imagen seleccionada</p>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Máximo 5MB - JPG, PNG, WebP, GIF
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-end pt-3 border-t border-gray-200 dark:border-gray-600">
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
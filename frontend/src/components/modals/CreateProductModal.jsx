import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ValidatedInput from '../ui/ValidatedInput'
import services from '../../services'
import Alert from '../ui/Alert'
import { getMessage } from '../../utils/validation/validationMessages'

const CreateProductModal = ({ isOpen, onClose, onProductCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageFile: null,
    imageUrl: '', // New field for image URL
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [validationState, setValidationState] = useState({}) // Para saber qué campos son válidos

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
    if (fieldErrors[fieldName]?.length > 0) return 'invalid'
    // Si tiene valor y no hay errores, verde
    if ((formData[fieldName] || formData[fieldName] === 0) && !fieldErrors[fieldName]?.length) return 'valid'
    // Si no tiene nada, neutral
    return 'neutral'
  }

  // Validadores específicos para productos - MEJORADOS
  const validateProductName = (name) => {
    const errors = []
    const trimmed = name.trim()

    if (!trimmed) {
      errors.push('El nombre del producto es requerido')
    } else {
      // Longitud
      if (trimmed.length < 3) {
        errors.push('Mínimo 3 caracteres')
      } else if (trimmed.length > 100) {
        errors.push('Máximo 100 caracteres')
      }

      // Caracteres especiales
      if (!/^[a-zA-Z0-9\s\-.,ñáéíóúÁÉÍÓÚÑ()&/\\]+$/i.test(trimmed)) {
        errors.push('Solo letras, números, espacios y caracteres: - . , ( ) & /')
      }

      // Patrones sospechosos
      if (/([a-zA-Z0-9])\1{3,}/.test(trimmed)) {
        errors.push('No repetir caracteres 4+ veces consecutivas')
      }

      // No solo números
      if (/^\d+$/.test(trimmed)) {
        errors.push('El nombre no puede ser solo números')
      }

      // No solo símbolos
      if (/^[\s\-.,()&/\\]+$/.test(trimmed)) {
        errors.push('El nombre debe incluir letras o números')
      }

      // Evitar exceso de símbolos
      const symbolCount = (trimmed.match(/[-.,()&/\\]/g) || []).length
      if (symbolCount > 5) {
        errors.push('Demasiados símbolos especiales')
      }

      // Validar que no sea demasiado genérico
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
      // Longitud
      if (trimmed.length < 10) {
        errors.push('Mínimo 10 caracteres')
      } else if (trimmed.length > 500) {
        errors.push('Máximo 500 caracteres')
      }

      // Validar que tenga palabras reales (no solo caracteres repetidos)
      const words = trimmed.split(/\s+/).filter(w => w.length > 0)
      if (words.length < 3) {
        errors.push('Describe con al menos 3 palabras')
      }

      // No demasiados caracteres repetidos
      if (/(.)\1{5,}/.test(trimmed)) {
        errors.push('Evita repetir caracteres muchas veces')
      }

      // Validar que tenga al menos algunas letras
      if (!/[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(trimmed)) {
        errors.push('La descripción debe contener letras')
      }

      // Evitar spammy patterns
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
      // Validación de rango
      if (num <= 0) {
        errors.push('El precio debe ser mayor a 0')
      } else if (num < 5) {
        errors.push('Precio mínimo: $5')
      } else if (num > 1000) {
        errors.push('Precio máximo: $1,000')
      }

      // Validar decimales
      if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        errors.push('Máximo 2 decimales (ej: 99.99)')
      }

      // Validar que no sea precio sospechoso
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
      // Validación de rango
      if (num < 0) {
        errors.push('El stock no puede ser negativo')
      } else if (num === 0) {
        errors.push('Stock mínimo: 1 unidad')
      } else if (num > 100) {
        errors.push('Stock máximo: 100 unidades')
      }

      // Validar que sea número entero
      if (!Number.isInteger(num)) {
        errors.push('El stock debe ser un número entero')
      }

      // Advertencia para stock muy bajo
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
      case 'imageUrl': // Validate image URL
        validation = validateImageUrl(value)
        break
      default:
        break
    }

    if (validation.errors.length > 0) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: validation.errors, // Guardar TODOS los errores
      }))
      setValidationState(prev => ({
        ...prev,
        [name]: false
      }))
    } else {
      setFieldErrors(prev => ({
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    
    if (file) {
      const validation = validateImageFile(file)
      
      if (validation.errors.length > 0) {
        setFieldErrors(prev => ({
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
        
        setFieldErrors(prev => ({
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
      setFieldErrors(prev => ({
        ...prev,
        imageFile: [],
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    const nameValidation = validateProductName(formData.name)
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.errors
    }

    const descValidation = validateDescription(formData.description)
    if (!descValidation.isValid) {
      newErrors.description = descValidation.errors
    }

    const priceValidation = validatePrice(formData.price)
    if (!priceValidation.isValid) {
      newErrors.price = priceValidation.errors
    }

    const stockValidation = validateStock(formData.stock)
    if (!stockValidation.isValid) {
      newErrors.stock = stockValidation.errors
    }

    const categoryValidation = validateCategory(formData.category)
    if (!categoryValidation.isValid) {
      newErrors.category = categoryValidation.errors
    }

    setFieldErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setApiError(null)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('stock', formData.stock)
      if (formData.imageFile) {
        formDataToSend.append('imageFile', formData.imageFile)
      } else if (formData.imageUrl) {
        formDataToSend.append('imageUrl', formData.imageUrl) // Add image URL if provided
      }
      
      await onProductCreated(formDataToSend)
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        imageFile: null,
        imageUrl: '',
      })
      setImagePreview(null)
      setFieldErrors({})
    } catch (error) {
      console.error('Error creating product:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el producto'
      setApiError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Producto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error general */}
        {apiError && (
          <Alert type="error" message={apiError} dismissible />
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
            placeholder="Ej: Manga One Piece Vol. 1"
            className={`w-full px-3 py-2 border text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
              getFieldStatus('name') === 'invalid'
                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                : getFieldStatus('name') === 'valid'
                ? 'border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.name && fieldErrors.name.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {fieldErrors.name.map((err, idx) => (
                <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                  ✗ {err}
                </p>
              ))}
            </div>
          )}
          {validationState.name && !fieldErrors.name?.length && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Nombre válido</p>
          )}
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 3-100 caracteres, sin caracteres extraños
            </p>
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
            placeholder="Describe tu producto detalladamente..."
            rows="3"
            className={`w-full px-3 py-2 border text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all resize-none ${
              getFieldStatus('description') === 'invalid'
                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                : getFieldStatus('description') === 'valid'
                ? 'border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.description && fieldErrors.description.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {fieldErrors.description.map((err, idx) => (
                <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                  ✗ {err}
                </p>
              ))}
            </div>
          )}
          {validationState.description && !fieldErrors.description?.length && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Descripción válida</p>
          )}
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Mínimo 10 caracteres, 3+ palabras, detallado
            </p>
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
              placeholder="0.00"
              step="0.01"
              min="0"
              max="1000"
              className={`w-full px-3 py-2 border text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                getFieldStatus('price') === 'invalid'
                  ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                  : getFieldStatus('price') === 'valid'
                  ? 'border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
            />
            {fieldErrors.price && fieldErrors.price.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {fieldErrors.price.map((err, idx) => (
                  <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                    ✗ {err}
                  </p>
                ))}
              </div>
            )}
            {validationState.price && !fieldErrors.price?.length && (
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
              placeholder="0"
              min="0"
              max="100"
              className={`w-full px-3 py-2 border text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                getFieldStatus('stock') === 'invalid'
                  ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                  : getFieldStatus('stock') === 'valid'
                  ? 'border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }`}
            />
            {fieldErrors.stock && fieldErrors.stock.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {fieldErrors.stock.map((err, idx) => (
                  <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                    ✗ {err}
                  </p>
                ))}
              </div>
            )}
            {validationState.stock && !fieldErrors.stock?.length && (
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
            className={`w-full px-3 py-2 border text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
              getFieldStatus('category') === 'invalid'
                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                : getFieldStatus('category') === 'valid'
                ? 'border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {fieldErrors.category && fieldErrors.category.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {fieldErrors.category.map((err, idx) => (
                <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                  ✗ {err}
                </p>
              ))}
            </div>
          )}
          {validationState.category && !fieldErrors.category?.length && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Categoría seleccionada</p>
          )}
        </div>

        {/* URL de Imagen */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
            🌐 URL de la Imagen <span className="text-gray-400 font-normal">(Opcional)</span>
          </label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/imagen.jpg"
            className={`w-full px-3 py-2 border text-sm rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
              getFieldStatus('imageUrl') === 'invalid'
                ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                : getFieldStatus('imageUrl') === 'valid'
                ? 'border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            }`}
          />
          {fieldErrors.imageUrl && fieldErrors.imageUrl.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {fieldErrors.imageUrl.map((err, idx) => (
                <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                  ✗ {err}
                </p>
              ))}
            </div>
          )}
          {validationState.imageUrl && !fieldErrors.imageUrl?.length && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ URL válida</p>
          )}
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
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateProductModal

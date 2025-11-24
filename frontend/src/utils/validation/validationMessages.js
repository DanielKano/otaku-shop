/**
 * 📝 MENSAJES DE ERROR CENTRALIZADOS
 * Mensajes específicos y accionables para cada tipo de validación
 */

export const VALIDATION_MESSAGES = {
  // ========================================
  // NOMBRE COMPLETO (Full Name)
  // ========================================
  FULLNAME: {
    REQUIRED: 'El nombre completo es obligatorio',
    TOO_SHORT: 'El nombre debe tener al menos 6 caracteres',
    TOO_LONG: 'El nombre no puede exceder 50 caracteres',
    INVALID_FORMAT: 'El nombre solo puede contener letras, tildes, espacios, guiones y apóstrofes',
    MISSING_LASTNAME: 'Debes ingresar nombre y apellido (mínimo 2 palabras)',
    WORD_TOO_SHORT: 'Cada palabra debe tener al menos 3 caracteres (excepto nombres especiales como "Ana", "Li")',
    REPEATED_NAME: 'El nombre y apellido no pueden ser idénticos',
    MULTIPLE_SPACES: 'No se permiten espacios múltiples consecutivos',
    STARTS_WITH_SPACE: 'El nombre no puede comenzar con espacio',
    ENDS_WITH_SPACE: 'El nombre no puede terminar con espacio',
    KEYBOARD_MASHING: 'El nombre ingresado no parece válido. Por favor verifica',
    SEQUENTIAL_PATTERN: 'El nombre contiene una secuencia sospechosa. Por favor verifica',
    REPEATED_CHARS: 'El nombre contiene demasiados caracteres repetidos',
    SUSPICIOUS: 'El nombre ingresado parece inusual. ¿Está escrito correctamente?',
    EXCESSIVE_HYPHENS: 'Uso excesivo de guiones. Verifica la ortografía'
  },

  // ========================================
  // CORREO ELECTRÓNICO (Email)
  // ========================================
  EMAIL: {
    REQUIRED: 'El correo electrónico es obligatorio',
    INVALID_FORMAT: 'Formato de correo inválido',
    INVALID_DOMAIN: 'Solo se permiten correos de: Gmail, Hotmail, Outlook, Yahoo',
    INVALID_SUFFIX: 'Solo se permiten sufijos: .com, .co, .org, .net, .edu',
    TOO_SHORT: 'El correo debe tener al menos 6 caracteres antes del @',
    TOO_LONG: 'El correo no puede exceder 64 caracteres antes del @',
    STARTS_WITH_DOT: 'El correo no puede comenzar con punto',
    ENDS_WITH_DOT: 'El correo no puede terminar con punto antes del @',
    CONSECUTIVE_DOTS: 'El correo no puede tener puntos consecutivos',
    ALREADY_EXISTS: 'Este correo ya está registrado',
    GENERIC_WARNING: 'El correo parece genérico o de prueba. ¿Es correcto?',
    MISMATCH_WITH_NAME: 'El correo no parece coincidir con el nombre ingresado'
  },

  // ========================================
  // TELÉFONO COLOMBIA (Colombian Phone)
  // ========================================
  PHONE: {
    REQUIRED: 'El teléfono es obligatorio',
    INVALID_LENGTH: 'El teléfono debe tener exactamente 10 dígitos',
    INVALID_PREFIX: 'El prefijo no corresponde a un operador colombiano válido',
    INVALID_FORMAT: 'Solo se permiten números (sin espacios ni guiones)',
    ALL_ZEROS: 'El número telefónico no puede ser solo ceros',
    SEQUENTIAL: 'El número parece una secuencia. Verifica que sea correcto',
    REPEATED_DIGITS: 'El número contiene demasiados dígitos repetidos',
    SUSPICIOUS: 'El número parece inválido. Por favor verifica',
    HINT: 'Formato: 300 123 4567 (operadores: Claro, Movistar, Tigo, WOM, Avantel)'
  },

  // ========================================
  // CONTRASEÑA (Password)
  // ========================================
  PASSWORD: {
    REQUIRED: 'La contraseña es obligatoria',
    TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
    TOO_LONG: 'La contraseña no puede exceder 32 caracteres',
    MISSING_UPPERCASE: 'Debe contener al menos 1 letra mayúscula (A-Z)',
    MISSING_LOWERCASE: 'Debe contener al menos 1 letra minúscula (a-z)',
    MISSING_NUMBER: 'Debe contener al menos 1 número (0-9)',
    MISSING_SPECIAL: 'Debe contener al menos 1 símbolo (!@#$%^&*)',
    INVALID_CHARS: 'Solo se permiten letras, números y símbolos: !@#$%^&*()_+-=[]{}|;:,.<>?',
    CONTAINS_NAME: 'La contraseña no puede contener tu nombre',
    CONTAINS_EMAIL: 'La contraseña no puede contener tu correo',
    COMMON_PASSWORD: 'Esta contraseña es muy común. Elige una más segura',
    COMPROMISED: '⚠️ Esta contraseña ha sido comprometida en filtraciones. Usa otra',
    WEAK: 'Contraseña débil',
    MEDIUM: 'Contraseña media',
    STRONG: 'Contraseña fuerte',
    VERY_STRONG: 'Contraseña muy fuerte'
  },

  // ========================================
  // CONFIRMACIÓN DE CONTRASEÑA
  // ========================================
  PASSWORD_CONFIRM: {
    REQUIRED: 'Debes confirmar tu contraseña',
    MISMATCH: 'Las contraseñas no coinciden'
  },

  // ========================================
  // PRODUCTO (Product)
  // ========================================
  PRODUCT: {
    NAME_REQUIRED: 'El nombre del producto es obligatorio',
    NAME_TOO_SHORT: 'El nombre debe tener al menos 3 caracteres',
    NAME_TOO_LONG: 'El nombre no puede exceder 80 caracteres',
    NAME_INVALID: 'El nombre contiene caracteres no permitidos',
    NAME_SPAM: 'El nombre parece spam o inválido',
    NAME_REPEATED: 'El nombre contiene palabras repetidas innecesariamente',
    NAME_CLICKBAIT: 'Evita uso excesivo de palabras como "GRATIS", "ÚNICO", "OFERTA"',
    STOCK_REQUIRED: 'El stock es obligatorio',
    STOCK_MIN: 'El stock mínimo es 1 unidad',
    STOCK_MAX: 'El stock máximo es 100 unidades',
    PRICE_REQUIRED: 'El precio es obligatorio',
    PRICE_MIN: 'El precio mínimo es $1.00',
    PRICE_MAX: 'El precio máximo es $1,000.00',
    PRICE_INVALID: 'El precio debe tener máximo 2 decimales',
    
    // Descripción detallada (Fase 2)
    DESCRIPTION_REQUIRED: 'La descripción es obligatoria',
    DESCRIPTION_TOO_SHORT: 'La descripción debe tener al menos {minChars} caracteres (actual: {currentChars})',
    DESCRIPTION_TOO_LONG: 'La descripción no puede exceder {maxChars} caracteres (actual: {currentChars})',
    DESCRIPTION_MIN_WORDS: 'La descripción debe tener al menos {minWords} palabras (actual: {currentWords})',
    DESCRIPTION_SPAM: 'La palabra "{word}" se repite {count} veces. Esto parece spam. Máximo permitido: {max} repeticiones',
    
    // Imágenes (Fase 2)
    IMAGE_REQUIRED: 'Debes subir al menos 1 imagen',
    IMAGE_MAX_COUNT: 'Máximo 5 imágenes permitidas',
    IMAGE_INVALID_FORMAT: 'Solo se permiten imágenes {formats}',
    IMAGE_TOO_LARGE: 'La imagen no puede superar {maxSize}MB (actual: {currentSize}MB)',
    IMAGE_MIN_DIMENSIONS: 'La imagen debe tener al menos {minWidth}x{minHeight} píxeles (actual: {width}x{height})',
    IMAGE_MAX_DIMENSIONS: 'La imagen no puede superar {maxWidth}x{maxHeight} píxeles (actual: {width}x{height})',
    IMAGE_URL_INVALID: 'La URL de la imagen no es válida',
    IMAGE_URL_INVALID_EXTENSION: 'La URL debe terminar en una extensión de imagen válida ({extensions})'
  },

  // ========================================
  // CHECKOUT & CARRITO (Cart & Checkout)
  // ========================================
  CART: {
    EMPTY: 'El carrito está vacío',
    MAX_QUANTITY: 'Máximo 5 unidades por producto',
    INSUFFICIENT_STOCK: 'Stock insuficiente',
    PRODUCT_UNAVAILABLE: 'Producto no disponible',
    PRICE_CHANGED: 'El precio del producto ha cambiado. Revisa tu carrito',
    
    // Validación de cantidad (Fase 2)
    QUANTITY_REQUIRED: 'La cantidad es obligatoria',
    QUANTITY_INVALID: 'La cantidad debe ser un número entero',
    QUANTITY_MIN: 'La cantidad mínima es 1',
    QUANTITY_EXCEEDS_STOCK: 'No hay suficiente stock disponible. Disponible: {availableStock}',
    
    // Reservas de stock (Fase 2)
    RESERVATION_EXPIRED: 'Tu reserva ha expirado. Los productos fueron liberados',
    RESERVATION_EXPIRING: 'Tu reserva expira en {minutes} minutos',
    RESERVATION_SUCCESS: '{quantity} unidades reservadas por 15 minutos',
    RESERVATION_UPDATED: 'Reserva actualizada: {quantity} unidades',
    RESERVATION_RELEASED: 'Reserva liberada exitosamente',
    RESERVATION_RENEWED: 'Reserva renovada por 15 minutos más',
    RESERVATION_ERROR: 'Error al reservar stock: {error}'
  },

  // ========================================
  // CHECKOUT (Fase 3)
  // ========================================
  CHECKOUT: {
    // Dirección
    ADDRESS_REQUIRED: 'La dirección de envío es obligatoria',
    STREET_REQUIRED: 'La dirección es obligatoria',
    STREET_TOO_SHORT: 'La dirección debe tener al menos 10 caracteres',
    STREET_TOO_LONG: 'La dirección no puede exceder 200 caracteres',
    CITY_REQUIRED: 'La ciudad es obligatoria',
    CITY_TOO_SHORT: 'El nombre de la ciudad debe tener al menos 3 caracteres',
    CITY_TOO_LONG: 'El nombre de la ciudad no puede exceder 50 caracteres',
    CITY_INVALID: 'La ciudad solo puede contener letras y espacios',
    DEPARTMENT_REQUIRED: 'El departamento es obligatorio',
    DEPARTMENT_INVALID: 'Departamento no válido',
    POSTAL_CODE_REQUIRED: 'El código postal es obligatorio',
    POSTAL_CODE_INVALID: 'El código postal debe tener 6 dígitos',
    
    // Método de pago
    PAYMENT_METHOD_REQUIRED: 'Debes seleccionar un método de pago',
    PAYMENT_METHOD_INVALID: 'Método de pago no válido',
    
    // Tarjeta
    CARD_NUMBER_REQUIRED: 'El número de tarjeta es obligatorio',
    CARD_NUMBER_INVALID: 'El número de tarjeta no es válido',
    CARD_NUMBER_FORMAT: 'El número de tarjeta solo puede contener dígitos',
    CARD_NUMBER_LENGTH: 'El número de tarjeta debe tener entre 13 y 19 dígitos',
    CARD_HOLDER_REQUIRED: 'El nombre del titular es obligatorio',
    CARD_HOLDER_TOO_SHORT: 'El nombre del titular debe tener al menos 3 caracteres',
    CARD_HOLDER_INVALID: 'El nombre del titular solo puede contener letras y espacios',
    CARD_EXPIRY_REQUIRED: 'La fecha de expiración es obligatoria',
    CARD_EXPIRY_INVALID: 'Formato de fecha inválido. Use MM/YY o MM/YYYY',
    CARD_EXPIRED: 'La tarjeta ha expirado',
    CARD_EXPIRING_SOON: 'La tarjeta expira en {months} {monthText}',
    CVV_REQUIRED: 'El CVV es obligatorio',
    CVV_INVALID: 'El CVV solo puede contener dígitos',
    CVV_LENGTH: 'El CVV debe tener 3 o 4 dígitos',
    
    // Totales
    TOTALS_REQUIRED: 'Los totales de la orden son obligatorios',
    SUBTOTAL_INVALID: 'Subtotal inválido',
    SHIPPING_INVALID: 'Costo de envío inválido',
    DISCOUNT_INVALID: 'Descuento inválido',
    TAX_INVALID: 'Impuesto inválido',
    TOTAL_INVALID: 'Total inválido',
    TOTALS_MISMATCH: 'Los totales no cuadran correctamente',
    MIN_ORDER_AMOUNT: 'El monto mínimo de orden es ${minAmount}',
    
    // Cupón
    COUPON_REQUIRED: 'El código de cupón es obligatorio',
    COUPON_TOO_SHORT: 'El código de cupón debe tener al menos 3 caracteres',
    COUPON_TOO_LONG: 'El código de cupón no puede exceder 20 caracteres',
    COUPON_INVALID: 'El código de cupón solo puede contener letras, números y guiones',
    COUPON_NOT_FOUND: 'Cupón no encontrado o inválido',
    COUPON_EXPIRED: 'El cupón ha expirado',
    COUPON_NOT_APPLICABLE: 'El cupón no es aplicable a estos productos',
    
    // General
    ITEMS_REQUIRED: 'El carrito está vacío'
  },

  // ========================================
  // GENÉRICOS
  // ========================================
  GENERIC: {
    REQUIRED: 'Este campo es obligatorio',
    INVALID: 'El valor ingresado no es válido',
    SERVER_ERROR: 'Error del servidor. Intenta nuevamente',
    NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
    UNAUTHORIZED: 'Debes iniciar sesión para continuar',
    FORBIDDEN: 'No tienes permisos para realizar esta acción',
    NOT_FOUND: 'Recurso no encontrado',
    RATE_LIMIT: 'Demasiados intentos. Espera un momento e intenta de nuevo'
  }
};

/**
 * Función helper para obtener mensajes dinámicos
 */
export const getMessage = (category, key, params = {}) => {
  let message = VALIDATION_MESSAGES[category]?.[key] || VALIDATION_MESSAGES.GENERIC.INVALID;
  
  // Reemplazar parámetros dinámicos
  Object.keys(params).forEach(param => {
    message = message.replace(`{${param}}`, params[param]);
  });
  
  return message;
};

export default VALIDATION_MESSAGES;

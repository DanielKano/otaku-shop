/**
 * 🎯 VALIDADORES PRINCIPALES
 * Combina validaciones estructurales (regex) con semánticas (lógica de negocio)
 */

import { 
  FULL_NAME_REGEX, 
  STRICT_EMAIL_REGEX, 
  COLOMBIAN_PHONE_REGEX, 
  PASSWORD_PATTERNS,
  PRODUCT_NAME_REGEX 
} from './regexPatterns';

import { 
  calculateNameRealismScore,
  hasMinimumWords,
  validateWordLengths,
  detectSuspiciousPhone,
  calculatePasswordStrength,
  isCommonPassword,
  containsPersonalInfo,
  validateProductNameCoherence
} from './semanticValidators';

import { 
  VALIDATION_MESSAGES, getMessage 
} from './validationMessages';

// Normal helpers
const normalizeName = s => s.trim().replace(/\s+/g,' ');
const normalizeEmail = s => s.trim().toLowerCase();
const normalizePhone = s => s.replace(/[^\d]/g, '');

// EMAIL VALIDATOR
const allowedDomains = ['gmail.com','hotmail.com','outlook.com','yahoo.com','otaku.com','otakushop.com'];

// PHONE VALIDATOR
const phonePrefixRegex = /^(300|301|302|303|304|305|310|311|312|313|314|315|316|317|318|319|320|321|322|323)\d{7}$/;

/**
 * ====================================
 * VALIDADOR DE NOMBRE COMPLETO
 * ====================================
 */

/**
 * Valida nombre completo con 3 niveles:
 * 1. Estructural (regex)
 * 2. Lógico (palabras mínimas, longitudes)
 * 3. Semántico (anti-spam, realismo)
 * 
 * @param {string} fullName - Nombre completo a validar
 * @param {Object} options - Opciones de validación
 * @returns {Object} { isValid: boolean, errors: string[], warnings: string[], score: number }
 */
export const validateFullName = (raw) => {
  const s = normalizeName(raw);
  const errors = [];
  if(s.length < 3 || s.length > 60) errors.push('length');
  if(!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(s)) errors.push('chars');
  if(!/[aeiouAEIOUáéíóú]/.test(s)) errors.push('no_vowel');
  if(!/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZñÑ]/.test(s)) errors.push('no_consonant');
  if(/([A-Za-zÁÉÍÓÚáéíóúñÑ])\1{3}/.test(s)) errors.push('repeated_chars');
  if(/\b([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\b\s+\1\b/i.test(s)) errors.push('repeated_word');
  if(/asdf|qwer|zxcv|qwerty|abc|abcd|1234/i.test(s)) errors.push('incoherent_pattern');
  if(/\b\w{31,}\b/.test(s)) errors.push('long_word'); // palabra muy larga
  if(/[aeiouAEIOUáéíóú]{4,}/.test(s)) errors.push('many_vowels_seq');
  if(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZñÑ]{4,}/.test(s)) errors.push('many_consonants_seq');

  // New validations
  const words = s.split(' ');
  for (const word of words) {
    if (word.length < 3) {
      errors.push('word_too_short');
      break; 
    }
    if (/^(.)\1+$/.test(word)) {
      errors.push('word_repeated_chars');
      break;
    }
  }

  return { ok: errors.length===0, errors };
}

/**
 * ====================================
 * VALIDADOR DE EMAIL
 * ====================================
 */

/**
 * Valida email con verificación de dominio permitido
 */
export const validateEmail = (raw) => {
  const s = normalizeEmail(raw);
  const errors = [];
  if(s.length < 6 || s.length > 50) errors.push('length');
  if(s.includes('..')) errors.push('double_dot');
  if(!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.(com|co)$/.test(s)) errors.push('format');
  const parts = s.split('@');
  if(parts.length !== 2 || parts[0].length < 3) errors.push('local_short');
  if(!allowedDomains.includes(parts[1])) errors.push('domain_not_allowed');
  return { ok: errors.length===0, errors };
}

/**
 * ====================================
 * VALIDADOR DE TELÉFONO
 * ====================================
 */

/**
 * Valida número telefónico colombiano (10 dígitos)
 */
export const validatePhone = (raw) => {
  let s = normalizePhone(raw);
  if(s.length === 11 && s.startsWith('57')) s = s.slice(2);
  const errors = [];
  if(s.length !== 10) errors.push('length');
  if(!phonePrefixRegex.test(s)) errors.push('prefix');
  if(/^(.)\1{3,}$/.test(s.slice(3))) errors.push('too_many_repeats'); // after prefix
  if(/0123456789|1234567890|0987654321/.test(s)) errors.push('sequence');
  return { ok: errors.length===0, errors };
}

/**
 * ====================================
 * VALIDADOR DE CONTRASEÑA
 * ====================================
 */

/**
 * Valida contraseña con verificación de fortaleza
 */
export const validatePassword = (raw) => {
  const errors = [];
  if(raw.length < 8) errors.push('length');
  if(!/[A-Z]/.test(raw)) errors.push('upper');
  if(!/[a-z]/.test(raw)) errors.push('lower');
  if(!/[0-9]/.test(raw)) errors.push('digit');
  if(!/[!@#$%^&*?.]/.test(raw)) errors.push('special');
  if(/\s/.test(raw)) errors.push('spaces');
  // optional denylist check here
  return { ok: errors.length===0, errors };
}

/**
 * ====================================
 * VALIDADOR DE NOMBRE DE PRODUCTO
 * ====================================
 */

/**
 * Valida nombre de producto con verificación de coherencia
 */
export const validateProductName = (productName, options = {}) => {
  const {
    category = null,
    minLength = 3,
    maxLength = 100,
    enableCoherenceCheck = true
  } = options;

  const errors = [];
  const warnings = [];

  // 1. Campo vacío
  if (!productName || productName.trim() === '') {
    errors.push(VALIDATION_MESSAGES.PRODUCT.NAME_REQUIRED);
    return { isValid: false, errors, warnings };
  }

  const trimmedName = productName.trim();

  // 2. Longitud
  if (trimmedName.length < minLength) {
    errors.push(
      VALIDATION_MESSAGES.getMessage(
        VALIDATION_MESSAGES.PRODUCT.NAME_TOO_SHORT,
        { minLength }
      )
    );
    return { isValid: false, errors, warnings };
  }

  if (trimmedName.length > maxLength) {
    errors.push(
      VALIDATION_MESSAGES.getMessage(
        VALIDATION_MESSAGES.PRODUCT.NAME_TOO_LONG,
        { maxLength }
      )
    );
    return { isValid: false, errors, warnings };
  }

  // 3. Formato válido
  if (!PRODUCT_NAME_REGEX.test(trimmedName)) {
    errors.push(VALIDATION_MESSAGES.PRODUCT.NAME_INVALID_FORMAT);
    return { isValid: false, errors, warnings };
  }

  // 4. Verificar coherencia con categoría
  if (enableCoherenceCheck && category) {
    const coherenceResult = validateProductNameCoherence(trimmedName, category);

    if (!coherenceResult.coherent) {
      if (coherenceResult.issues.some(i => i.includes('missing_category_keyword'))) {
        warnings.push(
          VALIDATION_MESSAGES.getMessage(
            VALIDATION_MESSAGES.PRODUCT.NAME_CATEGORY_MISMATCH,
            { category }
          )
        );
      }

      if (coherenceResult.issues.some(i => i.includes('repeated_word'))) {
        warnings.push(VALIDATION_MESSAGES.PRODUCT.NAME_SPAM);
      }

      if (coherenceResult.issues.includes('clickbait_detected')) {
        warnings.push(VALIDATION_MESSAGES.PRODUCT.NAME_CLICKBAIT);
      }

      if (coherenceResult.issues.includes('excessive_caps')) {
        warnings.push(VALIDATION_MESSAGES.PRODUCT.NAME_SPAM);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * ====================================
 * VALIDADOR DE STOCK
 * ====================================
 */

export const validateStock = (stock) => {
  const errors = [];

  if (stock === null || stock === undefined || stock === '') {
    errors.push(VALIDATION_MESSAGES.PRODUCT.STOCK_REQUIRED);
    return { isValid: false, errors };
  }

  const numStock = Number(stock);

  if (isNaN(numStock)) {
    errors.push(VALIDATION_MESSAGES.PRODUCT.STOCK_INVALID);
    return { isValid: false, errors };
  }

  if (numStock < 0) {
    errors.push(VALIDATION_MESSAGES.PRODUCT.STOCK_NEGATIVE);
    return { isValid: false, errors };
  }

  if (!Number.isInteger(numStock)) {
    errors.push(VALIDATION_MESSAGES.PRODUCT.STOCK_INTEGER);
    return { isValid: false, errors };
  }

  return { isValid: true, errors };
};

/**
 * ====================================
 * VALIDADOR DE PRECIO
 * ====================================
 */

export const validatePrice = (price, options = {}) => {
  const { minPrice = 0, maxPrice = 1000 } = options;
  const errors = [];

  if (price === null || price === undefined || price === '') {
    errors.push(VALIDATION_MESSAGES.PRODUCT.PRICE_REQUIRED);
    return { isValid: false, errors };
  }

  const numPrice = Number(price);

  if (isNaN(numPrice)) {
    errors.push(VALIDATION_MESSAGES.PRODUCT.PRICE_INVALID);
    return { isValid: false, errors };
  }

  if (numPrice < minPrice) {
    errors.push(
      VALIDATION_MESSAGES.getMessage(
        VALIDATION_MESSAGES.PRODUCT.PRICE_TOO_LOW,
        { minPrice }
      )
    );
    return { isValid: false, errors };
  }

  if (numPrice > maxPrice) {
    errors.push(
      VALIDATION_MESSAGES.getMessage(
        VALIDATION_MESSAGES.PRODUCT.PRICE_TOO_HIGH,
        { maxPrice }
      )
    );
    return { isValid: false, errors };
  }

  return { isValid: true, errors };
};

/**
 * ====================================
 * VALIDADOR DE DESCRIPCIÓN
 * ====================================
 */

export const validateDescription = (description, options = {}) => {
  const {
    minWords = 10,
    minChars = 30,
    maxChars = 1000,
    enableSpamCheck = true
  } = options;

  const errors = [];
  const warnings = [];

  // 1. Campo vacío
  if (!description || description.trim() === '') {
    errors.push(VALIDATION_MESSAGES.PRODUCT.DESCRIPTION_REQUIRED);
    return { isValid: false, errors, warnings };
  }

  const trimmedDesc = description.trim();

  // 2. Longitud de caracteres
  if (trimmedDesc.length < minChars) {
    errors.push(
      getMessage('PRODUCT', 'DESCRIPTION_TOO_SHORT', {
        minChars,
        currentChars: trimmedDesc.length
      })
    );
    return { isValid: false, errors, warnings };
  }

  if (trimmedDesc.length > maxChars) {
    errors.push(
      getMessage('PRODUCT', 'DESCRIPTION_TOO_LONG', {
        maxChars,
        currentChars: trimmedDesc.length
      })
    );
    return { isValid: false, errors, warnings };
  }

  // 3. Número mínimo de palabras
  const words = trimmedDesc.split(/\s+/).filter(w => w.length > 0);
  if (words.length < minWords) {
    errors.push(
      getMessage('PRODUCT', 'DESCRIPTION_MIN_WORDS', {
        minWords,
        currentWords: words.length
      })
    );
    return { isValid: false, errors, warnings };
  }

  // 4. Detección de spam (opcional)
  if (enableSpamCheck) {
    // Detectar palabras repetidas excesivamente (más de 5 veces)
    const wordCounts = {};
    words.forEach(word => {
      const lower = word.toLowerCase();
      // Ignorar palabras muy cortas (artículos, preposiciones)
      if (lower.length > 3) {
        wordCounts[lower] = (wordCounts[lower] || 0) + 1;
      }
    });

    const MAX_REPETITIONS = 5;
    Object.entries(wordCounts).forEach(([word, count]) => {
      if (count > MAX_REPETITIONS) {
        errors.push(
          getMessage('PRODUCT', 'DESCRIPTION_SPAM', {
            word,
            count,
            max: MAX_REPETITIONS
          })
        );
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * ====================================
 * VALIDADOR DE IMÁGENES
 * ====================================
 */

/**
 * Valida archivo de imagen antes de subir
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB por defecto
    allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    minWidth = 400,
    minHeight = 400,
    maxWidth = 4000,
    maxHeight = 4000
  } = options;

  const errors = [];

  // 1. Verificar que hay archivo
  if (!file) {
    errors.push(VALIDATION_MESSAGES.PRODUCT.IMAGE_REQUIRED);
    return Promise.resolve({ isValid: false, errors });
  }

  // 2. Verificar formato
  if (!allowedFormats.includes(file.type)) {
    const formatNames = allowedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ');
    errors.push(
      getMessage('PRODUCT', 'IMAGE_INVALID_FORMAT', {
        formats: formatNames
      })
    );
    return Promise.resolve({ isValid: false, errors });
  }

  // 3. Verificar tamaño
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    const currentSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    errors.push(
      getMessage('PRODUCT', 'IMAGE_TOO_LARGE', {
        maxSize: maxSizeMB,
        currentSize: currentSizeMB
      })
    );
    return Promise.resolve({ isValid: false, errors });
  }

  // 4. Verificar dimensiones (asíncrono)
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { width, height } = img;

      if (width < minWidth || height < minHeight) {
        errors.push(
          getMessage('PRODUCT', 'IMAGE_MIN_DIMENSIONS', {
            minWidth,
            minHeight,
            width,
            height
          })
        );
      }

      if (width > maxWidth || height > maxHeight) {
        errors.push(
          getMessage('PRODUCT', 'IMAGE_MAX_DIMENSIONS', {
            maxWidth,
            maxHeight,
            width,
            height
          })
        );
      }

      resolve({
        isValid: errors.length === 0,
        errors,
        dimensions: { width, height }
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      errors.push('No se pudo cargar la imagen. Archivo corrupto o inválido');
      resolve({ isValid: false, errors });
    };

    img.src = objectUrl;
  });
};

/**
 * Valida URL de imagen
 */
export const validateImageUrl = (url) => {
  const errors = [];

  if (!url || url.trim() === '') {
    errors.push(VALIDATION_MESSAGES.PRODUCT.IMAGE_REQUIRED);
    return { isValid: false, errors };
  }

  // Regex para URL de imagen
  const imageUrlPattern = /^(https?:\/\/.*\.(jpg|jpeg|png|webp|gif)|^\/uploads\/images\/.*\.(jpg|jpeg|png|webp|gif))$/i;

  if (!imageUrlPattern.test(url.trim())) {
    errors.push(
      getMessage('PRODUCT', 'IMAGE_URL_INVALID_EXTENSION', {
        extensions: 'jpg, jpeg, png, webp, gif'
      })
    );
    return { isValid: false, errors };
  }

  return { isValid: true, errors };
};

/**
 * ====================================
 * VALIDADORES DE CARRITO
 * ====================================
 */

/**
 * Valida cantidad de producto en carrito
 */
export const validateCartQuantity = (quantity, availableStock) => {
  const errors = [];

  if (quantity === null || quantity === undefined || quantity === '') {
    errors.push(VALIDATION_MESSAGES.CART.QUANTITY_REQUIRED);
    return { isValid: false, errors };
  }

  const numQuantity = Number(quantity);

  if (isNaN(numQuantity) || !Number.isInteger(numQuantity)) {
    errors.push(VALIDATION_MESSAGES.CART.QUANTITY_INVALID);
    return { isValid: false, errors };
  }

  if (numQuantity < 1) {
    errors.push(VALIDATION_MESSAGES.CART.QUANTITY_MIN);
    return { isValid: false, errors };
  }

  if (availableStock !== undefined && numQuantity > availableStock) {
    errors.push(
      getMessage('CART', 'QUANTITY_EXCEEDS_STOCK', {
        availableStock
      })
    );
    return { isValid: false, errors };
  }

  return { isValid: true, errors };
};

export default {
  validateFullName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateProductName,
  validateStock,
  validatePrice,
  validateDescription,
  validateImageFile,
  validateImageUrl,
  validateCartQuantity
};

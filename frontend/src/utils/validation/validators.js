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

import { VALIDATION_MESSAGES, getMessage } from './validationMessages';

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
export const validateFullName = (fullName, options = {}) => {
  const {
    minWords = 2,
    enableSemanticValidation = true,
    strictMode = true // true = rechazar nombres con score < 50
  } = options;

  const errors = [];
  const warnings = [];
  let score = 100;

  // ==================
  // NIVEL 1: ESTRUCTURA
  // ==================

  // 1.1 Campo vacío
  if (!fullName || fullName.trim() === '') {
    errors.push(VALIDATION_MESSAGES.FULLNAME.REQUIRED);
    return { isValid: false, errors, warnings, score: 0 };
  }

  const trimmedName = fullName.trim();

  // 1.2 Longitud mínima
  if (trimmedName.length < 5) {
    errors.push(VALIDATION_MESSAGES.FULLNAME.TOO_SHORT);
    return { isValid: false, errors, warnings, score: 10 };
  }

  // 1.3 Longitud máxima
  if (trimmedName.length > 100) {
    errors.push(VALIDATION_MESSAGES.FULLNAME.TOO_LONG);
    return { isValid: false, errors, warnings, score: 10 };
  }

  // 1.4 Formato válido (regex)
  if (!FULL_NAME_REGEX.test(trimmedName)) {
    errors.push(VALIDATION_MESSAGES.FULLNAME.INVALID_FORMAT);
    return { isValid: false, errors, warnings, score: 15 };
  }

  // ==================
  // NIVEL 2: LÓGICO
  // ==================

  // 2.1 Mínimo de palabras
  if (!hasMinimumWords(trimmedName, minWords)) {
    errors.push(VALIDATION_MESSAGES.FULLNAME.INSUFFICIENT_WORDS);
    return { isValid: false, errors, warnings, score: 20 };
  }

  // 2.2 Longitud de palabras individuales
  const wordLengthResult = validateWordLengths(trimmedName);
  if (!wordLengthResult.valid) {
    errors.push(
      VALIDATION_MESSAGES.getMessage(
        VALIDATION_MESSAGES.FULLNAME.WORD_TOO_SHORT,
        { words: wordLengthResult.invalidWords.join(', ') }
      )
    );
    return { isValid: false, errors, warnings, score: 25 };
  }

  // ==================
  // NIVEL 3: SEMÁNTICO
  // ==================

  if (enableSemanticValidation) {
    const realismResult = calculateNameRealismScore(trimmedName);
    score = realismResult.score;

    // 3.1 Palabras repetidas
    if (realismResult.issues.includes('repeated_word')) {
      if (strictMode) {
        errors.push(VALIDATION_MESSAGES.FULLNAME.REPEATED_NAME);
      } else {
        warnings.push(VALIDATION_MESSAGES.FULLNAME.REPEATED_NAME);
      }
    }

    // 3.2 Tecleo aleatorio (keyboard mashing)
    if (realismResult.issues.some(i => i.includes('keyboard_mashing'))) {
      errors.push(VALIDATION_MESSAGES.FULLNAME.KEYBOARD_MASHING);
      return { isValid: false, errors, warnings, score };
    }

    // 3.3 Secuencias
    if (realismResult.issues.some(i => i.includes('sequence'))) {
      errors.push(VALIDATION_MESSAGES.FULLNAME.NUMBER_SEQUENCE);
      return { isValid: false, errors, warnings, score };
    }

    // 3.4 Caracteres repetidos
    if (realismResult.issues.some(i => i.includes('repeated_chars'))) {
      if (strictMode) {
        errors.push(VALIDATION_MESSAGES.FULLNAME.REPEATED_CHARS);
      } else {
        warnings.push(VALIDATION_MESSAGES.FULLNAME.REPEATED_CHARS);
      }
    }

    // 3.5 Exceso de mayúsculas
    if (realismResult.issues.some(i => i.includes('excessive_uppercase'))) {
      warnings.push(VALIDATION_MESSAGES.FULLNAME.EXCESSIVE_CAPS);
    }

    // 3.6 Sin capitalización
    if (realismResult.issues.some(i => i.includes('no_capitalization'))) {
      warnings.push(VALIDATION_MESSAGES.FULLNAME.INVALID_CAPITALIZATION);
    }

    // 3.7 Score general bajo (nombre sospechoso)
    if (!realismResult.isValid && strictMode) {
      errors.push(VALIDATION_MESSAGES.FULLNAME.SUSPICIOUS);
      return { isValid: false, errors, warnings, score };
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score
  };
};

/**
 * ====================================
 * VALIDADOR DE EMAIL
 * ====================================
 */

/**
 * Valida email con verificación de dominio permitido
 */
export const validateEmail = (email, options = {}) => {
  const {
    checkDomain = true,
    allowedDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'otaku.com', 'otakushop.com']
  } = options;

  const errors = [];
  const warnings = [];

  // 1. Campo vacío
  if (!email || email.trim() === '') {
    errors.push(VALIDATION_MESSAGES.EMAIL.REQUIRED);
    return { isValid: false, errors, warnings };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // 2. Formato básico
  if (!STRICT_EMAIL_REGEX.test(trimmedEmail)) {
    errors.push(VALIDATION_MESSAGES.EMAIL.INVALID_FORMAT);
    return { isValid: false, errors, warnings };
  }

  // 3. Verificar dominio permitido
  if (checkDomain) {
    const domain = trimmedEmail.split('@')[1];
    if (!allowedDomains.includes(domain)) {
      errors.push(
        VALIDATION_MESSAGES.getMessage(
          VALIDATION_MESSAGES.EMAIL.INVALID_DOMAIN,
          { domains: allowedDomains.join(', ') }
        )
      );
      return { isValid: false, errors, warnings };
    }
  }

  // 4. Advertir sobre proveedores genéricos
  const genericDomains = ['gmail.com', 'hotmail.com', 'yahoo.com'];
  const domain = trimmedEmail.split('@')[1];
  if (genericDomains.includes(domain)) {
    warnings.push(VALIDATION_MESSAGES.EMAIL.GENERIC_WARNING);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * ====================================
 * VALIDADOR DE TELÉFONO
 * ====================================
 */

/**
 * Valida número telefónico colombiano (10 dígitos)
 */
export const validatePhone = (phone, options = {}) => {
  const {
    enableSemanticValidation = true,
    strictMode = true
  } = options;

  const errors = [];
  const warnings = [];

  // 1. Campo vacío
  if (!phone || phone.trim() === '') {
    errors.push(VALIDATION_MESSAGES.PHONE.REQUIRED);
    return { isValid: false, errors, warnings };
  }

  const trimmedPhone = phone.trim();

  // 2. Formato válido (regex)
  if (!COLOMBIAN_PHONE_REGEX.test(trimmedPhone)) {
    errors.push(VALIDATION_MESSAGES.PHONE.INVALID_FORMAT);
    return { isValid: false, errors, warnings };
  }

  // 3. Validación semántica
  if (enableSemanticValidation) {
    const suspiciousResult = detectSuspiciousPhone(trimmedPhone);

    if (suspiciousResult.suspicious) {
      if (suspiciousResult.issues.includes('all_zeros')) {
        errors.push(VALIDATION_MESSAGES.PHONE.ALL_ZEROS);
        return { isValid: false, errors, warnings };
      }

      if (suspiciousResult.issues.includes('repeated_digits')) {
        if (strictMode) {
          errors.push(VALIDATION_MESSAGES.PHONE.REPEATED_DIGITS);
        } else {
          warnings.push(VALIDATION_MESSAGES.PHONE.REPEATED_DIGITS);
        }
      }

      if (suspiciousResult.issues.includes('sequential_pattern')) {
        if (strictMode) {
          errors.push(VALIDATION_MESSAGES.PHONE.SEQUENTIAL);
        } else {
          warnings.push(VALIDATION_MESSAGES.PHONE.SEQUENTIAL);
        }
      }

      if (suspiciousResult.issues.includes('alternating_pattern')) {
        warnings.push(VALIDATION_MESSAGES.PHONE.SUSPICIOUS);
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
 * VALIDADOR DE CONTRASEÑA
 * ====================================
 */

/**
 * Valida contraseña con verificación de fortaleza
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = true,
    personalData = {}, // { name, email } para detectar info personal
    checkCommon = true,
    enableStrengthCheck = true
  } = options;

  const errors = [];
  const warnings = [];
  let strengthInfo = null;

  // 1. Campo vacío
  if (!password || password.trim() === '') {
    errors.push(VALIDATION_MESSAGES.PASSWORD.REQUIRED);
    return { isValid: false, errors, warnings, strengthInfo };
  }

  // 2. Longitud mínima
  if (password.length < minLength) {
    errors.push(
      VALIDATION_MESSAGES.getMessage(
        VALIDATION_MESSAGES.PASSWORD.TOO_SHORT,
        { minLength }
      )
    );
    return { isValid: false, errors, warnings, strengthInfo };
  }

  // 3. Caracteres permitidos
  if (!PASSWORD_PATTERNS.ALLOWED_CHARS.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD.INVALID_CHARS);
    return { isValid: false, errors, warnings, strengthInfo };
  }

  // 4. Requisitos de complejidad
  if (requireUppercase && !PASSWORD_PATTERNS.UPPERCASE.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD.MISSING_UPPERCASE);
  }

  if (requireLowercase && !PASSWORD_PATTERNS.LOWERCASE.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD.MISSING_LOWERCASE);
  }

  if (requireNumber && !PASSWORD_PATTERNS.NUMBER.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD.MISSING_NUMBER);
  }

  if (requireSpecial && !PASSWORD_PATTERNS.SPECIAL.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD.MISSING_SPECIAL);
  }

  // Si hay errores de requisitos, retornar
  if (errors.length > 0) {
    return { isValid: false, errors, warnings, strengthInfo };
  }

  // 5. Verificar contraseñas comunes
  if (checkCommon && isCommonPassword(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD.COMPROMISED);
    return { isValid: false, errors, warnings, strengthInfo };
  }

  // 6. Verificar información personal
  const personalInfoResult = containsPersonalInfo(password, personalData);
  if (personalInfoResult.contains) {
    if (personalInfoResult.issues.some(i => i.includes('contains_name'))) {
      errors.push(VALIDATION_MESSAGES.PASSWORD.CONTAINS_NAME);
    }
    if (personalInfoResult.issues.includes('contains_email')) {
      errors.push(VALIDATION_MESSAGES.PASSWORD.CONTAINS_EMAIL);
    }
  }

  // Si hay errores de info personal, retornar
  if (errors.length > 0) {
    return { isValid: false, errors, warnings, strengthInfo };
  }

  // 7. Calcular fortaleza
  if (enableStrengthCheck) {
    strengthInfo = calculatePasswordStrength(password);

    // Advertir si la fortaleza es baja
    if (strengthInfo.strength === 'weak') {
      warnings.push(VALIDATION_MESSAGES.PASSWORD.STRENGTH_WEAK);
    } else if (strengthInfo.strength === 'medium') {
      warnings.push(VALIDATION_MESSAGES.PASSWORD.STRENGTH_MEDIUM);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strengthInfo
  };
};

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
  const { minPrice = 0, maxPrice = 1000000000 } = options;
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

/**
 * 🧠 VALIDADORES SEMÁNTICOS
 * Validaciones inteligentes para detectar datos técnicamente válidos pero semánticamente incorrectos
 */

import { SPAM_PATTERNS, VALID_SHORT_NAMES } from './regexPatterns';

/**
 * ====================================
 * VALIDADOR DE NOMBRE COMPLETO
 * ====================================
 */

/**
 * Calcula un puntaje de "realismo" para un nombre (0-100)
 * @param {string} fullName - Nombre completo a evaluar
 * @returns {Object} { score: number, issues: string[] }
 */
export const calculateNameRealismScore = (fullName) => {
  let score = 100;
  const issues = [];
  const words = fullName.trim().split(/\s+/);

  // 1. Verificar palabras repetidas (-30 puntos)
  const wordCounts = {};
  words.forEach(word => {
    const lower = word.toLowerCase();
    wordCounts[lower] = (wordCounts[lower] || 0) + 1;
  });
  
  Object.entries(wordCounts).forEach(([word, count]) => {
    if (count > 1 && !VALID_SHORT_NAMES.has(word)) {
      score -= 30;
      issues.push(`repeated_word:${word}`);
    }
  });

  // 2. Detectar tecleo aleatorio (-40 puntos)
  if (SPAM_PATTERNS.KEYBOARD_MASHING.test(fullName.toLowerCase())) {
    score -= 40;
    issues.push('keyboard_mashing');
  }

  // 3. Detectar secuencias (-35 puntos)
  if (SPAM_PATTERNS.LETTER_SEQUENCE.test(fullName.toLowerCase())) {
    score -= 35;
    issues.push('letter_sequence');
  }

  if (SPAM_PATTERNS.NUMBER_SEQUENCE.test(fullName)) {
    score -= 35;
    issues.push('number_sequence');
  }

  // 4. Detectar caracteres repetidos excesivos (-25 puntos)
  if (SPAM_PATTERNS.REPEATED_CHARS.test(fullName)) {
    score -= 25;
    issues.push('repeated_chars');
  }

  // 5. Verificar longitud de palabras inusuales
  words.forEach(word => {
    const cleanWord = word.replace(/['-]/g, '');
    
    // Palabra muy corta y no en lista de excepciones (-15 puntos por palabra)
    if (cleanWord.length < 3 && !VALID_SHORT_NAMES.has(word)) {
      score -= 15;
      issues.push(`word_too_short:${word}`);
    }
    
    // Palabra extremadamente larga (-10 puntos)
    if (cleanWord.length > 15) {
      score -= 10;
      issues.push(`word_too_long:${word}`);
    }
  });

  // 6. Verificar proporción de mayúsculas/minúsculas
  const upperCount = (fullName.match(/[A-Z]/g) || []).length;
  const lowerCount = (fullName.match(/[a-z]/g) || []).length;
  const totalLetters = upperCount + lowerCount;
  
  if (totalLetters > 0) {
    const upperRatio = upperCount / totalLetters;
    
    // Demasiadas mayúsculas (-20 puntos)
    if (upperRatio > 0.5 && fullName.length > 10) {
      score -= 20;
      issues.push('excessive_uppercase');
    }
    
    // Todas minúsculas (-10 puntos, excepto partículas)
    if (upperCount === 0) {
      score -= 10;
      issues.push('no_capitalization');
    }
  }

  // 7. Verificar uso excesivo de guiones/apóstrofes (-15 puntos)
  const hyphenCount = (fullName.match(/[-']/g) || []).length;
  if (hyphenCount > 2) {
    score -= 15;
    issues.push('excessive_special_chars');
  }

  return {
    score: Math.max(0, score),
    issues,
    isValid: score >= 50 // Umbral de aceptación
  };
};

/**
 * Valida si un nombre tiene palabras mínimas requeridas
 */
export const hasMinimumWords = (fullName, min = 2) => {
  const words = fullName.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length >= min;
};

/**
 * Valida longitud individual de cada palabra
 */
export const validateWordLengths = (fullName) => {
  const words = fullName.trim().split(/\s+/);
  const invalidWords = [];

  words.forEach(word => {
    const cleanWord = word.replace(/['-]/g, '');
    if (cleanWord.length < 3 && !VALID_SHORT_NAMES.has(word)) {
      invalidWords.push(word);
    }
  });

  return {
    valid: invalidWords.length === 0,
    invalidWords
  };
};

/**
 * ====================================
 * VALIDADOR DE TELÉFONO
 * ====================================
 */

/**
 * Detecta números telefónicos sospechosos
 */
export const detectSuspiciousPhone = (phone) => {
  const issues = [];

  // 1. Todos ceros
  if (/^0+$/.test(phone)) {
    issues.push('all_zeros');
  }

  // 2. Últimos 7 dígitos todos iguales
  const lastSeven = phone.slice(3);
  if (/^(\d)\1{6}$/.test(lastSeven)) {
    issues.push('repeated_digits');
  }

  // 3. Secuencia ascendente/descendente
  if (/(?:0123456|1234567|2345678|3456789|9876543|8765432|7654321|6543210)/.test(phone)) {
    issues.push('sequential_pattern');
  }

  // 4. Patrón alternante simple (ej: 3001010101)
  if (/^(\d{3})(\d)(\d)\2\3\2\3/.test(phone)) {
    issues.push('alternating_pattern');
  }

  return {
    suspicious: issues.length > 0,
    issues
  };
};

/**
 * ====================================
 * VALIDADOR DE CONTRASEÑA
 * ====================================
 */

/**
 * Calcula fortaleza de contraseña (0-100)
 * @param {string} password - Contraseña a evaluar
 * @returns {Object} { score: number, strength: string, feedback: string[] }
 */
export const calculatePasswordStrength = (password) => {
  let score = 0;
  const feedback = [];

  // 1. Longitud (máx 25 puntos)
  const length = password.length;
  if (length >= 8) score += 10;
  if (length >= 12) score += 5;
  if (length >= 16) score += 5;
  if (length >= 20) score += 5;

  // 2. Complejidad de caracteres (máx 40 puntos)
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password);

  if (hasUpper) score += 10;
  else feedback.push('Agrega mayúsculas');

  if (hasLower) score += 10;
  else feedback.push('Agrega minúsculas');

  if (hasNumber) score += 10;
  else feedback.push('Agrega números');

  if (hasSpecial) score += 10;
  else feedback.push('Agrega símbolos');

  // 3. Variedad de caracteres (máx 20 puntos)
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 8) score += 10;
  if (uniqueChars >= 12) score += 5;
  if (uniqueChars >= 16) score += 5;

  // 4. No contiene patrones obvios (máx 15 puntos)
  const hasNoSequence = !SPAM_PATTERNS.LETTER_SEQUENCE.test(password.toLowerCase()) &&
                        !SPAM_PATTERNS.NUMBER_SEQUENCE.test(password);
  const hasNoRepeat = !SPAM_PATTERNS.REPEATED_CHARS.test(password);

  if (hasNoSequence) score += 8;
  else feedback.push('Evita secuencias (abc, 123)');

  if (hasNoRepeat) score += 7;
  else feedback.push('Evita caracteres repetidos');

  // Determinar nivel de fortaleza
  let strength;
  if (score < 40) strength = 'weak';
  else if (score < 60) strength = 'medium';
  else if (score < 80) strength = 'strong';
  else strength = 'very_strong';

  return {
    score,
    strength,
    feedback,
    meets_requirements: hasUpper && hasLower && hasNumber && hasSpecial && length >= 8
  };
};

/**
 * Lista de contraseñas comunes top 100 (simplificada)
 */
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'welcome', 'jesus', 'ninja', 'mustang',
  'password1', 'admin', 'admin123', 'root', 'toor', 'pass', 'test', 'guest',
  'changeme', 'password123', 'user', 'administrator', 'administrator123'
]);

/**
 * Verifica si la contraseña está en la lista de comunes
 */
export const isCommonPassword = (password) => {
  return COMMON_PASSWORDS.has(password.toLowerCase());
};

/**
 * Verifica si la contraseña contiene información personal
 */
export const containsPersonalInfo = (password, personalData = {}) => {
  const lowerPassword = password.toLowerCase();
  const issues = [];

  if (personalData.name) {
    const nameParts = personalData.name.toLowerCase().split(/\s+/);
    nameParts.forEach(part => {
      if (part.length >= 3 && lowerPassword.includes(part)) {
        issues.push(`contains_name:${part}`);
      }
    });
  }

  if (personalData.email) {
    const emailLocal = personalData.email.split('@')[0].toLowerCase();
    if (lowerPassword.includes(emailLocal)) {
      issues.push('contains_email');
    }
  }

  return {
    contains: issues.length > 0,
    issues
  };
};

/**
 * ====================================
 * VALIDADOR DE NOMBRE DE PRODUCTO
 * ====================================
 */

/**
 * Valida coherencia del nombre con la categoría
 */
export const validateProductNameCoherence = (productName, category) => {
  const lowerName = productName.toLowerCase();
  const issues = [];

  const categoryKeywords = {
    'Manga': ['tomo', 'vol', 'volumen', 'manga', 'capítulo', 'edición'],
    'Figura': ['figura', 'nendoroid', 'figma', 'scale', 'pvc', 'estatua'],
    'Ropa': ['camiseta', 'camisa', 'sudadera', 'hoodie', 'playera', 'polo'],
    'Accesorios': ['llavero', 'accesorio', 'pulsera', 'collar', 'pin', 'badge']
  };

  if (category && categoryKeywords[category]) {
    const hasKeyword = categoryKeywords[category].some(kw => lowerName.includes(kw));
    if (!hasKeyword) {
      issues.push(`missing_category_keyword:${category}`);
    }
  }

  // Detectar palabras repetidas
  const words = productName.split(/\s+/);
  const wordCounts = {};
  words.forEach(word => {
    const lower = word.toLowerCase();
    wordCounts[lower] = (wordCounts[lower] || 0) + 1;
  });

  Object.entries(wordCounts).forEach(([word, count]) => {
    if (count > 1) {
      issues.push(`repeated_word:${word}`);
    }
  });

  // Detectar clickbait
  const clickbaitWords = ['gratis', 'único', 'oferta', 'increíble', 'super', 'mega'];
  const clickbaitCount = clickbaitWords.filter(word => lowerName.includes(word)).length;
  if (clickbaitCount >= 2) {
    issues.push('clickbait_detected');
  }

  // Detectar exceso de mayúsculas
  if (SPAM_PATTERNS.EXCESSIVE_CAPS(productName)) {
    issues.push('excessive_caps');
  }

  return {
    coherent: issues.length === 0,
    issues
  };
};

export default {
  calculateNameRealismScore,
  hasMinimumWords,
  validateWordLengths,
  detectSuspiciousPhone,
  calculatePasswordStrength,
  isCommonPassword,
  containsPersonalInfo,
  validateProductNameCoherence
};

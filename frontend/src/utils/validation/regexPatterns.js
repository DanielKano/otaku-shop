/**
 * 📚 BIBLIOTECA DE EXPRESIONES REGULARES DOCUMENTADAS
 * Patrones optimizados con explicación detallada
 */

/**
 * FULL NAME VALIDATION
 * 
 * Explicación detallada:
 * ^                          - Inicio de string
 * (?!.*\s{2,})              - Negative lookahead: no permite 2+ espacios consecutivos
 * (?!.*['-]{2,})            - Negative lookahead: no permite 2+ guiones/apóstrofes consecutivos
 * (?!^\s)                   - Negative lookahead: no comienza con espacio
 * (?!.*\s$)                 - Negative lookahead: no termina con espacio
 * [A-Za-zÁ-ÿ\u00f1\u00d1]+ - Primera palabra: letras con tildes y ñ
 * (?:                       - Grupo no capturador para palabras adicionales
 *   \s[A-Za-zÁ-ÿ\u00f1\u00d1'-]+ - Espacio + palabra con guiones/apóstrofes permitidos
 * )+                        - Una o más palabras adicionales (mínimo 2 palabras total)
 * $                         - Fin de string
 */
export const FULL_NAME_REGEX = /^(?!.*\s{2,})(?!.*['-]{2,})(?!^\s)(?!.*\s$)[A-Za-zÁ-ÿ\u00f1\u00d1]+(?:\s[A-Za-zÁ-ÿ\u00f1\u00d1'-]+)+$/;

/**
 * EMAIL VALIDATION (Estricta)
 * 
 * Explicación:
 * ^[a-zA-Z0-9]              - Comienza con letra o número
 * [a-zA-Z0-9._-]{2,63}      - 3-64 caracteres total (local part)
 * @                         - Símbolo arroba
 * (gmail|hotmail|outlook|yahoo|otaku|otakushop) - Dominios permitidos
 * \.(com|co|org|net|edu)    - Sufijos permitidos
 * $                         - Fin de string
 */
export const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]{2,63}@(gmail|hotmail|outlook|yahoo|otaku|otakushop)\.(com|co|org|net|edu)$/;

/**
 * COLOMBIAN MOBILE PHONE VALIDATION
 * 
 * Explicación:
 * ^                         - Inicio de string
 * (                         - Grupo para prefijos válidos
 *   30[0-5]                 - 300-305 (Claro)
 *   |31[0-9]                - 310-319 (Claro, Movistar, Tigo)
 *   |32[0-5]                - 320-325 (Claro, Movistar)
 *   |33[0-3]                - 330-333 (Claro, WOM)
 *   |34[0-3]                - 340-343 (Móvil Éxito, Flash)
 *   |35[0-3]                - 350-353 (Tigo, Avantel)
 * )
 * \d{7}                     - 7 dígitos adicionales
 * $                         - Fin de string
 */
export const COLOMBIAN_PHONE_REGEX = /^(30[0-5]|31[0-9]|32[0-5]|33[0-3]|34[0-3]|35[0-3])\d{7}$/;

/**
 * PASSWORD COMPONENT VALIDATIONS
 * Dividido en componentes para feedback granular
 */
export const PASSWORD_PATTERNS = {
  /**
   * Al menos 1 mayúscula (A-Z)
   */
  UPPERCASE: /[A-Z]/,
  
  /**
   * Al menos 1 minúscula (a-z)
   */
  LOWERCASE: /[a-z]/,
  
  /**
   * Al menos 1 número (0-9)
   */
  NUMBER: /\d/,
  
  /**
   * Al menos 1 símbolo especial
   * Permitidos: !@#$%^&*()_+-=[]{}|;:,.<>?
   */
  SPECIAL: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/,
  
  /**
   * Longitud: 8-32 caracteres
   */
  LENGTH: /^.{8,32}$/,
  
  /**
   * Solo caracteres permitidos
   */
  ALLOWED_CHARS: /^[A-Za-z\d!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/
};

/**
 * PRODUCT NAME VALIDATION
 * 
 * Explicación:
 * ^                         - Inicio de string
 * [A-Za-z0-9]               - Comienza con letra o número
 * [A-Za-z0-9\s\-()&/,:]{1,78} - Caracteres permitidos (3-80 total)
 * [A-Za-z0-9)]              - Termina con letra, número o paréntesis
 * $                         - Fin de string
 */
export const PRODUCT_NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s\-()&/,:]{1,78}[A-Za-z0-9)]$/;

/**
 * ANTI-SPAM PATTERNS
 * Detecta patrones sospechosos
 */
export const SPAM_PATTERNS = {
  /**
   * Tecleo aleatorio común: asdf, qwerty, zxcv, etc.
   */
  KEYBOARD_MASHING: /asdf|qwerty|zxcv|hjkl|aoeu|jkl|dfgh/i,
  
  /**
   * Secuencias numéricas: 123, 456, 789
   */
  NUMBER_SEQUENCE: /(?:012|123|234|345|456|567|678|789|890)/,
  
  /**
   * Secuencias alfabéticas: abc, xyz, etc.
   */
  LETTER_SEQUENCE: /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
  
  /**
   * Caracteres repetidos 3+ veces: aaa, bbb, xxx
   */
  REPEATED_CHARS: /(.)\1{2,}/,
  
  /**
   * Patrón de alternancia simple: aba, aca, dad
   */
  ALTERNATING_PATTERN: /^(.)(.)(\1\2)+$/,
  
  /**
   * Solo mayúsculas sostenidas (50%+ del texto)
   */
  EXCESSIVE_CAPS: (text) => {
    const upperCount = (text.match(/[A-Z]/g) || []).length;
    const letterCount = (text.match(/[A-Za-z]/g) || []).length;
    return letterCount > 0 && (upperCount / letterCount) > 0.5;
  }
};

/**
 * VALID SHORT NAMES (Excepciones culturales)
 * Nombres y apellidos válidos de 2-3 caracteres
 */
export const VALID_SHORT_NAMES = new Set([
  // Nombres
  'Luz', 'Ana', 'Eva', 'Mia', 'Leo', 'Ian', 'Ivo', 'Ada', 
  'Ema', 'Kim', 'Roy', 'Max', 'Amy', 'Lou', 'Sam', 'Ben',
  'Tom', 'Jim', 'Joe', 'Zoe', 'Mía', 'Gia', 'Kai', 'Noa',
  
  // Apellidos
  'Li', 'Wu', 'Yu', 'Ng', 'Ko', 'Xi', 'Ma', 'Ho',
  
  // Partículas (para nombres compuestos)
  'de', 'del', 'la', 'los', 'las', 'van', 'von', 
  'dos', 'das', 'Di', 'Da', 'Du', 'Le'
]);

export default {
  FULL_NAME_REGEX,
  STRICT_EMAIL_REGEX,
  COLOMBIAN_PHONE_REGEX,
  PASSWORD_PATTERNS,
  PRODUCT_NAME_REGEX,
  SPAM_PATTERNS,
  VALID_SHORT_NAMES
};

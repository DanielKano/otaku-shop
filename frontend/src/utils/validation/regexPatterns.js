
/**
 * 📚 BIBLIOTECA DE EXPRESIONES REGULARES DOCUMENTADAS
 * Patrones optimizados con explicación detallada
 */

/**
 * FULL NAME VALIDATION
 * RegEx recomendado (cliente):
 * ^(?!.*([A-Za-zÁÉÍÓÚáéíóúñÑ])\1{3})(?!.*\b([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\b\s+\2\b)(?!.*(asdf|qwer|zxcv|qwerty|abc|abcd|1234))(?=.{3,60}$)(?=.*[aeiouAEIOUáéíóú])(?=.*[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZñÑ])[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$
 */
export const FULL_NAME_REGEX = /^(?!.*([A-Za-zÁÉÍÓÚáéíóúñÑ])\1{3})(?!.*\b([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\b\s+\2\b)(?!.*(asdf|qwer|zxcv|qwerty|abc|abcd|1234))(?=.{3,60}$)(?=.*[aeiouAEIOUáéíóú])(?=.*[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZñÑ])[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/;

/**
 * EMAIL VALIDATION (Estricta)
 * RegEx recomendado:
 * ^(?=.{6,50}$)(?=.{3,}@[A-Za-z0-9.-]+\.(com|co)$)(?!.*\.\.)[A-Za-z0-9._%+-]{3,}@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|otaku\.com|otakushop\.com)$
 */
export const STRICT_EMAIL_REGEX = /^(?=.{6,50}$)(?=.{3,}@[A-Za-z0-9.-]+\.(com|co)$)(?!.*\.\.)[A-Za-z0-9._%+-]{3,}@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|otaku\.com|otakushop\.com)$/;

/**
 * COLOMBIAN MOBILE PHONE VALIDATION
 * RegEx recomendado (cliente):
 * ^(300|301|302|303|304|305|310|311|312|313|314|315|316|317|318|319|320|321|322|323)\d{7}$
 */
export const COLOMBIAN_PHONE_REGEX = /^(300|301|302|303|304|305|310|311|312|313|314|315|316|317|318|319|320|321|322|323)\d{7}$/;

/**
 * PASSWORD COMPONENT VALIDATIONS
 * RegEx recomendado:
 * ^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])(?!.*\s).{8,}$
 */
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])(?!.*\s).{8,}$/;

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
   * Permitidos: !@#$%^&*
   */
  SPECIAL: /[!@#$%^&*?.]/,
  
  /**
   * Longitud: 8+ caracteres
   */
  LENGTH: /^.{8,}$/,

  /**
   * No espacios
   */
  NO_SPACES: /^\S*$/,
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
  KEYBOARD_MASHING: /asdf|qwer|zxcv|qwerty|abc|abcd|1234/i,
  
  /**
   * Secuencias numéricas: 123, 456, 789
   */
  NUMBER_SEQUENCE: /(?:012|123|234|345|456|567|678|789|890)/,
  
  /**
   * Secuencias alfabéticas: abc, xyz, etc.
   */
  LETTER_SEQUENCE: /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
  
  /**
   * Caracteres repetidos 4+ veces: aaaa, bbbb, xxxx
   */
  REPEATED_CHARS: /([A-Za-zÁÉÍÓÚáéíóúñÑ])\1{3}/,

  /**
   * No más de 3 vocales seguidas
   */
  MANY_VOWELS: /[aeiouAEIOUáéíóú]{4,}/,

  /**
   * No más de 3 consonantes seguidas
   */
  MANY_CONSONANTS: /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZñÑ]{4,}/,
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
  PASSWORD_REGEX,
  PASSWORD_PATTERNS,
  PRODUCT_NAME_REGEX,
  SPAM_PATTERNS,
  VALID_SHORT_NAMES
};

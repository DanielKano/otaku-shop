/**
 * 🛒 VALIDADORES DE CHECKOUT
 * Validaciones específicas para el proceso de checkout y órdenes
 */

import { VALIDATION_MESSAGES, getMessage } from './validationMessages';

/**
 * ====================================
 * VALIDACIÓN DE DIRECCIÓN
 * ====================================
 */

/**
 * Valida dirección de envío completa
 */
export const validateShippingAddress = (address) => {
  const errors = [];
  const warnings = [];

  if (!address) {
    errors.push('La dirección de envío es obligatoria');
    return { isValid: false, errors, warnings };
  }

  // Validar campos individuales
  const streetResult = validateStreet(address.street);
  const cityResult = validateCity(address.city);
  const departmentResult = validateDepartment(address.department);
  const postalCodeResult = validatePostalCode(address.postalCode);

  if (!streetResult.isValid) errors.push(...streetResult.errors);
  if (!cityResult.isValid) errors.push(...cityResult.errors);
  if (!departmentResult.isValid) errors.push(...departmentResult.errors);
  if (!postalCodeResult.isValid) errors.push(...postalCodeResult.errors);

  // Advertencias
  if (streetResult.warnings) warnings.push(...streetResult.warnings);
  if (cityResult.warnings) warnings.push(...cityResult.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Valida calle/dirección
 */
export const validateStreet = (street) => {
  const errors = [];
  const warnings = [];

  if (!street || street.trim() === '') {
    errors.push('La dirección es obligatoria');
    return { isValid: false, errors, warnings };
  }

  const trimmed = street.trim();

  // Longitud mínima
  if (trimmed.length < 10) {
    errors.push('La dirección debe tener al menos 10 caracteres');
    return { isValid: false, errors, warnings };
  }

  // Longitud máxima
  if (trimmed.length > 200) {
    errors.push('La dirección no puede exceder 200 caracteres');
    return { isValid: false, errors, warnings };
  }

  // Debe contener al menos un número
  if (!/\d/.test(trimmed)) {
    warnings.push('La dirección debería contener números (Ej: Calle 123, #45-67)');
  }

  // Patrones comunes en Colombia
  const hasCommonPattern = /(?:calle|carrera|avenida|diagonal|transversal|circular|autopista)/i.test(trimmed);
  if (!hasCommonPattern) {
    warnings.push('Verifica que la dirección esté en formato colombiano (Ej: Calle 123 #45-67)');
  }

  return { isValid: true, errors, warnings };
};

/**
 * Valida ciudad
 */
export const validateCity = (city) => {
  const errors = [];
  const warnings = [];

  if (!city || city.trim() === '') {
    errors.push('La ciudad es obligatoria');
    return { isValid: false, errors, warnings };
  }

  const trimmed = city.trim();

  if (trimmed.length < 3) {
    errors.push('El nombre de la ciudad debe tener al menos 3 caracteres');
    return { isValid: false, errors, warnings };
  }

  if (trimmed.length > 50) {
    errors.push('El nombre de la ciudad no puede exceder 50 caracteres');
    return { isValid: false, errors, warnings };
  }

  // Solo letras, espacios, tildes
  if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(trimmed)) {
    errors.push('La ciudad solo puede contener letras y espacios');
    return { isValid: false, errors, warnings };
  }

  return { isValid: true, errors, warnings };
};

/**
 * Valida departamento/estado
 */
export const validateDepartment = (department) => {
  const errors = [];

  if (!department || department.trim() === '') {
    errors.push('El departamento es obligatorio');
    return { isValid: false, errors };
  }

  // Lista de departamentos de Colombia
  const validDepartments = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.',
    'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca',
    'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare',
    'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander',
    'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia',
    'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
  ];

  const normalizedDepartment = department.trim();
  
  if (!validDepartments.includes(normalizedDepartment)) {
    errors.push(`Departamento no válido. Debe ser uno de los 33 departamentos de Colombia`);
    return { isValid: false, errors };
  }

  return { isValid: true, errors };
};

/**
 * Valida código postal
 */
export const validatePostalCode = (postalCode) => {
  const errors = [];
  const warnings = [];

  if (!postalCode || postalCode.trim() === '') {
    errors.push('El código postal es obligatorio');
    return { isValid: false, errors, warnings };
  }

  const trimmed = postalCode.trim();

  // Formato colombiano: 6 dígitos
  if (!/^\d{6}$/.test(trimmed)) {
    errors.push('El código postal debe tener 6 dígitos');
    return { isValid: false, errors, warnings };
  }

  return { isValid: true, errors, warnings };
};

/**
 * ====================================
 * VALIDACIÓN DE MÉTODO DE PAGO
 * ====================================
 */

/**
 * Valida método de pago seleccionado
 */
export const validatePaymentMethod = (method) => {
  const errors = [];

  if (!method || method.trim() === '') {
    errors.push('Debes seleccionar un método de pago');
    return { isValid: false, errors };
  }

  const validMethods = [
    'credit_card',
    'debit_card',
    'pse',
    'cash_on_delivery',
    'bank_transfer',
    'nequi',
    'daviplata'
  ];

  if (!validMethods.includes(method)) {
    errors.push('Método de pago no válido');
    return { isValid: false, errors };
  }

  return { isValid: true, errors };
};

/**
 * Valida datos de tarjeta de crédito/débito
 */
export const validateCardData = (cardData) => {
  const errors = [];
  const warnings = [];

  if (!cardData) {
    errors.push('Los datos de la tarjeta son obligatorios');
    return { isValid: false, errors, warnings };
  }

  // Validar número de tarjeta
  const cardNumberResult = validateCardNumber(cardData.number);
  if (!cardNumberResult.isValid) errors.push(...cardNumberResult.errors);

  // Validar nombre en tarjeta
  const cardHolderResult = validateCardHolder(cardData.holder);
  if (!cardHolderResult.isValid) errors.push(...cardHolderResult.errors);

  // Validar fecha de expiración
  const expiryResult = validateCardExpiry(cardData.expiry);
  if (!expiryResult.isValid) errors.push(...expiryResult.errors);
  if (expiryResult.warnings) warnings.push(...expiryResult.warnings);

  // Validar CVV
  const cvvResult = validateCVV(cardData.cvv);
  if (!cvvResult.isValid) errors.push(...cvvResult.errors);

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Valida número de tarjeta (algoritmo de Luhn)
 */
export const validateCardNumber = (cardNumber) => {
  const errors = [];

  if (!cardNumber || cardNumber.trim() === '') {
    errors.push('El número de tarjeta es obligatorio');
    return { isValid: false, errors };
  }

  // Remover espacios y guiones
  const cleaned = cardNumber.replace(/[\s-]/g, '');

  // Solo dígitos
  if (!/^\d+$/.test(cleaned)) {
    errors.push('El número de tarjeta solo puede contener dígitos');
    return { isValid: false, errors };
  }

  // Longitud válida (13-19 dígitos)
  if (cleaned.length < 13 || cleaned.length > 19) {
    errors.push('El número de tarjeta debe tener entre 13 y 19 dígitos');
    return { isValid: false, errors };
  }

  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    errors.push('El número de tarjeta no es válido');
    return { isValid: false, errors };
  }

  return { isValid: true, errors };
};

/**
 * Valida nombre del titular de la tarjeta
 */
export const validateCardHolder = (holder) => {
  const errors = [];

  if (!holder || holder.trim() === '') {
    errors.push('El nombre del titular es obligatorio');
    return { isValid: false, errors };
  }

  const trimmed = holder.trim();

  if (trimmed.length < 3) {
    errors.push('El nombre del titular debe tener al menos 3 caracteres');
    return { isValid: false, errors };
  }

  if (trimmed.length > 100) {
    errors.push('El nombre del titular no puede exceder 100 caracteres');
    return { isValid: false, errors };
  }

  // Solo letras, espacios
  if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
    errors.push('El nombre del titular solo puede contener letras y espacios');
    return { isValid: false, errors };
  }

  return { isValid: true, errors };
};

/**
 * Valida fecha de expiración
 */
export const validateCardExpiry = (expiry) => {
  const errors = [];
  const warnings = [];

  if (!expiry || expiry.trim() === '') {
    errors.push('La fecha de expiración es obligatoria');
    return { isValid: false, errors, warnings };
  }

  // Formato: MM/YY o MM/YYYY
  const expiryPattern = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
  
  if (!expiryPattern.test(expiry)) {
    errors.push('Formato de fecha inválido. Use MM/YY o MM/YYYY');
    return { isValid: false, errors, warnings };
  }

  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Convertir año a 4 dígitos
  const fullYear = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);

  // Verificar que no esté expirada
  if (fullYear < currentYear || (fullYear === currentYear && parseInt(month) < currentMonth)) {
    errors.push('La tarjeta ha expirado');
    return { isValid: false, errors, warnings };
  }

  // Advertencia si expira pronto (dentro de 3 meses)
  const monthsUntilExpiry = (fullYear - currentYear) * 12 + (parseInt(month) - currentMonth);
  if (monthsUntilExpiry <= 3 && monthsUntilExpiry > 0) {
    warnings.push(`La tarjeta expira en ${monthsUntilExpiry} ${monthsUntilExpiry === 1 ? 'mes' : 'meses'}`);
  }

  return { isValid: true, errors, warnings };
};

/**
 * Valida CVV
 */
export const validateCVV = (cvv) => {
  const errors = [];

  if (!cvv || cvv.trim() === '') {
    errors.push('El CVV es obligatorio');
    return { isValid: false, errors };
  }

  const trimmed = cvv.trim();

  // Solo dígitos
  if (!/^\d+$/.test(trimmed)) {
    errors.push('El CVV solo puede contener dígitos');
    return { isValid: false, errors };
  }

  // 3 o 4 dígitos
  if (trimmed.length < 3 || trimmed.length > 4) {
    errors.push('El CVV debe tener 3 o 4 dígitos');
    return { isValid: false, errors };
  }

  return { isValid: true, errors };
};

/**
 * ====================================
 * VALIDACIÓN DE TOTALES
 * ====================================
 */

/**
 * Valida totales de la orden
 */
export const validateOrderTotals = (totals) => {
  const errors = [];
  const warnings = [];

  if (!totals) {
    errors.push('Los totales de la orden son obligatorios');
    return { isValid: false, errors, warnings };
  }

  const { subtotal, shipping, discount, tax, total } = totals;

  // Validar que todos los valores sean números
  if (typeof subtotal !== 'number' || subtotal < 0) {
    errors.push('Subtotal inválido');
  }

  if (typeof shipping !== 'number' || shipping < 0) {
    errors.push('Costo de envío inválido');
  }

  if (typeof discount !== 'number' || discount < 0) {
    errors.push('Descuento inválido');
  }

  if (typeof tax !== 'number' || tax < 0) {
    errors.push('Impuesto inválido');
  }

  if (typeof total !== 'number' || total <= 0) {
    errors.push('Total inválido');
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Verificar cálculo correcto
  const calculatedTotal = subtotal + shipping - discount + tax;
  const difference = Math.abs(total - calculatedTotal);

  // Permitir diferencia de hasta 0.01 por redondeo
  if (difference > 0.01) {
    errors.push('Los totales no cuadran correctamente');
    return { isValid: false, errors, warnings };
  }

  // Validar monto mínimo de orden
  const MIN_ORDER_AMOUNT = 10000; // $10,000 COP
  if (total < MIN_ORDER_AMOUNT) {
    warnings.push(`El monto mínimo de orden es $${MIN_ORDER_AMOUNT.toLocaleString()}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * ====================================
 * VALIDACIÓN DE CUPÓN DE DESCUENTO
 * ====================================
 */

/**
 * Valida formato de cupón de descuento
 */
export const validateCouponCode = (code) => {
  const errors = [];

  if (!code || code.trim() === '') {
    errors.push('El código de cupón es obligatorio');
    return { isValid: false, errors };
  }

  const trimmed = code.trim().toUpperCase();

  // Longitud
  if (trimmed.length < 3) {
    errors.push('El código de cupón debe tener al menos 3 caracteres');
    return { isValid: false, errors };
  }

  if (trimmed.length > 20) {
    errors.push('El código de cupón no puede exceder 20 caracteres');
    return { isValid: false, errors };
  }

  // Solo letras, números, guiones
  if (!/^[A-Z0-9-]+$/.test(trimmed)) {
    errors.push('El código de cupón solo puede contener letras, números y guiones');
    return { isValid: false, errors };
  }

  return { isValid: true, errors, code: trimmed };
};

/**
 * ====================================
 * VALIDACIÓN COMPLETA DE CHECKOUT
 * ====================================
 */

/**
 * Valida todo el proceso de checkout
 */
export const validateCheckout = (checkoutData) => {
  const errors = [];
  const warnings = [];

  if (!checkoutData) {
    errors.push('Los datos de checkout son obligatorios');
    return { isValid: false, errors, warnings };
  }

  // 1. Validar dirección de envío
  if (checkoutData.shippingAddress) {
    const addressResult = validateShippingAddress(checkoutData.shippingAddress);
    if (!addressResult.isValid) errors.push(...addressResult.errors);
    if (addressResult.warnings) warnings.push(...addressResult.warnings);
  } else {
    errors.push('La dirección de envío es obligatoria');
  }

  // 2. Validar método de pago
  if (checkoutData.paymentMethod) {
    const paymentResult = validatePaymentMethod(checkoutData.paymentMethod);
    if (!paymentResult.isValid) errors.push(...paymentResult.errors);

    // Si es tarjeta, validar datos adicionales
    if (['credit_card', 'debit_card'].includes(checkoutData.paymentMethod) && checkoutData.cardData) {
      const cardResult = validateCardData(checkoutData.cardData);
      if (!cardResult.isValid) errors.push(...cardResult.errors);
      if (cardResult.warnings) warnings.push(...cardResult.warnings);
    }
  } else {
    errors.push('El método de pago es obligatorio');
  }

  // 3. Validar totales
  if (checkoutData.totals) {
    const totalsResult = validateOrderTotals(checkoutData.totals);
    if (!totalsResult.isValid) errors.push(...totalsResult.errors);
    if (totalsResult.warnings) warnings.push(...totalsResult.warnings);
  } else {
    errors.push('Los totales de la orden son obligatorios');
  }

  // 4. Validar que haya items en el carrito
  if (!checkoutData.items || checkoutData.items.length === 0) {
    errors.push('El carrito está vacío');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export default {
  // Dirección
  validateShippingAddress,
  validateStreet,
  validateCity,
  validateDepartment,
  validatePostalCode,
  
  // Pago
  validatePaymentMethod,
  validateCardData,
  validateCardNumber,
  validateCardHolder,
  validateCardExpiry,
  validateCVV,
  
  // Totales
  validateOrderTotals,
  
  // Cupón
  validateCouponCode,
  
  // Checkout completo
  validateCheckout
};

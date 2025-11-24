/**
 * 🧪 TESTS UNITARIOS - VALIDADORES DE CHECKOUT
 * Tests para validadores de dirección, pago y totales
 */

import { describe, it, expect } from 'vitest';
import {
  validateShippingAddress,
  validateStreet,
  validateCity,
  validateDepartment,
  validatePostalCode,
  validatePaymentMethod,
  validateCardNumber,
  validateCardHolder,
  validateCardExpiry,
  validateCVV,
  validateOrderTotals,
  validateCouponCode,
  validateCheckout
} from '../checkoutValidators';

describe('validateStreet', () => {
  it('acepta direcciones válidas', () => {
    const validStreets = [
      'Calle 123 #45-67',
      'Carrera 45 #12-34',
      'Avenida 19 #45-67 Apt 301',
      'Diagonal 34 #56-78'
    ];

    validStreets.forEach(street => {
      const result = validateStreet(street);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  it('rechaza direcciones muy cortas', () => {
    const result = validateStreet('Calle 1');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('10 caracteres');
  });

  it('da advertencia si no tiene números', () => {
    const result = validateStreet('Calle Principal Centro');
    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('validateCity', () => {
  it('acepta ciudades válidas', () => {
    const validCities = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'];

    validCities.forEach(city => {
      const result = validateCity(city);
      expect(result.isValid).toBe(true);
    });
  });

  it('rechaza ciudades con números', () => {
    const result = validateCity('Bogotá123');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('letras');
  });
});

describe('validateDepartment', () => {
  it('acepta departamentos válidos de Colombia', () => {
    const validDepts = [
      'Antioquia',
      'Bogotá D.C.',
      'Valle del Cauca',
      'Cundinamarca',
      'Atlántico'
    ];

    validDepts.forEach(dept => {
      const result = validateDepartment(dept);
      expect(result.isValid).toBe(true);
    });
  });

  it('rechaza departamentos inválidos', () => {
    const result = validateDepartment('Departamento Inventado');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('no válido');
  });
});

describe('validatePostalCode', () => {
  it('acepta códigos postales válidos', () => {
    const validCodes = ['110111', '050001', '760001'];

    validCodes.forEach(code => {
      const result = validatePostalCode(code);
      expect(result.isValid).toBe(true);
    });
  });

  it('rechaza códigos con longitud incorrecta', () => {
    const result = validatePostalCode('1234');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('6 dígitos');
  });

  it('rechaza códigos con letras', () => {
    const result = validatePostalCode('11011A');
    expect(result.isValid).toBe(false);
  });
});

describe('validateShippingAddress', () => {
  it('acepta dirección completa válida', () => {
    const address = {
      street: 'Calle 123 #45-67 Apt 301',
      city: 'Bogotá',
      department: 'Bogotá D.C.',
      postalCode: '110111'
    };

    const result = validateShippingAddress(address);
    expect(result.isValid).toBe(true);
  });

  it('rechaza dirección incompleta', () => {
    const address = {
      street: 'Calle 123',
      city: 'Bogotá'
      // Faltan department y postalCode
    };

    const result = validateShippingAddress(address);
    expect(result.isValid).toBe(false);
  });
});

describe('validatePaymentMethod', () => {
  it('acepta métodos de pago válidos', () => {
    const validMethods = [
      'credit_card',
      'debit_card',
      'pse',
      'cash_on_delivery',
      'nequi'
    ];

    validMethods.forEach(method => {
      const result = validatePaymentMethod(method);
      expect(result.isValid).toBe(true);
    });
  });

  it('rechaza métodos inválidos', () => {
    const result = validatePaymentMethod('bitcoin');
    expect(result.isValid).toBe(false);
  });
});

describe('validateCardNumber', () => {
  it('acepta números de tarjeta válidos (Luhn)', () => {
    // Números de prueba que pasan Luhn
    const validCards = [
      '4532015112830366', // Visa
      '5425233430109903', // Mastercard
      '374245455400126'   // Amex
    ];

    validCards.forEach(card => {
      const result = validateCardNumber(card);
      expect(result.isValid).toBe(true);
    });
  });

  it('acepta números con espacios o guiones', () => {
    const result = validateCardNumber('4532-0151-1283-0366');
    expect(result.isValid).toBe(true);
  });

  it('rechaza números que no pasan Luhn', () => {
    const result = validateCardNumber('1234567890123456');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('no es válido');
  });

  it('rechaza números muy cortos', () => {
    const result = validateCardNumber('123456789012');
    expect(result.isValid).toBe(false);
  });
});

describe('validateCardHolder', () => {
  it('acepta nombres válidos', () => {
    const result = validateCardHolder('JUAN PEREZ');
    expect(result.isValid).toBe(true);
  });

  it('rechaza nombres con números', () => {
    const result = validateCardHolder('JUAN PEREZ 123');
    expect(result.isValid).toBe(false);
  });

  it('rechaza nombres muy cortos', () => {
    const result = validateCardHolder('AB');
    expect(result.isValid).toBe(false);
  });
});

describe('validateCardExpiry', () => {
  it('acepta fechas futuras válidas', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const year = String(futureDate.getFullYear()).slice(-2);

    const result = validateCardExpiry(`${month}/${year}`);
    expect(result.isValid).toBe(true);
  });

  it('acepta formato de 4 dígitos', () => {
    const result = validateCardExpiry('12/2030');
    expect(result.isValid).toBe(true);
  });

  it('rechaza tarjetas expiradas', () => {
    const result = validateCardExpiry('12/20');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('expirado');
  });

  it('rechaza formato inválido', () => {
    const result = validateCardExpiry('13/25'); // Mes inválido
    expect(result.isValid).toBe(false);
  });

  it('da advertencia si expira pronto', () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 2);
    const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
    const year = String(nextMonth.getFullYear()).slice(-2);

    const result = validateCardExpiry(`${month}/${year}`);
    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('validateCVV', () => {
  it('acepta CVV de 3 dígitos', () => {
    const result = validateCVV('123');
    expect(result.isValid).toBe(true);
  });

  it('acepta CVV de 4 dígitos (Amex)', () => {
    const result = validateCVV('1234');
    expect(result.isValid).toBe(true);
  });

  it('rechaza CVV con letras', () => {
    const result = validateCVV('12A');
    expect(result.isValid).toBe(false);
  });

  it('rechaza CVV muy corto', () => {
    const result = validateCVV('12');
    expect(result.isValid).toBe(false);
  });
});

describe('validateOrderTotals', () => {
  it('acepta totales correctos', () => {
    const totals = {
      subtotal: 100000,
      shipping: 10000,
      discount: 5000,
      tax: 19000,
      total: 124000
    };

    const result = validateOrderTotals(totals);
    expect(result.isValid).toBe(true);
  });

  it('rechaza totales que no cuadran', () => {
    const totals = {
      subtotal: 100000,
      shipping: 10000,
      discount: 5000,
      tax: 19000,
      total: 999999 // Total incorrecto
    };

    const result = validateOrderTotals(totals);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('no cuadran');
  });

  it('rechaza valores negativos', () => {
    const totals = {
      subtotal: -100000,
      shipping: 10000,
      discount: 5000,
      tax: 19000,
      total: -76000
    };

    const result = validateOrderTotals(totals);
    expect(result.isValid).toBe(false);
  });

  it('acepta diferencia mínima por redondeo', () => {
    const totals = {
      subtotal: 100000,
      shipping: 10000,
      discount: 5000,
      tax: 19000,
      total: 124000.01 // Diferencia de 1 centavo
    };

    const result = validateOrderTotals(totals);
    expect(result.isValid).toBe(true);
  });
});

describe('validateCouponCode', () => {
  it('acepta códigos válidos', () => {
    const validCodes = ['SUMMER2024', 'DESC10', 'BLACK-FRIDAY'];

    validCodes.forEach(code => {
      const result = validateCouponCode(code);
      expect(result.isValid).toBe(true);
    });
  });

  it('convierte a mayúsculas', () => {
    const result = validateCouponCode('summer2024');
    expect(result.isValid).toBe(true);
    expect(result.code).toBe('SUMMER2024');
  });

  it('rechaza códigos con caracteres especiales', () => {
    const result = validateCouponCode('SUMMER@2024');
    expect(result.isValid).toBe(false);
  });

  it('rechaza códigos muy cortos', () => {
    const result = validateCouponCode('AB');
    expect(result.isValid).toBe(false);
  });
});

describe('validateCheckout', () => {
  const validCheckoutData = {
    shippingAddress: {
      street: 'Calle 123 #45-67',
      city: 'Bogotá',
      department: 'Bogotá D.C.',
      postalCode: '110111'
    },
    paymentMethod: 'credit_card',
    cardData: {
      number: '4532015112830366',
      holder: 'JUAN PEREZ',
      expiry: '12/30',
      cvv: '123'
    },
    totals: {
      subtotal: 100000,
      shipping: 10000,
      discount: 0,
      tax: 19000,
      total: 129000
    },
    items: [{ id: 1, name: 'Producto', quantity: 1, price: 100000 }]
  };

  it('acepta checkout completo y válido', () => {
    const result = validateCheckout(validCheckoutData);
    expect(result.isValid).toBe(true);
  });

  it('rechaza checkout sin dirección', () => {
    const data = { ...validCheckoutData };
    delete data.shippingAddress;

    const result = validateCheckout(data);
    expect(result.isValid).toBe(false);
  });

  it('rechaza checkout sin método de pago', () => {
    const data = { ...validCheckoutData };
    delete data.paymentMethod;

    const result = validateCheckout(data);
    expect(result.isValid).toBe(false);
  });

  it('rechaza checkout con carrito vacío', () => {
    const data = { ...validCheckoutData, items: [] };

    const result = validateCheckout(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('vacío'))).toBe(true);
  });

  it('valida datos de tarjeta para pagos con tarjeta', () => {
    const data = {
      ...validCheckoutData,
      cardData: {
        number: '1234567890123456', // Número inválido
        holder: 'JUAN PEREZ',
        expiry: '12/30',
        cvv: '123'
      }
    };

    const result = validateCheckout(data);
    expect(result.isValid).toBe(false);
  });

  it('no requiere datos de tarjeta para otros métodos', () => {
    const data = {
      ...validCheckoutData,
      paymentMethod: 'pse'
    };
    delete data.cardData;

    const result = validateCheckout(data);
    expect(result.isValid).toBe(true);
  });
});

/**
 * 🧪 TESTS BÁSICOS - VALIDADORES CORE
 * Tests simplificados que prueban funcionalidades realmente implementadas
 */

import { describe, it, expect } from 'vitest';
import {
  validateFullName,
  validateEmail,
  validatePhone,
  validatePassword
} from '../validators';

describe('validateFullName', () => {
  it('acepta nombres válidos', () => {
    const result = validateFullName('Juan Pérez');
    expect(result.isValid).toBe(true);
  });

  it('rechaza nombres vacíos', () => {
    const result = validateFullName('');
    expect(result.isValid).toBe(false);
  });

  it('rechaza nombres muy cortos', () => {
    const result = validateFullName('AB');
    expect(result.isValid).toBe(false);
  });

  it('rechaza nombres con números', () => {
    const result = validateFullName('Juan123 Pérez');
    expect(result.isValid).toBe(false);
  });
});

describe('validateEmail', () => {
  it('acepta emails válidos', () => {
    const result = validateEmail('usuario@gmail.com');
    expect(result.isValid).toBe(true);
  });

  it('rechaza emails vacíos', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
  });

  it('rechaza formato inválido', () => {
    const result = validateEmail('usuariogmail.com');
    expect(result.isValid).toBe(false);
  });
});

describe('validatePhone', () => {
  it('acepta números válidos', () => {
    const result = validatePhone('3001234567', { enableSemanticValidation: false });
    expect(result.isValid).toBe(true);
  });

  it('rechaza números vacíos', () => {
    const result = validatePhone('');
    expect(result.isValid).toBe(false);
  });

  it('rechaza números con letras', () => {
    const result = validatePhone('300ABC1234');
    expect(result.isValid).toBe(false);
  });
});

describe('validatePassword', () => {
  it('acepta contraseñas fuertes', () => {
    const result = validatePassword('MySecure123!');
    expect(result.isValid).toBe(true);
  });

  it('rechaza contraseñas vacías', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
  });

  it('rechaza contraseñas sin mayúsculas', () => {
    const result = validatePassword('mysecure123!');
    expect(result.isValid).toBe(false);
  });

  it('rechaza contraseñas sin minúsculas', () => {
    const result = validatePassword('MYSECURE123!');
    expect(result.isValid).toBe(false);
  });

  it('rechaza contraseñas sin números', () => {
    const result = validatePassword('MySecure!');
    expect(result.isValid).toBe(false);
  });

  it('rechaza contraseñas sin símbolos', () => {
    const result = validatePassword('MySecure123');
    expect(result.isValid).toBe(false);
  });
});

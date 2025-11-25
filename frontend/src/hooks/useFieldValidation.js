import { useState, useEffect } from 'react';
import {
  validateFullName,
  validateEmail,
  validatePhone,
  validatePassword,
} from '../utils/validation/validators';

const errorMessages = {
    fullName: {
        length: "Debe tener entre 3 y 60 caracteres.",
        chars: "Solo se permiten letras y espacios.",
        no_vowel: "Debe contener al menos una vocal.",
        no_consonant: "Debe contener al menos una consonante.",
        repeated_chars: "No puede contener 4 letras iguales seguidas.",
        repeated_word: "No se permiten palabras repetidas (ej. ‘Juan Juan’)",
        incoherent_pattern: "Nombre contiene patrones inválidos: ‘asdf’, ‘qwerty’, etc.",
        long_word: "Palabra demasiado larga.",
        many_vowels_seq: "No más de 3 vocales seguidas.",
        many_consonants_seq: "No más de 3 consonantes seguidas.",
        word_too_short: "Cada palabra debe tener al menos 3 letras.",
        word_repeated_chars: "Una palabra no puede consistir en la misma letra repetida."
    },
    email: {
        length: "Correo demasiado largo (máximo 50 caracteres).",
        double_dot: "No se permiten dos puntos consecutivos.",
        format: "Formato de email inválido.",
        local_short: "Debe tener mínimo 3 caracteres antes del @.",
        domain_not_allowed: "Dominio no permitido (solo gmail.com, hotmail.com, outlook.com, yahoo.com, otaku.com, otakushop.com)."
    },
    phone: {
        length: "El número debe tener exactamente 10 dígitos.",
        prefix: "El número debe empezar con un prefijo móvil válido (300–323).",
        too_many_repeats: "No se permiten repeticiones excesivas (por ejemplo 3000000000).",
        sequence: "No se permiten secuencias numéricas (1234…)."
    },
    password: {
        length: "Mínimo 8 caracteres.",
        upper: "Incluye mayúscula (A–Z).",
        lower: "Incluye minúscula (a–z).",
        digit: "Incluye un número (0–9).",
        special: "Incluye un carácter especial (!@#$%^&*).",
        spaces: "No usar espacios."
    }
};

const getErrorMessage = (field, errors) => {
    if (errors.length > 0) {
        const errorCode = errors[0];
        return errorMessages[field] ? errorMessages[field][errorCode] || `Error de validación: ${errorCode}` : `Error de validación: ${errorCode}`;
    }
    return null;
}

const validators = {
  fullName: (value) => {
    if (!value) return null;
    const result = validateFullName(value);
    return getErrorMessage('fullName', result.errors);
  },
  
  email: (value) => {
    if (!value) return null;
    const result = validateEmail(value);
    return getErrorMessage('email', result.errors);
  },
  
  phone: (value) => {
    if (!value) return null;
    const result = validatePhone(value);
    return getErrorMessage('phone', result.errors);
  },
  
  password: (value) => {
    if (!value) return null;
    const result = validatePassword(value);
    return getErrorMessage('password', result.errors);
  },

  // Keep the other validators for now
  productName: (value) => {
    if (!value) return 'El nombre del producto es requerido';
    if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
    if (value.length > 100) return 'El nombre no puede exceder 100 caracteres';
    return null;
  },

  productDescription: (value) => {
    if (!value) return 'La descripción es requerida';
    if (value.length < 10) return 'La descripción debe tener al menos 10 caracteres';
    if (value.length > 500) return 'La descripción no puede exceder 500 caracteres';
    return null;
  },

  productPrice: (value) => {
    if (!value) return 'El precio es requerido';
    const price = parseFloat(value);
    if (isNaN(price)) return 'Ingresa un precio válido';
    if (price <= 0) return 'El precio debe ser mayor a 0';
    if (price > 1000000) return 'El precio no puede exceder $1,000,000';
    return null;
  },

  productStock: (value) => {
    if (value === '' || value === null || value === undefined) return 'El stock es requerido';
    const stock = parseInt(value);
    if (isNaN(stock)) return 'Ingresa un stock válido';
    if (stock < 0) return 'El stock no puede ser negativo';
    if (stock > 10000) return 'El stock no puede exceder 10,000';
    return null;
  },

  productCategory: (value) => {
    if (!value) return 'La categoría es requerida';
    return null;
  },

  imageUrl: (value) => {
    if (!value) return null; // Opcional
    try {
      new URL(value);
      if (!value.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return 'La URL debe ser una imagen (jpg, png, gif, webp)';
      }
      return null;
    } catch {
      return 'Ingresa una URL válida';
    }
  }
};

/**
 * Hook para validación en tiempo real con feedback visual
 */
export const useFieldValidation = (fieldName, value, customValidator = null) => {
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!value || value.length === 0) {
      setError(null);
      setWarning(null);
      setIsValid(false);
      return;
    }

    setIsValidating(true);

    // Debounce validation
    const timeoutId = setTimeout(() => {
      let errorMessage = null;

      // Use custom validator or default based on field name
      if (customValidator) {
        errorMessage = customValidator(value);
      } else if (validators[fieldName]) {
        errorMessage = validators[fieldName](value);
      }

      setError(errorMessage);
      setIsValid(!errorMessage);
      setWarning(null);
      setIsValidating(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [value, fieldName, customValidator]);

  return {
    error,
    warning,
    isValidating,
    isValid,
    hasError: !!error,
    hasWarning: !!warning
  };
};

/**
 * Hook para validación de contraseña con indicador de fortaleza
 */
export const usePasswordValidation = (password) => {
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [strengthColor, setStrengthColor] = useState('');

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setStrengthLabel('');
      setStrengthColor('');
      return;
    }

    // Calcular fortaleza
    let score = 0;
    if (password.length >= 8) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;

    setStrength(score);
    
    // Label y color según score
    if (score <= 20) {
      setStrengthLabel('Muy débil');
      setStrengthColor('bg-red-500');
    } else if (score <= 40) {
      setStrengthLabel('Débil');
      setStrengthColor('bg-orange-500');
    } else if (score <= 60) {
      setStrengthLabel('Aceptable');
      setStrengthColor('bg-yellow-500');
    } else if (score <= 80) {
      setStrengthLabel('Fuerte');
      setStrengthColor('bg-blue-500');
    } else {
      setStrengthLabel('Muy fuerte');
      setStrengthColor('bg-green-500');
    }
  }, [password]);

  return {
    strength,
    strengthLabel,
    strengthColor,
    requirements: {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  };
};

/**
 * Hook para validación de formulario completo
 */
export const useFormValidation = (fields) => {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (name, value, validator) => {
    const errorMessage = validator ? validator(value) : null;
    
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));

    return !errorMessage;
  };

  const validateAll = () => {
    let allValid = true;
    const newErrors = {};

    Object.entries(fields).forEach(([name, { value, validator }]) => {
      const errorMessage = validator ? validator(value) : null;
      
      if (errorMessage) {
        allValid = false;
        newErrors[name] = errorMessage;
      }
    });

    setErrors(newErrors);
    setIsValid(allValid);
    
    return allValid;
  };

  return {
    errors,
    isValid,
    validateField,
    validateAll
  };
};

export default useFieldValidation;

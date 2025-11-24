/**
 * 🎣 CUSTOM HOOKS PARA VALIDACIÓN
 * Hooks reutilizables para validación de formularios en tiempo real
 */

import { useState, useEffect, useCallback } from 'react';
import useDebounce from '../useDebounce';

/**
 * Hook para validar un campo individual con debounce
 * 
 * @param {Function} validator - Función de validación (ej: validateFullName)
 * @param {Object} options - Opciones del validador
 * @param {number} debounceMs - Tiempo de debounce en milisegundos
 * @returns {Object} - { value, setValue, errors, warnings, isValid, isValidating, validate, reset }
 */
export const useFieldValidation = (validator, options = {}, debounceMs = 300) => {
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [touched, setTouched] = useState(false);

  const debouncedValue = useDebounce(value, debounceMs);

  // Función de validación
  const validate = useCallback((inputValue) => {
    if (!inputValue || inputValue.trim() === '') {
      setErrors([]);
      setWarnings([]);
      setIsValid(false);
      return { isValid: false, errors: [], warnings: [] };
    }

    setIsValidating(true);

    const result = validator(inputValue, options);

    setErrors(result.errors || []);
    setWarnings(result.warnings || []);
    setIsValid(result.isValid);
    setIsValidating(false);

    return result;
  }, [validator, options]);

  // Validar cuando cambia el valor (con debounce)
  useEffect(() => {
    if (touched && debouncedValue) {
      validate(debouncedValue);
    }
  }, [debouncedValue, touched, validate]);

  // Marcar como tocado al cambiar el valor
  const handleChange = (newValue) => {
    setValue(newValue);
    if (!touched) {
      setTouched(true);
    }
  };

  // Reset
  const reset = () => {
    setValue('');
    setErrors([]);
    setWarnings([]);
    setIsValid(false);
    setTouched(false);
  };

  return {
    value,
    setValue: handleChange,
    errors,
    warnings,
    isValid,
    isValidating,
    touched,
    validate: () => validate(value),
    reset
  };
};

/**
 * Hook para validar múltiples campos en un formulario
 * 
 * @param {Object} initialValues - Valores iniciales { fieldName: '' }
 * @param {Object} validatorConfig - Configuración { fieldName: { validator, options } }
 * @returns {Object} - { values, errors, warnings, isValid, handleChange, handleBlur, validateAll, reset }
 */
export const useFormValidation = (initialValues = {}, validatorConfig = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState({});

  // Validar un campo específico
  const validateField = useCallback((fieldName, value) => {
    const config = validatorConfig[fieldName];
    if (!config) return { isValid: true, errors: [], warnings: [] };

    const { validator, options = {} } = config;
    return validator(value, options);
  }, [validatorConfig]);

  // Manejar cambio de campo
  const handleChange = (fieldName) => (event) => {
    const newValue = event.target ? event.target.value : event;

    setValues(prev => ({ ...prev, [fieldName]: newValue }));

    // Validar si ya fue tocado
    if (touched[fieldName]) {
      setIsValidating(prev => ({ ...prev, [fieldName]: true }));

      setTimeout(() => {
        const result = validateField(fieldName, newValue);
        
        setErrors(prev => ({ ...prev, [fieldName]: result.errors || [] }));
        setWarnings(prev => ({ ...prev, [fieldName]: result.warnings || [] }));
        setIsValidating(prev => ({ ...prev, [fieldName]: false }));
      }, 300); // Debounce
    }
  };

  // Manejar blur (marcar como tocado)
  const handleBlur = (fieldName) => () => {
    if (!touched[fieldName]) {
      setTouched(prev => ({ ...prev, [fieldName]: true }));

      // Validar al hacer blur
      const result = validateField(fieldName, values[fieldName]);
      setErrors(prev => ({ ...prev, [fieldName]: result.errors || [] }));
      setWarnings(prev => ({ ...prev, [fieldName]: result.warnings || [] }));
    }
  };

  // Validar todos los campos
  const validateAll = () => {
    const newErrors = {};
    const newWarnings = {};
    const newTouched = {};

    Object.keys(validatorConfig).forEach(fieldName => {
      const result = validateField(fieldName, values[fieldName]);
      newErrors[fieldName] = result.errors || [];
      newWarnings[fieldName] = result.warnings || [];
      newTouched[fieldName] = true;
    });

    setErrors(newErrors);
    setWarnings(newWarnings);
    setTouched(newTouched);

    // Verificar si hay errores
    const hasErrors = Object.values(newErrors).some(errs => errs.length > 0);

    return {
      isValid: !hasErrors,
      errors: newErrors,
      warnings: newWarnings
    };
  };

  // Reset formulario
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setWarnings({});
    setTouched({});
  };

  // Calcular isValid general
  const isValid = Object.keys(validatorConfig).every(fieldName => {
    const fieldErrors = errors[fieldName] || [];
    return fieldErrors.length === 0;
  });

  return {
    values,
    errors,
    warnings,
    touched,
    isValidating,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues
  };
};

/**
 * Hook especializado para validación de contraseña con confirmación
 */
export const usePasswordValidation = (options = {}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordWarnings, setPasswordWarnings] = useState([]);
  const [confirmErrors, setConfirmErrors] = useState([]);
  const [strengthInfo, setStrengthInfo] = useState(null);
  const [isValid, setIsValid] = useState(false);

  const debouncedPassword = useDebounce(password, 300);

  // Validar contraseña
  useEffect(() => {
    if (debouncedPassword) {
      const { validatePassword } = require('./validators');
      const result = validatePassword(debouncedPassword, options);

      setPasswordErrors(result.errors);
      setPasswordWarnings(result.warnings);
      setStrengthInfo(result.strengthInfo);
    } else {
      setPasswordErrors([]);
      setPasswordWarnings([]);
      setStrengthInfo(null);
    }
  }, [debouncedPassword, options]);

  // Validar confirmación
  useEffect(() => {
    if (confirmPassword) {
      if (confirmPassword !== password) {
        setConfirmErrors(['Las contraseñas no coinciden']);
      } else {
        setConfirmErrors([]);
      }
    } else {
      setConfirmErrors([]);
    }
  }, [confirmPassword, password]);

  // Calcular isValid
  useEffect(() => {
    setIsValid(
      passwordErrors.length === 0 &&
      confirmErrors.length === 0 &&
      password !== '' &&
      confirmPassword !== '' &&
      password === confirmPassword
    );
  }, [passwordErrors, confirmErrors, password, confirmPassword]);

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordErrors,
    passwordWarnings,
    confirmErrors,
    strengthInfo,
    isValid,
    reset: () => {
      setPassword('');
      setConfirmPassword('');
      setPasswordErrors([]);
      setPasswordWarnings([]);
      setConfirmErrors([]);
      setStrengthInfo(null);
    }
  };
};

/**
 * Hook para validación asíncrona (ej: verificar si email ya existe)
 */
export const useAsyncValidation = (asyncValidator, debounceMs = 500) => {
  const [value, setValue] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(null);

  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    if (!debouncedValue) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    setIsChecking(true);

    asyncValidator(debouncedValue)
      .then(result => {
        setIsAvailable(result.available);
        setError(result.error || null);
      })
      .catch(err => {
        setError(err.message);
        setIsAvailable(null);
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, [debouncedValue, asyncValidator]);

  return {
    value,
    setValue,
    isChecking,
    isAvailable,
    error,
    reset: () => {
      setValue('');
      setIsChecking(false);
      setError(null);
      setIsAvailable(null);
    }
  };
};

export default {
  useFieldValidation,
  useFormValidation,
  usePasswordValidation,
  useAsyncValidation
};

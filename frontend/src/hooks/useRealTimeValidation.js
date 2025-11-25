/**
 * 🔍 HOOK PARA VALIDACIÓN EN TIEMPO REAL
 * Valida campos mientras el usuario tipea
 */

import { useState, useCallback } from 'react'
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validatePrice,
} from '../utils/validators'

const validatorMap = {
  name: validateName,
  fullName: validateName,
  email: validateEmail,
  phone: validatePhone,
  password: validatePassword,
  price: validatePrice,
}

export const useRealTimeValidation = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isValid, setIsValid] = useState({})

  // Validar un campo individual
  const validateField = useCallback((fieldName, value) => {
    const validator = validatorMap[fieldName]

    if (!validator) {
      return { isValid: true, errors: [] }
    }

    const result = validator(value)
    return {
      isValid: result.isValid,
      errors: result.errors || [],
      ...result, // Incluir propiedades adicionales como 'strength'
    }
  }, [])

  // Manejar cambio de campo
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }))

      // Validar si el campo ya fue tocado
      if (touched[name]) {
        const result = validateField(name, value)
        setErrors((prev) => ({
          ...prev,
          [name]: result.errors,
        }))
        setIsValid((prev) => ({
          ...prev,
          [name]: result.isValid,
        }))
      }
    },
    [touched, validateField]
  )

  // Marcar campo como tocado y validar
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }))

      const result = validateField(name, value)
      setErrors((prev) => ({
        ...prev,
        [name]: result.errors,
      }))
      setIsValid((prev) => ({
        ...prev,
        [name]: result.isValid,
      }))
    },
    [validateField]
  )

  // Validar todos los campos
  const validateAll = useCallback((formValues) => {
    const newErrors = {}
    const newIsValid = {}

    Object.entries(formValues).forEach(([fieldName, value]) => {
      const result = validateField(fieldName, value)
      newErrors[fieldName] = result.errors
      newIsValid[fieldName] = result.isValid
    })

    setErrors(newErrors)
    setIsValid(newIsValid)
    setTouched(
      Object.keys(formValues).reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {})
    )

    // Retornar si todos los campos son válidos
    return Object.values(newIsValid).every((val) => val === true)
  }, [validateField])

  // Obtener estado de un campo
  const getFieldStatus = useCallback(
    (fieldName) => {
      if (!touched[fieldName]) return 'neutral' // Campo no tocado
      if (errors[fieldName] && errors[fieldName].length > 0) return 'invalid' // Con errores
      if (isValid[fieldName]) return 'valid' // Válido
      return 'neutral'
    },
    [touched, errors, isValid]
  )

  // Resetear formulario
  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues)
    setErrors({})
    setTouched({})
    setIsValid({})
  }, [initialValues])

  return {
    values,
    setValues,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    getFieldStatus,
    resetForm,
  }
}

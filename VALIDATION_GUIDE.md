# 🔐 Guía de Validaciones - Otaku Shop

## Resumen de Cambios

Este documento describe el sistema mejorado de validaciones en el frontend.

## Validadores Disponibles

### 1. **validateName(name)**
Valida nombres completos con múltiples criterios:
- ✅ Mínimo 3 caracteres, máximo 50
- ✅ Solo letras, espacios, guiones y apóstrofes
- ✅ Requiere al menos 2 palabras (nombre y apellido)
- ✅ No permite espacios múltiples consecutivos

**Uso:**
```javascript
const result = validateName('Juan Pérez')
// { isValid: true, errors: [] }
```

### 2. **validateEmail(email)**
Valida emails con restricción de dominios:
- ✅ Formato válido RFC5321
- ✅ Solo dominios permitidos: gmail.com, hotmail.com, outlook.com, yahoo.com
- ✅ No permite puntos consecutivos
- ✅ Validación de estructura local@domain

**Uso:**
```javascript
const result = validateEmail('usuario@gmail.com')
// { isValid: true, errors: [] }
```

### 3. **validatePhone(phone)**
Valida teléfonos colombianos:
- ✅ Exactamente 10 dígitos
- ✅ Prefijos válidos de operadores: 300-305, 310-319, 320-321
- ✅ Detecta secuencias sospechosas
- ✅ Soporta formato internacional (57...)

**Uso:**
```javascript
const result = validatePhone('3001234567')
// { isValid: true, errors: [] }
```

### 4. **validatePassword(password)**
Valida contraseñas con indicador de fortaleza:
- ✅ Mínimo 8, máximo 32 caracteres
- ✅ Requiere mayúscula, minúscula, número y símbolo
- ✅ Retorna nivel de fortaleza (0-5)
- ✅ Retorna detalles de cada requisito

**Uso:**
```javascript
const result = validatePassword('MyPass123!@')
// { 
//   isValid: true, 
//   errors: [],
//   strength: 5,
//   minLength: true,
//   uppercase: true,
//   lowercase: true,
//   number: true,
//   special: true
// }
```

### 5. **validatePrice(price)**
Valida precios de productos:
- ✅ Rango: $5 - $1,000,000
- ✅ Debe ser número válido
- ✅ Mayor a cero

**Uso:**
```javascript
const result = validatePrice('99.99')
// { isValid: true, errors: [] }
```

## Hook: useRealTimeValidation

Hook personalizado para validación en tiempo real mientras el usuario tipea.

**Características:**
- Validación de campos mientras se escriben
- Estado de errores centralizado
- Validación al perder el foco (blur)
- Validación global de formularios
- Reset de formulario

**Uso:**
```javascript
import { useRealTimeValidation } from '../../hooks/useRealTimeValidation'

function MyForm() {
  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    getFieldStatus,
    resetForm
  } = useRealTimeValidation({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateAll(values)) {
      // Enviar formulario
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {errors.name && errors.name.length > 0 && (
        <span className="error">{errors.name[0]}</span>
      )}
    </form>
  )
}
```

## Componentes de UI

### ValidatedInput
Componente input con validación visual integrada.

**Props:**
- `label`: Etiqueta del campo
- `error`: Mensaje de error externo
- `warning`: Mensaje de advertencia
- `fieldName`: Nombre del campo (para validación automática)
- `showValidationIcon`: Mostrar icono de validación (✓/✗)

**Estados Visuales:**
- 🔴 Rojo: Campo con error
- 🟡 Amarillo: Advertencia
- 🟢 Verde: Válido
- ⚪ Gris: Sin validar

### PasswordStrengthIndicator
Muestra barra de fortaleza de contraseña con requisitos.

**Props:**
- `password`: Contraseña a evaluar

**Niveles:**
- Muy débil (0-20%)
- Débil (21-40%)
- Aceptable (41-60%)
- Fuerte (61-80%)
- Muy fuerte (81-100%)

## Mejoras Implementadas

### 1. Mensajes de Error Claros ✅
- Errores específicos y accionables
- Mensajes en español
- Sugerencias de corrección

### 2. Validación en Tiempo Real ⚡
- Feedback inmediato mientras tipea
- Validación al perder el foco
- Estados visuales claros

### 3. Sincronización Frontend-Backend 🔄
- Validaciones duplicadas para consistencia
- Backend valida también
- Errores del backend se muestran correctamente

### 4. Mejor UX 🎨
- Iconos de estado (✓/✗)
- Colores intuitivos
- Animaciones suaves
- Indicador de fortaleza en contraseñas

## Testing de Validaciones

### Nombre válido:
✅ `Juan Pérez` ✅ `María José López` ✅ `José-Luis García`

### Nombre inválido:
❌ `Juan` (solo 1 palabra) ❌ `123 456` (solo números) ❌ `abc xyz` (muy corto)

### Email válido:
✅ `usuario@gmail.com` ✅ `admin@hotmail.com` ✅ `vendedor@otakushop.com`

### Email inválido:
❌ `usuario@aol.com` (dominio no permitido) ❌ `user@` (incompleto) ❌ `user..name@gmail.com` (puntos dobles)

### Teléfono válido:
✅ `3001234567` ✅ `312 456 7890` ✅ `573015551234` (con código de país)

### Teléfono inválido:
❌ `1234567890` (prefijo no válido) ❌ `3001111111` (números repetidos) ❌ `123456` (muy corto)

### Contraseña válida:
✅ `MyPass123!@` (muy fuerte) ✅ `Secure#Pass99` (fuerte)

### Contraseña inválida:
❌ `password` (sin mayúscula/número/símbolo) ❌ `Pass123` (sin símbolo) ❌ `P@ss1` (menos de 8 caracteres)

## Archivos Modificados

1. **frontend/src/utils/validators.js** - Validadores mejorados
2. **frontend/src/hooks/useRealTimeValidation.js** - Nuevo hook
3. **frontend/src/components/auth/RegisterForm.jsx** - Mejorado con validación adicional
4. **frontend/src/components/ui/ValidatedInput.jsx** - Ya tenía validación
5. **frontend/src/components/ui/PasswordStrengthIndicator.jsx** - Ya tenía indicador

## Próximos Pasos (Opcional)

- [ ] Agregar validación de email duplicado en real-time
- [ ] Integrar con API para verificar disponibilidad de usuario
- [ ] Agregar CAPTCHA
- [ ] Implementar rate limiting para intentos de login fallidos
- [ ] Agregar two-factor authentication

# 🧪 PRUEBAS CARTCONTROLLER - ACCIÓN 2

## Instrucciones Previas
```bash
# 1. Backend debe estar corriendo en puerto 8080
# 2. Usuario debe estar autenticado (token JWT)
# 3. Base de datos debe estar lista
```

---

## 🔑 OBTENER TOKEN PRIMERO (Requerido para todas las pruebas)

```bash
# 1. Registrar un nuevo usuario
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "TestPass123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/register" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$token = ($response.Content | ConvertFrom-Json).data.token
Write-Host "Token obtenido: $token"

# O login si el usuario ya existe
$loginBody = @{
    email = "test@example.com"
    password = "TestPass123!"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $loginBody

$token = ($loginResponse.Content | ConvertFrom-Json).data.token
Write-Host "Token obtenido: $token"
```

---

## 📋 PRUEBAS CARTCONTROLLER

### TEST 1: Obtener carrito vacío
```bash
$token = "TU_TOKEN_AQUI"

$response = Invoke-WebRequest -Uri "http://localhost:8080/api/cart" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)"
```

**Respuesta Esperada:**
```json
{
  "items": [],
  "total": "0.00",
  "itemCount": 0,
  "message": "Carrito obtenido exitosamente"
}
```

---

### TEST 2: Agregar producto al carrito
```bash
$token = "TU_TOKEN_AQUI"

# Asumiendo que existe un producto con ID 1
$addBody = @{
    productId = 1
    quantity = 2
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8080/api/cart/add" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $addBody

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)"
```

**Respuesta Esperada:**
```json
{
  "cartItem": {
    "id": 1,
    "productId": 1,
    "productName": "Nombre Producto",
    "productImage": "https://...",
    "productPrice": "29.99",
    "quantity": 2,
    "subtotal": "59.98",
    "createdAt": "2025-11-22T13:24:00",
    "updatedAt": "2025-11-22T13:24:00"
  },
  "total": "59.98",
  "itemCount": 1,
  "message": "Producto agregado al carrito exitosamente"
}
```

---

### TEST 3: Obtener carrito con items
```bash
$token = "TU_TOKEN_AQUI"

$response = Invoke-WebRequest -Uri "http://localhost:8080/api/cart" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)"
```

**Respuesta Esperada:**
```json
{
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Nombre Producto",
      "productImage": "https://...",
      "productPrice": "29.99",
      "quantity": 2,
      "subtotal": "59.98",
      "createdAt": "2025-11-22T13:24:00",
      "updatedAt": "2025-11-22T13:24:00"
    }
  ],
  "total": "59.98",
  "itemCount": 1,
  "message": "Carrito obtenido exitosamente"
}
```

---

### TEST 4: Actualizar cantidad de item
```bash
$token = "TU_TOKEN_AQUI"
$cartItemId = 1  # Obtenido de TEST 2

$updateBody = @{
    quantity = 5
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8080/api/cart/$cartItemId" `
    -Method PUT `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $updateBody

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)"
```

**Respuesta Esperada:**
```json
{
  "cartItem": {
    "id": 1,
    "productId": 1,
    "quantity": 5,
    "subtotal": "149.95",
    ...
  },
  "total": "149.95",
  "itemCount": 1,
  "message": "Cantidad actualizada exitosamente"
}
```

---

### TEST 5: Eliminar un item del carrito
```bash
$token = "TU_TOKEN_AQUI"
$cartItemId = 1

$response = Invoke-WebRequest -Uri "http://localhost:8080/api/cart/$cartItemId" `
    -Method DELETE `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)"
```

**Respuesta Esperada:**
```json
{
  "total": "0.00",
  "itemCount": 0,
  "message": "Item eliminado del carrito exitosamente"
}
```

---

### TEST 6: Limpiar todo el carrito
```bash
$token = "TU_TOKEN_AQUI"

# Primero agregar varios items
$addBody = @{ productId = 1; quantity = 2 } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8080/api/cart/add" -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } -Body $addBody

# Luego limpiar
$response = Invoke-WebRequest -Uri "http://localhost:8080/api/cart" `
    -Method DELETE `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)"
```

**Respuesta Esperada:**
```json
{
  "message": "Carrito limpiado exitosamente"
}
```

---

## 🔐 PRUEBAS DE SEGURIDAD

### TEST 7: Acceso sin autenticación
```bash
# Sin token, debe retornar 401
$response = Invoke-WebRequest -Uri "http://localhost:8080/api/cart" `
    -Method GET `
    -ErrorAction SilentlyContinue

Write-Host "Status esperado: 401"
Write-Host "Status actual: $($response.StatusCode)"
```

---

### TEST 8: Token inválido
```bash
$response = Invoke-WebRequest -Uri "http://localhost:8080/api/cart" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer TOKEN_INVALIDO"
        "Content-Type" = "application/json"
    } `
    -ErrorAction SilentlyContinue

Write-Host "Status esperado: 401 o 403"
Write-Host "Status actual: $($response.StatusCode)"
```

---

## ❌ PRUEBAS DE ERRORES

### TEST 9: Producto no existe
```bash
$token = "TU_TOKEN_AQUI"

$addBody = @{
    productId = 99999  # ID que no existe
    quantity = 1
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8080/api/cart/add" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $addBody `
    -ErrorAction SilentlyContinue

Write-Host "Status esperado: 404"
Write-Host "Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)"
```

**Respuesta Esperada:**
```json
{
  "message": "Producto no encontrado",
  "status": 404
}
```

---

### TEST 10: Cantidad inválida
```bash
$token = "TU_TOKEN_AQUI"

$addBody = @{
    productId = 1
    quantity = 0  # Inválido
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8080/api/cart/add" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $addBody `
    -ErrorAction SilentlyContinue

Write-Host "Status esperado: 400"
Write-Host "Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)"
```

---

## 📊 RESUMEN DE PRUEBAS

| Test | Endpoint | Método | Esperado | Status |
|------|----------|--------|----------|--------|
| 1 | /api/cart | GET | 200 | ❌ |
| 2 | /api/cart/add | POST | 201 | ❌ |
| 3 | /api/cart | GET | 200 | ❌ |
| 4 | /api/cart/{id} | PUT | 200 | ❌ |
| 5 | /api/cart/{id} | DELETE | 200 | ❌ |
| 6 | /api/cart | DELETE | 200 | ❌ |
| 7 | /api/cart | GET | 401 | ❌ |
| 8 | /api/cart | GET | 401/403 | ❌ |
| 9 | /api/cart/add | POST | 404 | ❌ |
| 10 | /api/cart/add | POST | 400 | ❌ |

---

**Documento Generado:** 22 Nov 2025, 13:25  
**ACCIÓN 2 Status:** ✅ CÓDIGO COMPLETO Y COMPILADO

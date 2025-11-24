# 🔍 INFORME TÉCNICO DE AUDITORÍA COMPLETA
## Otaku Shop - E-commerce Fullstack

**Fecha:** 24 de Noviembre de 2025  
**Alcance:** Backend (Spring Boot 3.2 + PostgreSQL) + Frontend (React 18 + Tailwind CSS)  
**Auditor:** GitHub Copilot - Claude Sonnet 4.5

---

## 📋 RESUMEN EJECUTIVO

Se realizó una auditoría exhaustiva del proyecto **Otaku Shop**, enfocándose en:
- ✅ **Roles y permisos** (restricciones SUPERADMIN, visibilidad ADMIN)
- ✅ **Lógica del carrito** (gestión de stock, duplicación de productos)
- ✅ **Estilos CSS** (propuestas de mejora visual con efectos modernos)
- ✅ **Seguridad y calidad de código** (vulnerabilidades, buenas prácticas)

### Estado General
🟡 **BUENO CON MEJORAS CRÍTICAS NECESARIAS**

- **Backend:** Arquitectura sólida, pero con **vulnerabilidades críticas en roles**
- **Frontend:** Componentes bien organizados, **falta validación de stock en carrito**
- **Seguridad:** JWT implementado, pero **falta rate limiting y sanitización completa**
- **UX/UI:** Funcional, pero **requiere modernización visual**

---

## 🚨 HALLAZGOS CRÍTICOS

### 1. **CREACIÓN DE SUPERADMIN DESDE UI** ⚠️ **CRÍTICO**
**Ubicación:** `frontend/src/components/modals/CreateUserModal.jsx` (línea 164)

**Problema:**  
El modal permite seleccionar `superadmin` como rol desde la interfaz, violando el requisito de tener un solo SUPERADMIN creado manualmente en BD.

```jsx
// ❌ CÓDIGO ACTUAL (VULNERABLE)
<select name="role" value={formData.role} onChange={handleChange}>
  <option value="cliente">Cliente</option>
  <option value="vendedor">Vendedor</option>
  <option value="admin">Admin</option>
  <option value="superadmin">SuperAdmin</option>  // ❌ NO DEBE EXISTIR
</select>
```

**Solución:**
```jsx
// ✅ CÓDIGO CORREGIDO
<select name="role" value={formData.role} onChange={handleChange}>
  <option value="cliente">Cliente</option>
  <option value="vendedor">Vendedor</option>
  <option value="admin">Admin</option>
  {/* superadmin eliminado - solo creación manual en BD */}
</select>
```

**Validación adicional en backend:**  
Ya existe protección en `UserService.java` (línea 53), pero el endpoint `/auth/create-superadmin` está protegido con `@PreAuthorize("hasRole('SUPERADMIN')")` - **correcto**.

---

### 2. **LÓGICA DE CARRITO PERMITE EXCEDER STOCK** ⚠️ **CRÍTICO**

**Ubicación:**  
- `frontend/src/context/CartContext.jsx` (línea 8-20)
- `backend/src/main/java/com/otakushop/service/CartService.java` (línea 68-91)

**Problema:**  
Si un producto tiene stock de 12, el usuario puede:
1. Agregarlo 3 veces seleccionando 4 unidades cada vez
2. Terminar con 12 unidades en carrito (correcto por ahora)
3. PERO si lo agrega manualmente editando la cantidad, puede poner 36 o más

**Flujo actual vulnerable:**
```
1. Usuario agrega producto (stock: 12) con cantidad 4
   → CartItem creado: quantity = 4 ✅

2. Usuario vuelve a agregar mismo producto con cantidad 4
   → addQuantity(4) llamado → quantity = 8 ✅

3. Usuario agrega por tercera vez con cantidad 4
   → addQuantity(4) llamado → quantity = 12 ✅

4. Usuario edita manualmente en UI y pone 50
   → updateQuantity(50) llamado
   → Backend valida: product.stock (12) < 50 → RECHAZADO ✅
   
   PERO en frontend (CartContext):
   → updateQuantity() NO valida contra stock real ❌
   → Solo valida > 0
```

**Código vulnerable:**

**Frontend** (`CartContext.jsx`):
```jsx
// ❌ CÓDIGO ACTUAL (NO VALIDA STOCK)
const addItem = useCallback((product, quantity = 1) => {
  setItems((prevItems) => {
    const existingItem = prevItems.find((item) => item.id === product.id)
    
    if (existingItem) {
      return prevItems.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }  // ❌ Sin validación
          : item,
      )
    }
    
    return [...prevItems, { ...product, quantity }]
  })
}, [])
```

**Backend** (`CartService.java`):
```java
// ✅ Backend tiene validación parcial
public CartItemDTO addItem(Long userId, CartItemRequest request) {
    // ...
    if (product.getStock() < request.getQuantity()) {
        throw new IllegalArgumentException("Stock insuficiente");
    }
    
    CartItem existingItem = cartItemRepository
        .findByUserIdAndProductId(userId, request.getProductId())
        .orElse(null);
    
    if (existingItem != null) {
        existingItem.addQuantity(request.getQuantity());  // ❌ NO valida total
        // Debería validar: existingItem.quantity + request.quantity <= product.stock
        return convertToDTO(cartItemRepository.save(existingItem));
    }
    // ...
}
```

**Solución completa:**

**Backend corregido** (`CartService.java`):
```java
public CartItemDTO addItem(Long userId, CartItemRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    
    Product product = productRepository.findById(request.getProductId())
        .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
    
    // Validaciones básicas
    if (request.getQuantity() <= 0) {
        throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
    }
    
    // Si ya existe en el carrito, validar cantidad total
    CartItem existingItem = cartItemRepository
        .findByUserIdAndProductId(userId, request.getProductId())
        .orElse(null);
    
    if (existingItem != null) {
        int newTotalQuantity = existingItem.getQuantity() + request.getQuantity();
        
        // ✅ VALIDACIÓN CRÍTICA: Total en carrito no puede exceder stock
        if (newTotalQuantity > product.getStock()) {
            throw new IllegalArgumentException(
                String.format("Stock insuficiente. Máximo disponible: %d, Ya tienes en carrito: %d",
                    product.getStock(), existingItem.getQuantity())
            );
        }
        
        existingItem.setQuantity(newTotalQuantity);
        CartItem updated = cartItemRepository.save(existingItem);
        return convertToDTO(updated);
    }
    
    // Nuevo item: validar stock inicial
    if (product.getStock() < request.getQuantity()) {
        throw new IllegalArgumentException(
            String.format("Stock insuficiente. Disponible: %d", product.getStock())
        );
    }
    
    CartItem cartItem = CartItem.builder()
        .user(user)
        .product(product)
        .quantity(request.getQuantity())
        .build();
    
    CartItem saved = cartItemRepository.save(cartItem);
    return convertToDTO(saved);
}

public CartItemDTO updateItem(Long userId, Long cartItemId, Integer quantity) {
    CartItem cartItem = cartItemRepository.findById(cartItemId)
        .orElseThrow(() -> new ResourceNotFoundException("Item del carrito no encontrado"));
    
    if (!cartItem.getUser().getId().equals(userId)) {
        throw new SecurityException("No autorizado para modificar este item");
    }
    
    if (quantity <= 0) {
        throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
    }
    
    // ✅ VALIDACIÓN CRÍTICA: No permitir cantidad mayor al stock
    if (quantity > cartItem.getProduct().getStock()) {
        throw new IllegalArgumentException(
            String.format("Stock insuficiente. Máximo disponible: %d",
                cartItem.getProduct().getStock())
        );
    }
    
    cartItem.setQuantity(quantity);
    CartItem updated = cartItemRepository.save(cartItem);
    return convertToDTO(updated);
}
```

**Frontend corregido** (`ProductCard.jsx`):
```jsx
// ✅ VALIDACIÓN EN SELECTOR DE CANTIDAD
const handleAddToCart = () => {
  if (!isAuthenticated) {
    addNotification({
      message: 'Debes iniciar sesión para agregar productos al carrito',
      type: 'warning',
    })
    return
  }

  // ✅ Validar contra stock disponible
  if (quantity > product.stock) {
    addNotification({
      message: `Solo hay ${product.stock} unidades disponibles`,
      type: 'error',
    })
    return
  }

  addItem(product, quantity)
  addNotification({
    message: `${product.name} agregado al carrito`,
    type: 'success',
  })
  setQuantity(1)
}

// ✅ Limitar selector de cantidad al stock
<button
  onClick={() =>
    setQuantity(Math.min(product.stock || 1, quantity + 1))
  }
  disabled={quantity >= product.stock}
  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
>
  +
</button>
```

**Mensaje mejorado para el usuario:**
```jsx
// En CartList.jsx o donde se muestre la cantidad del carrito
{cartItem.quantity >= product.stock && (
  <span className="text-xs text-orange-500">
    Stock máximo alcanzado
  </span>
)}
```

---

### 3. **ADMIN PUEDE VER OTROS ADMIN Y SUPERADMIN** ⚠️ **ALTO**

**Ubicación:** `backend/src/main/java/com/otakushop/service/UserService.java` (línea 21-25)

**Problema:**  
El método `getAllUsers()` no filtra usuarios por rol del solicitante. Un ADMIN puede ver información de otros ADMIN y del SUPERADMIN.

```java
// ❌ CÓDIGO ACTUAL (SIN FILTRADO)
public List<UserResponse> getAllUsers() {
    return userRepository.findAll().stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
}
```

**Solución:**
```java
// ✅ CÓDIGO CORREGIDO (CON FILTRADO)
public List<UserResponse> getAllUsers() {
    List<User> allUsers = userRepository.findAll();
    
    // Si es SUPERADMIN, puede ver todos
    if (securityUtil.hasRole("SUPERADMIN")) {
        return allUsers.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Si es ADMIN, solo ve CLIENTE y VENDEDOR
    if (securityUtil.hasRole("ADMIN")) {
        return allUsers.stream()
                .filter(user -> user.getRole() == Role.CLIENTE || 
                               user.getRole() == Role.VENDEDOR)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Otros roles no tienen acceso (ya protegido por @PreAuthorize)
    return List.of();
}
```

---

## ⚠️ HALLAZGOS IMPORTANTES

### 4. **FALTA VALIDACIÓN EN ENDPOINT DE CREACIÓN DE USUARIOS**

**Ubicación:** `backend/src/main/java/com/otakushop/controller/AuthController.java`

**Problema:**  
No hay un endpoint específico para creación de usuarios por ADMIN. Se usa `/auth/register` que es público.

**Solución:**  
Crear endpoint específico en `UserController.java`:

```java
@PostMapping
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
    // Validar que ADMIN no pueda crear SUPERADMIN
    if (request.getRole().equalsIgnoreCase("superadmin") && !securityUtil.hasRole("SUPERADMIN")) {
        throw new IllegalArgumentException("Solo SUPERADMIN puede crear otro SUPERADMIN");
    }
    
    // Validar que solo exista un SUPERADMIN
    if (request.getRole().equalsIgnoreCase("superadmin")) {
        long superAdminCount = userRepository.countByRole(Role.SUPERADMIN);
        if (superAdminCount > 0) {
            throw new IllegalArgumentException("Ya existe un SUPERADMIN en el sistema");
        }
    }
    
    User newUser = authService.registerUser(request);
    return ResponseEntity.ok(convertToResponse(newUser));
}
```

---

### 5. **FALTA RATE LIMITING EN ENDPOINTS SENSIBLES**

**Problema:**  
No hay límite de intentos para login, registro ni creación de usuarios.

**Solución:**  
Implementar con **Bucket4j** o **Redis**:

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.1.0</version>
</dependency>
```

```java
// RateLimitingFilter.java
@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String clientId = getClientId(request);
        Bucket bucket = resolveBucket(clientId);
        
        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429); // Too Many Requests
            response.getWriter().write("Rate limit exceeded");
        }
    }
    
    private Bucket resolveBucket(String clientId) {
        return cache.computeIfAbsent(clientId, k -> {
            Bandwidth limit = Bandwidth.classic(20, Refill.intervally(20, Duration.ofMinutes(1)));
            return Bucket.builder().addLimit(limit).build();
        });
    }
    
    private String getClientId(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String user = SecurityContextHolder.getContext().getAuthentication().getName();
        return user != null ? user : ip;
    }
}
```

---

### 6. **FALTA SANITIZACIÓN DE INPUTS**

**Ubicación:** Todos los DTOs (Request objects)

**Problema:**  
No hay sanitización contra XSS, SQL Injection (aunque JPA previene SQL Injection, es buena práctica).

**Solución:**  
Usar **OWASP Java HTML Sanitizer**:

```xml
<dependency>
    <groupId>com.googlecode.owasp-java-html-sanitizer</groupId>
    <artifactId>owasp-java-html-sanitizer</artifactId>
    <version>20220608.1</version>
</dependency>
```

```java
// SanitizationUtil.java
public class SanitizationUtil {
    
    private static final PolicyFactory POLICY = Sanitizers.FORMATTING.and(Sanitizers.LINKS);
    
    public static String sanitize(String input) {
        if (input == null) return null;
        return POLICY.sanitize(input);
    }
}

// Uso en DTOs
@Data
public class ProductRequest {
    
    @NotBlank
    private String name;
    
    @NotBlank
    private String description;
    
    public void sanitize() {
        this.name = SanitizationUtil.sanitize(this.name);
        this.description = SanitizationUtil.sanitize(this.description);
    }
}
```

---

## 💡 OPORTUNIDADES DE MEJORA

### 7. **OPTIMIZACIÓN DE CONSULTAS EN DASHBOARD**

**Ubicación:** `SuperAdminDashboard.jsx`

**Problema:**  
Se hacen múltiples llamadas individuales para obtener stats.

**Solución:**  
Crear endpoint agregado:

```java
// StatsController.java
@GetMapping("/api/stats/dashboard")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public ResponseEntity<DashboardStats> getDashboardStats() {
    DashboardStats stats = DashboardStats.builder()
        .totalUsers(userRepository.count())
        .totalProducts(productRepository.count())
        .totalOrders(orderRepository.count())
        .totalRevenue(orderRepository.sumTotalRevenue())
        .build();
    return ResponseEntity.ok(stats);
}
```

---

### 8. **MEJORA DE UX: LOADING STATES**

**Problema:**  
Muchos componentes no muestran estado de carga.

**Solución:**  
Crear componente reutilizable:

```jsx
// components/ui/LoadingSpinner.jsx
const LoadingSpinner = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`} />
      {text && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  )
}

// Uso
{loading ? (
  <LoadingSpinner text="Cargando productos..." />
) : (
  <ProductList products={products} />
)}
```

---

### 9. **ESTRUCTURA DE CARPETAS: SEPARAR LÓGICA DE NEGOCIO**

**Problema:**  
Servicios tienen lógica de negocio mezclada con validaciones.

**Solución:**  
Patrón de Especificación:

```java
// specification/UserValidationSpec.java
public class UserValidationSpec {
    
    public static void validateRoleChange(User target, Role newRole, User requester) {
        // NO PERMITIR: Cambiar a SUPERADMIN
        if (newRole == Role.SUPERADMIN && target.getRole() != Role.SUPERADMIN) {
            throw new IllegalArgumentException("No se puede crear otro SUPERADMIN");
        }
        
        // NO PERMITIR: ADMIN cambiando rol de otro ADMIN
        if (target.getRole() == Role.ADMIN && requester.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Un ADMIN no puede cambiar rol de otro ADMIN");
        }
    }
    
    public static void validateDeletion(User target, User requester) {
        if (target.getRole() == Role.SUPERADMIN) {
            throw new IllegalArgumentException("No se puede eliminar a un SUPERADMIN");
        }
        
        if (target.getRole() == Role.ADMIN && requester.getRole() != Role.SUPERADMIN) {
            throw new IllegalArgumentException("Solo SUPERADMIN puede eliminar a un ADMIN");
        }
    }
}
```

---

## 🎨 PROPUESTAS DE REFACTOR - ESTILOS CSS

### Análisis del CSS Actual vs. Referencia

**CSS Actual:**
- ✅ Tailwind CSS 3.4.4 correctamente configurado
- ✅ Dark mode implementado con `class` strategy
- ⚠️ **Falta sistema de variables CSS personalizadas**
- ⚠️ **No hay animaciones sutiles**
- ⚠️ **Sin efectos glass morphism o neon**
- ⚠️ **Paleta de colores limitada (solo azul primary)**

**CSS de Referencia proporcionado:**
- ✨ Sistema completo de variables CSS (colores, espaciado, tipografía)
- ✨ Efectos neon con gradientes
- ✨ Glass morphism con backdrop-filter
- ✨ Animaciones keyframe (slideIn, pulse, fadeIn)
- ✨ Partículas con tsParticles

### Propuesta de Mejora (SIN REEMPLAZAR, SOLO AGREGAR)

**1. Agregar Variables CSS Globales**

```css
/* frontend/src/index.css - AGREGAR AL INICIO */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ========================================
   VARIABLES GLOBALES OTAKU SHOP
   ======================================== */
@layer base {
  :root {
    /* Paleta Neon - Tema Otaku */
    --color-neon-purple: #b55cff;
    --color-neon-pink: #ff3ea5;
    --color-neon-cyan: #42e2f4;
    
    /* Glass Effect */
    --glass-bg: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
    
    /* Shadows Neon */
    --shadow-neon-purple: 0 0 20px rgba(181, 92, 255, 0.3);
    --shadow-neon-cyan: 0 0 20px rgba(66, 226, 244, 0.3);
    
    /* Transiciones */
    --transition-fast: 150ms ease-in-out;
    --transition-base: 300ms ease-in-out;
    --transition-slow: 500ms ease-in-out;
  }
  
  .dark {
    --glass-bg: rgba(0, 0, 0, 0.3);
    --glass-border: rgba(255, 255, 255, 0.05);
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  @apply bg-white text-gray-900 dark:bg-gray-900 dark:text-white;
  transition: background-color var(--transition-base), color var(--transition-base);
}

#root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ========================================
   UTILIDADES PERSONALIZADAS
   ======================================== */
@layer utilities {
  /* Glass Morphism */
  .glass-effect {
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
  }
  
  /* Texto Neon Gradiente */
  .neon-text {
    background: linear-gradient(45deg, var(--color-neon-purple), var(--color-neon-pink), var(--color-neon-cyan));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  /* Hover con elevación */
  .hover-lift {
    transition: transform var(--transition-base), box-shadow var(--transition-base);
  }
  
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
}

/* ========================================
   ANIMACIONES
   ======================================== */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-neon {
  0%, 100% {
    box-shadow: 0 0 5px var(--color-neon-purple),
                0 0 10px var(--color-neon-purple);
  }
  50% {
    box-shadow: 0 0 10px var(--color-neon-pink),
                0 0 20px var(--color-neon-pink),
                0 0 30px var(--color-neon-pink);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.5s ease-out;
}

.animate-pulse-neon {
  animation: pulse-neon 2s ease-in-out infinite;
}
```

**2. Extender Tailwind Config con Colores Neon**

```javascript
// frontend/tailwind.config.js - ACTUALIZAR
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
        },
        // ✨ AGREGAR COLORES NEON
        neon: {
          purple: {
            light: '#c67fff',
            DEFAULT: '#b55cff',
            dark: '#9a3fe6',
          },
          pink: {
            light: '#ff5bb8',
            DEFAULT: '#ff3ea5',
            dark: '#e62a8f',
          },
          cyan: {
            light: '#5ee8f7',
            DEFAULT: '#42e2f4',
            dark: '#2bc9db',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      // ✨ AGREGAR ANIMACIONES
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'pulse-neon': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgb(181 92 255 / 0.5), 0 0 10px rgb(181 92 255 / 0.5)',
          },
          '50%': {
            boxShadow: '0 0 10px rgb(255 62 165 / 0.7), 0 0 20px rgb(255 62 165 / 0.7)',
          },
        },
      },
      // ✨ AGREGAR BLUR PARA GLASS
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
```

**3. Componentes con Efectos Visuales**

```jsx
// components/ui/GlassCard.jsx - NUEVO COMPONENTE
const GlassCard = ({ children, className = '', neonBorder = false }) => {
  return (
    <div className={`
      glass-effect 
      rounded-lg 
      p-6 
      hover-lift
      ${neonBorder ? 'border-neon-purple hover:shadow-[0_0_20px_rgba(181,92,255,0.4)]' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

// Uso en ProductCard.jsx
<GlassCard neonBorder className="animate-fade-in">
  <h3 className="neon-text text-xl font-bold">{product.name}</h3>
  <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
</GlassCard>
```

**4. Botones con Efectos Neon**

```jsx
// components/ui/Button.jsx - ACTUALIZAR VARIANTES
const Button = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:shadow-[0_0_20px_rgba(181,92,255,0.5)] hover:-translate-y-1',
    secondary: 'border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-gray-900 dark:hover:text-white',
    outline: 'border-2 border-gray-300 dark:border-gray-600 hover:border-neon-purple hover:text-neon-purple',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg',
    glass: 'glass-effect hover:bg-white/10 dark:hover:bg-black/30 border-white/20',
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

**5. Navbar con Efecto Glass**

```jsx
// components/layout/Navbar.jsx - ACTUALIZAR
<nav className="glass-effect sticky top-0 z-50 border-b border-white/10">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    <h1 className="neon-text text-2xl font-bold">Otaku Shop</h1>
    {/* ... resto del navbar ... */}
  </div>
</nav>
```

**6. Modal con Animación de Entrada**

```jsx
// Actualizar todos los modals con animación
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div className="glass-effect rounded-xl max-w-md w-full animate-fade-in border border-neon-purple/30">
    {/* contenido del modal */}
  </div>
</div>
```

---

### Integración de Partículas (OPCIONAL - SOLO SI NO AFECTA RENDIMIENTO)

**Instalación ligera:**
```bash
npm install @tsparticles/react @tsparticles/slim
```

**Componente de fondo:**
```jsx
// components/common/ParticlesBackground.jsx
import { useCallback } from 'react'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine)
  }, [])

  return (
    <Particles
      id="particles-bg"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        particles: {
          number: { value: 50, density: { enable: true, value_area: 800 } },
          color: { value: ['#b55cff', '#ff3ea5', '#42e2f4'] },
          shape: { type: 'circle' },
          opacity: { value: 0.3 },
          size: { value: 3, random: true },
          links: {
            enable: true,
            distance: 150,
            color: '#b55cff',
            opacity: 0.2,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1,
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'out' },
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'repulse' },
            onClick: { enable: true, mode: 'push' },
          },
          modes: {
            repulse: { distance: 100 },
            push: { quantity: 2 },
          },
        },
      }}
    />
  )
}

// Uso en App.jsx o layout principal
<div className="relative">
  <ParticlesBackground />
  {/* resto de la app */}
</div>
```

---

## 📊 CÓDIGO DUPLICADO Y MALAS PRÁCTICAS

### 10. **DUPLICACIÓN EN SERVICIOS**

**Problema:**  
Conversión de entidades a DTOs repetida en múltiples servicios.

**Solución:**  
Usar **MapStruct** (ya está en `pom.xml` pero no se usa):

```java
// mapper/UserMapper.java
@Mapper(componentModel = "spring")
public interface UserMapper {
    
    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserResponse toResponse(User user);
    
    List<UserResponse> toResponseList(List<User> users);
}

// UserService.java - SIMPLIFICAR
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;  // ✅ Inyectar mapper
    
    public List<UserResponse> getAllUsers() {
        return userMapper.toResponseList(userRepository.findAll());  // ✅ Una línea
    }
}
```

---

### 11. **IMPORTS SIN USAR**

Detectados en:
- `SuperAdminDashboard.jsx` (línea 5): `services` importado pero no usado directamente
- `ProductCard.jsx`: `useState` importado innecesariamente si no se usa para loading

**Solución:**  
Limpiar con ESLint:

```json
// .eslintrc.json - AGREGAR
{
  "rules": {
    "no-unused-vars": "warn",
    "react/jsx-no-unused-vars": "warn"
  }
}
```

---

## 🔒 REVISIÓN DE SEGURIDAD COMPLETA

### 12. **JWT EXPIRATION CONFIGURATION**

**Ubicación:** `application.properties`

**Verificar:**
```properties
# ✅ ASEGURAR QUE ESTÉ CONFIGURADO
jwt.expiration=86400000  # 24 horas en milisegundos
jwt.secret=${JWT_SECRET}  # Variable de entorno
```

**Recomendación:**  
Implementar **Refresh Tokens** para mejor UX:

```java
// RefreshTokenService.java
@Service
public class RefreshTokenService {
    
    public RefreshToken createRefreshToken(Long userId) {
        RefreshToken refreshToken = RefreshToken.builder()
            .user(userRepository.findById(userId).orElseThrow())
            .token(UUID.randomUUID().toString())
            .expiryDate(Instant.now().plusMillis(604800000)) // 7 días
            .build();
        
        return refreshTokenRepository.save(refreshToken);
    }
    
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }
    
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException("Refresh token expirado");
        }
        return token;
    }
}
```

---

### 13. **CORS CONFIGURATION**

**Ubicación:** `SecurityConfig.java`

**Actual:**
```java
.allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173", "https://otaku-shop.onrender.com")
```

**✅ Correcto**, pero agregar configuración para métodos y headers:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Orígenes permitidos
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://otaku-shop.onrender.com"
    ));
    
    // ✅ AGREGAR MÉTODOS PERMITIDOS
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    
    // ✅ AGREGAR HEADERS PERMITIDOS
    configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
    
    // ✅ PERMITIR CREDENCIALES
    configuration.setAllowCredentials(true);
    
    // ✅ EXPONER HEADERS
    configuration.setExposedHeaders(Arrays.asList("Authorization"));
    
    // ✅ TIEMPO DE CACHE PARA PREFLIGHT
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

### 14. **VALIDACIÓN DE EMAIL Y TELÉFONO**

**Problema:**  
No hay validación de formato en DTOs.

**Solución:**
```java
// dto/RegisterRequest.java
@Data
public class RegisterRequest {
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100)
    private String name;
    
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email inválido")  // ✅ AGREGAR
    private String email;
    
    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{6,}$",
        message = "La contraseña debe contener letras y números"
    )  // ✅ AGREGAR
    private String password;
    
    @Pattern(
        regexp = "^\\+?[0-9]{7,15}$",
        message = "Teléfono inválido"
    )  // ✅ AGREGAR
    private String phone;
}
```

---

## 🚀 SIGUIENTE PASOS RECOMENDADOS

### PRIORIDAD CRÍTICA (Implementar AHORA)
1. ✅ **Eliminar opción `superadmin` del CreateUserModal** (5 min)
2. ✅ **Corregir lógica de carrito en CartService.java** (30 min)
3. ✅ **Filtrar usuarios en getAllUsers() según rol** (15 min)
4. ✅ **Agregar validaciones de email y teléfono** (10 min)

### PRIORIDAD ALTA (Próxima semana)
5. ⚠️ Implementar rate limiting con Bucket4j (2 horas)
6. ⚠️ Agregar sanitización de inputs (1 hora)
7. ⚠️ Crear endpoint `/api/users` para creación por ADMIN (1 hora)
8. ⚠️ Implementar sistema de variables CSS y efectos neon (3 horas)

### PRIORIDAD MEDIA (Próximo mes)
9. 📊 Optimizar queries con endpoint agregado de stats (2 horas)
10. 📊 Implementar refresh tokens (4 horas)
11. 📊 Migrar a MapStruct para conversiones DTO (3 horas)
12. 📊 Agregar loading states en todos los componentes (2 horas)

### PRIORIDAD BAJA (Backlog)
13. 🎨 Integrar partículas de fondo (opcional, 2 horas)
14. 🎨 Crear componente GlassCard reutilizable (1 hora)
15. 🎨 Modernizar Navbar con efecto glass (30 min)

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Modificar `UserService.getAllUsers()` con filtrado por rol
- [ ] Actualizar `CartService.addItem()` con validación de stock total
- [ ] Actualizar `CartService.updateItem()` con validación de stock
- [ ] Agregar `@Email` y `@Pattern` en DTOs
- [ ] Configurar CORS completo con métodos y headers
- [ ] Crear `UserValidationSpec` para centralizar lógica
- [ ] Implementar `RateLimitingFilter`
- [ ] Agregar `SanitizationUtil` con OWASP Sanitizer
- [ ] Crear endpoint `/api/stats/dashboard`
- [ ] Implementar `RefreshTokenService`

### Frontend
- [ ] Eliminar `<option value="superadmin">` en CreateUserModal.jsx
- [ ] Actualizar `ProductCard.jsx` con validación de stock en selector
- [ ] Agregar variables CSS en `index.css`
- [ ] Extender `tailwind.config.js` con colores neon y animaciones
- [ ] Crear componente `GlassCard.jsx`
- [ ] Actualizar `Button.jsx` con variante `glass` y `neon`
- [ ] Modernizar `Navbar.jsx` con efecto glass
- [ ] Agregar `animate-fade-in` en modals
- [ ] Crear `LoadingSpinner.jsx` component
- [ ] Limpiar imports sin usar con ESLint

### Testing
- [ ] Test unitario: `UserService.getAllUsers()` filtra correctamente
- [ ] Test unitario: `CartService.addItem()` rechaza exceso de stock
- [ ] Test E2E: Intentar crear SUPERADMIN desde UI (debe fallar)
- [ ] Test E2E: ADMIN no puede ver otros ADMIN
- [ ] Test E2E: Agregar producto al carrito excediendo stock

---

## 📌 CONCLUSIÓN

El proyecto **Otaku Shop** tiene una **base sólida** con arquitectura bien estructurada y tecnologías modernas. Sin embargo, presenta **vulnerabilidades críticas** en:

1. **Control de acceso a roles** (SUPERADMIN creación desde UI)
2. **Gestión de inventario** (carrito excediendo stock)
3. **Visibilidad de datos** (ADMIN viendo otros ADMIN)

Implementando las correcciones propuestas (especialmente las de **Prioridad Crítica**), el proyecto alcanzará un nivel de **producción segura**.

Las mejoras de **estilos CSS** propuestas modernizarán significativamente la UX sin comprometer rendimiento, manteniendo la esencia actual del diseño.

---

**Tiempo estimado total de implementación:**
- Correcciones críticas: **1 hora**
- Mejoras de seguridad: **4 horas**
- Mejoras visuales CSS: **3 horas**
- **TOTAL: ~8 horas** de desarrollo

---

**Auditoría completada el 24 de Noviembre de 2025**  
*Para cualquier consulta técnica sobre este informe, revisar el código fuente o ejecutar los tests propuestos.*

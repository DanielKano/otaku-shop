# 🎨 Guía de Uso - Nuevos Componentes y Estilos

## Componentes Creados

### 1. **GlassCard** - Card con efecto glass morphism

```jsx
import GlassCard from '../components/ui/GlassCard'

// Card básico con efecto glass
<GlassCard>
  <h3>Mi contenido</h3>
  <p>Texto con efecto de vidrio esmerilado</p>
</GlassCard>

// Card con borde neon morado
<GlassCard neonBorder neonColor="purple">
  <h3>Card con borde neon</h3>
</GlassCard>

// Card con borde neon rosa
<GlassCard neonBorder neonColor="pink">
  <h3>Borde rosa neón</h3>
</GlassCard>

// Card con borde neon cyan
<GlassCard neonBorder neonColor="cyan">
  <h3>Borde cyan neón</h3>
</GlassCard>

// Card sin efecto hover
<GlassCard hover={false}>
  <h3>Sin efecto de elevación</h3>
</GlassCard>
```

### 2. **LoadingSpinner** - Spinner de carga con efecto neon

```jsx
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Spinner básico tamaño mediano
<LoadingSpinner />

// Spinner con texto
<LoadingSpinner text="Cargando productos..." />

// Spinner pequeño
<LoadingSpinner size="sm" />

// Spinner grande con color neon rosa
<LoadingSpinner size="lg" color="neon-pink" text="Procesando..." />

// Spinner con color neon cyan
<LoadingSpinner color="neon-cyan" text="Cargando..." />

// Uso condicional
{loading ? (
  <LoadingSpinner text="Cargando..." />
) : (
  <ProductList products={products} />
)}
```

### 3. **Button** - Nuevas variantes con efectos neon

```jsx
import Button from '../components/ui/Button'

// Botón con gradiente neon (morado a rosa)
<Button variant="neon">
  Comprar Ahora
</Button>

// Botón outline con borde neon cyan
<Button variant="neon-outline">
  Ver Detalles
</Button>

// Botón con efecto glass
<Button variant="glass">
  Explorar
</Button>

// Botones originales siguen funcionando
<Button variant="primary">Primario</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="danger">Peligro</Button>
<Button variant="outline">Outline</Button>
```

## Clases CSS Utilitarias

### Glass Morphism

```jsx
// Efecto glass en cualquier elemento
<div className="glass-effect rounded-lg p-6">
  Contenido con efecto vidrio
</div>
```

### Texto con Gradiente Neon

```jsx
// Texto con gradiente neon (morado → rosa → cyan)
<h1 className="neon-text text-4xl font-bold">
  Otaku Shop
</h1>
```

### Efecto Hover Lift

```jsx
// Elevación al hacer hover
<div className="hover-lift bg-white p-6 rounded-lg">
  Card que se eleva al pasar el mouse
</div>
```

### Animaciones

```jsx
// Fade in
<div className="animate-fade-in">
  Aparece suavemente
</div>

// Slide in desde la derecha
<div className="animate-slide-in-right">
  Entra deslizándose
</div>

// Pulso neon continuo
<div className="animate-pulse-neon border border-neon-purple p-4">
  Pulso de luz neón
</div>
```

## Colores Neon (Tailwind)

### Uso en clases

```jsx
// Texto neon
<p className="text-neon-purple">Texto morado neón</p>
<p className="text-neon-pink">Texto rosa neón</p>
<p className="text-neon-cyan">Texto cyan neón</p>

// Fondos neon
<div className="bg-neon-purple">Fondo morado</div>
<div className="bg-neon-pink">Fondo rosa</div>
<div className="bg-neon-cyan">Fondo cyan</div>

// Bordes neon
<div className="border border-neon-purple">Borde morado</div>
<div className="border-2 border-neon-pink">Borde rosa grueso</div>

// Gradientes
<div className="bg-gradient-to-r from-neon-purple to-neon-pink">
  Gradiente morado a rosa
</div>

<div className="bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink">
  Gradiente triple
</div>
```

### Variantes de color

```jsx
// Light variant
<p className="text-neon-purple-light">Morado claro</p>

// Default
<p className="text-neon-purple">Morado normal</p>

// Dark variant
<p className="text-neon-purple-dark">Morado oscuro</p>
```

## Ejemplos Prácticos

### Dashboard Card Mejorado

```jsx
<GlassCard neonBorder neonColor="purple" className="animate-fade-in">
  <h3 className="neon-text text-2xl font-bold mb-4">
    Estadísticas
  </h3>
  <div className="space-y-3">
    <div className="flex justify-between">
      <span>Total Ventas:</span>
      <span className="text-neon-cyan font-bold">$12,345</span>
    </div>
    <div className="flex justify-between">
      <span>Productos:</span>
      <span className="text-neon-pink font-bold">156</span>
    </div>
  </div>
  <Button variant="neon" className="w-full mt-4">
    Ver Detalles
  </Button>
</GlassCard>
```

### Modal Mejorado

```jsx
{isOpen && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
    <GlassCard 
      neonBorder 
      neonColor="cyan" 
      className="max-w-md w-full animate-fade-in"
      style={{ animationDelay: '0.1s' }}
    >
      <h2 className="neon-text text-2xl font-bold mb-4">
        Confirmar Acción
      </h2>
      <p className="text-gray-300 mb-6">
        ¿Estás seguro de que deseas continuar?
      </p>
      <div className="flex gap-3">
        <Button variant="neon-outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="neon" onClick={onConfirm}>
          Confirmar
        </Button>
      </div>
    </GlassCard>
  </div>
)}
```

### Loading State

```jsx
const ProductsPage = () => {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          color="neon-purple" 
          text="Cargando productos..." 
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map(product => (
        <GlassCard key={product.id} neonBorder hover>
          <h3 className="font-bold">{product.name}</h3>
          <Button variant="neon" size="sm">Agregar</Button>
        </GlassCard>
      ))}
    </div>
  )
}
```

### Hero Section con Efectos

```jsx
<section className="min-h-screen flex items-center justify-center relative overflow-hidden">
  {/* Fondo con gradiente */}
  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20" />
  
  <div className="relative z-10 text-center animate-fade-in">
    <h1 className="neon-text text-6xl font-bold mb-6 animate-pulse-neon">
      Otaku Shop
    </h1>
    <p className="text-2xl text-gray-300 mb-8">
      Tu tienda de anime, manga y cultura otaku
    </p>
    <div className="flex gap-4 justify-center">
      <Button variant="neon" size="lg">
        Explorar Productos
      </Button>
      <Button variant="neon-outline" size="lg">
        Conocer Más
      </Button>
    </div>
  </div>
</section>
```

## Variables CSS Disponibles

Puedes usar estas variables en CSS personalizado:

```css
/* En tu CSS personalizado */
.mi-componente {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--color-neon-purple);
  box-shadow: var(--shadow-neon-cyan);
  transition: all var(--transition-base);
}

.mi-componente:hover {
  box-shadow: var(--shadow-neon-purple);
}
```

### Variables disponibles:
- **Colores:** `--color-neon-purple`, `--color-neon-pink`, `--color-neon-cyan`
- **Glass:** `--glass-bg`, `--glass-border`
- **Sombras:** `--shadow-neon-purple`, `--shadow-neon-cyan`
- **Transiciones:** `--transition-fast`, `--transition-base`, `--transition-slow`

## Recomendaciones

1. **Glass Effect:** Úsalo en cards, modals, navbars para un look moderno
2. **Neon Colors:** Reserva para elementos importantes (CTAs, títulos, highlights)
3. **Animaciones:** Usa `animate-fade-in` en elementos que aparecen dinámicamente
4. **LoadingSpinner:** Muestra siempre durante operaciones asíncronas
5. **GlassCard:** Perfecto para dashboards, stats, featured content

## Compatibilidad

- ✅ Chrome, Edge, Safari (moderno)
- ✅ Firefox
- ⚠️ IE11 no soporta `backdrop-filter` (fallback disponible)
- ✅ Mobile browsers modernos

## Rendimiento

- Animaciones optimizadas con GPU
- `backdrop-filter` puede afectar performance en dispositivos antiguos
- Usa `will-change` solo cuando sea necesario
- Evita múltiples `glass-effect` anidados

---

**¡Disfruta de tu nueva UI moderna con efectos neon y glass morphism!** 🎨✨

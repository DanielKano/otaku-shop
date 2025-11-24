import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import GlassCard from '../../components/ui/GlassCard'
import AnimatedCard from '../../components/ui/AnimatedCard'

const HomePage = () => {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 animate-scale-in">🎌 OTAKU SHOP</h1>
          <p className="text-2xl mb-8 font-medium">Tu tienda geek favorita - Encuentra todo lo que amas</p>
          <Button
            as={Link}
            to="/productos"
            variant="glass"
            size="lg"
            className="hover:scale-110 transition-transform"
          >
            ✨ Explorar Productos
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold neon-text mb-12 text-center">
          ⭐ Productos Destacados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { emoji: '🎀', name: 'Figura Anime', price: '$99.99', delay: 0 },
            { emoji: '📚', name: 'Manga Vol. 1', price: '$15.99', delay: 100 },
            { emoji: '🎮', name: 'Juego Retro', price: '$49.99', delay: 200 },
            { emoji: '👕', name: 'Camiseta Otaku', price: '$29.99', delay: 300 }
          ].map((product, i) => (
            <AnimatedCard
              key={i}
              animation="slide"
              delay={product.delay}
              hover3d
            >
              <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-6xl mb-4">
                {product.emoji}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{product.name}</h3>
              <p className="text-neon-purple dark:text-neon-cyan font-bold mt-2 text-xl">{product.price}</p>
              <Button variant="neon" size="sm" className="mt-4 w-full">
                Ver Detalles
              </Button>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold neon-text mb-12 text-center">
          🎯 Categorías Populares
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Anime & Manga', icon: '📺', color: 'purple' },
            { title: 'Figuras Coleccionables', icon: '🎭', color: 'pink' },
            { title: 'Gaming', icon: '🎮', color: 'cyan' }
          ].map((cat, i) => (
            <GlassCard key={i} neonBorder neonColor={cat.color}>
              <div className="text-center">
                <div className="text-6xl mb-4">{cat.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{cat.title}</h3>
                <Button variant="neon-outline" size="sm" className="mt-4">
                  Explorar
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            💼 ¿Eres vendedor?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Publica tus productos geek favoritos y alcanza a miles de clientes apasionados.
          </p>
          <Button
            as={Link}
            to="/registro"
            variant="glass"
            size="lg"
            className="hover:scale-110 transition-transform"
          >
            🚀 Comenzar a Vender
          </Button>
        </div>
      </section>
    </div>
  )
}

export default HomePage

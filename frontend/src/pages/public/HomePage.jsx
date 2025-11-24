import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

const HomePage = () => {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">🎌 OTAKU SHOP</h1>
          <p className="text-xl mb-8">Tu tienda geek favorita</p>
          <Button
            as={Link}
            to="/productos"
            variant="primary"
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Explorar Productos
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Productos Destacados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl">
                🎀
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Producto {i}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-bold mt-2">$99.99</p>
                <Button variant="primary" size="sm" className="mt-4 w-full">
                  Ver Detalles
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 dark:bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            ¿Eres vendedor?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Publica tus productos geek favoritos y alcanza a miles de clientes.
          </p>
          <Button
            as={Link}
            to="/registro"
            variant="primary"
            size="lg"
          >
            Comenzar a Vender
          </Button>
        </div>
      </section>
    </div>
  )
}

export default HomePage

import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex flex-col items-center justify-center py-20">
      <div className="text-center animate-fade-in">
        <h1 className="text-9xl font-bold neon-text mb-6">404</h1>
        <p className="text-3xl text-gray-600 dark:text-gray-300 mb-4">
          🚫 Página no encontrada
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-10">
          La página que buscas no existe o ha sido movida
        </p>
        <Button as={Link} to="/" variant="gradient" size="lg">
          🏠 Volver al Inicio
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage

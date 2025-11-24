import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Página no encontrada
      </p>
      <Button as={Link} to="/" variant="primary">
        Volver al Inicio
      </Button>
    </div>
  )
}

export default NotFoundPage

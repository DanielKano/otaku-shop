import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Otaku Shop
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Tu tienda geek favorita. Encuentra los mejores productos de anime, manga y cultura otaku.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Links
            </h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li><Link to="/conocenos" className="hover:text-gray-900 dark:hover:text-white">Conócenos</Link></li>
              <li><Link to="/politicas" className="hover:text-gray-900 dark:hover:text-white">Políticas</Link></li>
              <li><a href="mailto:soporte@otakushop.com" className="hover:text-gray-900 dark:hover:text-white">Contacto</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              Redes Sociales
            </h4>
            <div className="flex space-x-4">
              <a href="#" className="text-2xl hover:opacity-70">📘</a>
              <a href="#" className="text-2xl hover:opacity-70">🐦</a>
              <a href="#" className="text-2xl hover:opacity-70">📷</a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-gray-600 dark:text-gray-300">
          <p>© {currentYear} Otaku Shop. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

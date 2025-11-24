const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🎌 Otaku Shop
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Tu tienda de confianza para productos anime, manga y cultura otaku
          </p>
        </div>

        {/* About Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Sobre Nosotros
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Otaku Shop nació de la pasión por el anime, manga y la cultura otaku. Nos dedica-
              mos a proporcionar productos de alta calidad a precios justos, tanto para coleccio-
              nistas serios como para nuevos fans.
            </p>
            <p>
              Con más de 5,000 productos disponibles en nuestro catálogo, ofrecemos una amplia
              variedad de figuras coleccionables, ropa, accesorios, manga y mucho más de tus
              animes y mangas favoritos.
            </p>
            <p>
              Nuestro equipo está comprometido con brindar un servicio excepcional, entrega
              rápida y un ambiente seguro para que disfrutes tu experiencia de compra.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: '🎯 Misión',
              description: 'Hacer accesibles productos de anime y manga de calidad para todos los otakus.',
            },
            {
              title: '⭐ Visión',
              description: 'Ser la plataforma número uno en Latinoamérica para compra de productos otaku.',
            },
            {
              title: '💚 Valores',
              description: 'Transparencia, calidad, confiabilidad y pasión por la comunidad otaku.',
            },
          ].map((value, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-white text-center">
            {[
              { number: '5,000+', label: 'Productos' },
              { number: '50,000+', label: 'Clientes Felices' },
              { number: '24/7', label: 'Soporte' },
              { number: '100%', label: 'Seguro' },
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="text-4xl font-bold mb-2">{stat.number}</p>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Contactanos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '📧', title: 'Email', content: 'info@otakushop.com' },
              { icon: '📱', title: 'WhatsApp', content: '+1 (555) 123-4567' },
              { icon: '📍', title: 'Ubicación', content: 'Latinoamérica' },
            ].map((contact, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl mb-2">{contact.icon}</p>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {contact.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {contact.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage

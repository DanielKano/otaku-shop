import NeonCard from '../../components/ui/NeonCard'
import StatsCardEnhanced from '../../components/ui/StatsCardEnhanced'

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl font-bold neon-text mb-4">
            🎌 Otaku Shop
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-400">
            Tu tienda de confianza para productos anime, manga y cultura otaku
          </p>
        </div>

        {/* About Section */}
        <NeonCard neonColor="purple" className="p-8 mb-8 animate-slide-in-right">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            ✨ Sobre Nosotros
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
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
        </NeonCard>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: '🎯 Misión',
              description: 'Hacer accesibles productos de anime y manga de calidad para todos los otakus.',
              color: 'cyan',
            },
            {
              title: '⭐ Visión',
              description: 'Ser la plataforma número uno en Latinoamérica para compra de productos otaku.',
              color: 'pink',
            },
            {
              title: '💚 Valores',
              description: 'Transparencia, calidad, confiabilidad y pasión por la comunidad otaku.',
              color: 'purple',
            },
          ].map((value, idx) => (
            <NeonCard key={idx} neonColor={value.color} animated className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {value.description}
              </p>
            </NeonCard>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { number: '5,000+', label: 'Productos', icon: '📦', color: 'purple' },
            { number: '50,000+', label: 'Clientes Felices', icon: '😊', color: 'cyan' },
            { number: '24/7', label: 'Soporte', icon: '🎧', color: 'pink' },
            { number: '100%', label: 'Seguro', icon: '🔒', color: 'purple' },
          ].map((stat, idx) => (
            <StatsCardEnhanced
              key={idx}
              title={stat.label}
              value={stat.number}
              icon={stat.icon}
              trend="up"
              color={stat.color}
              neonEffect
            />
          ))}
        </div>

        {/* Contact Section */}
        <NeonCard neonColor="gradient" className="p-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            📞 Contactanos
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
        </NeonCard>
      </div>
    </div>
  )
}

export default AboutPage

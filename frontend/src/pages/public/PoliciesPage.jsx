import NeonCard from '../../components/ui/NeonCard'

const PoliciesPage = () => {
  const policies = [
    {
      id: 1,
      title: '📋 Términos de Servicio',
      content: `Última actualización: ${new Date().toLocaleDateString('es-ES')}

1. Aceptación de Términos
Al acceder y utilizar Otaku Shop, aceptas estar vinculado por estos términos y condiciones. Si no estás de acuerdo, no debes utilizar este sitio.

2. Licencia de Uso
Se te otorga una licencia limitada, no exclusiva y revocable para utilizar este sitio web únicamente para fines personales y no comerciales.

3. Restricciones de Uso
No debes:
- Reproducir o distribuir contenido del sitio sin autorización
- Utilizar el sitio para actividades ilegales
- Intentar acceder a áreas restringidas
- Usar bots o scrapers para recopilar datos

4. Propiedad Intelectual
Todo el contenido del sitio, incluyendo textos, imágenes, logos y código, es propiedad de Otaku Shop y está protegido por derechos de autor.

5. Limitación de Responsabilidad
Otaku Shop no se responsabiliza por daños indirectos, incidentales, especiales o consecuentes derivados del uso del sitio.`,
    },
    {
      id: 2,
      title: '🔒 Política de Privacidad',
      content: `Última actualización: ${new Date().toLocaleDateString('es-ES')}

1. Información que Recopilamos
- Información de registro: nombre, email, teléfono, dirección
- Información de transacciones: productos comprados, métodos de pago
- Información de navegación: cookies, direcciones IP, tipo de navegador

2. Cómo Utilizamos tu Información
- Procesar tus compras y entregas
- Personalizar tu experiencia
- Enviar notificaciones y promociones
- Mejorar nuestros servicios
- Cumplir con obligaciones legales

3. Seguridad de Datos
Utilizamos encriptación SSL/TLS y otras medidas de seguridad para proteger tu información personal.

4. Derechos de los Usuarios
Tienes derecho a:
- Acceder a tus datos personales
- Solicitar correcciones
- Solicitar la eliminación de datos
- Optar por no recibir comunicaciones

5. Cookies
Utilizamos cookies para mejorar tu experiencia. Puedes controlar las cookies desde las configuraciones de tu navegador.`,
    },
    {
      id: 3,
      title: '🚚 Política de Envíos',
      content: `Última actualización: ${new Date().toLocaleDateString('es-ES')}

1. Métodos de Envío
- Envío estándar: 3-5 días hábiles
- Envío express: 1-2 días hábiles
- Envío internacional: 7-14 días hábiles

2. Costos de Envío
Los costos varían según:
- Ubicación de entrega
- Peso del paquete
- Método de envío seleccionado

Envío gratis en compras mayores a $100

3. Rastreo
Se proporciona número de rastreo para todos los envíos. Puedes seguir tu paquete en tiempo real.

4. Paquetes Dañados o Perdidos
Si tu paquete llega dañado o perdido:
- Reporta dentro de 48 horas
- Proporciona evidencia fotográfica
- Procederemos a reenviar o reembolsar

5. Cambios de Dirección
Los cambios de dirección deben solicitarse dentro de 24 horas después de la compra.`,
    },
    {
      id: 4,
      title: '💰 Política de Devoluciones',
      content: `Última actualización: ${new Date().toLocaleDateString('es-ES')}

1. Período de Devolución
Tienes 30 días desde la recepción para devolver productos.

2. Condiciones de Devolución
Los productos deben:
- Estar en condiciones originales
- Incluir toda la documentación
- No mostrar signos de uso
- Tener todos los accesorios originales

3. Proceso de Devolución
1. Solicita la devolución en tu cuenta
2. Recibe instrucciones de envío
3. Envía el producto a nuestro almacén
4. Recibirás el reembolso en 5-7 días

4. Reembolsos
- Los reembolsos se procesan al original medio de pago
- Se deducen costos de envío si el cliente solicita la devolución sin razón válida

5. Excepciones
No se aceptan devoluciones de:
- Productos digitales
- Artículos personalizados
- Productos en liquidación`,
    },
    {
      id: 5,
      title: '⚠️ Política de Garantía',
      content: `Última actualización: ${new Date().toLocaleDateString('es-ES')}

1. Garantía del Fabricante
Todos los productos incluyen la garantía del fabricante según lo especificado en la descripción del producto.

2. Tipos de Garantía
- Garantía de defectos: 1 año
- Garantía de funcionamiento: según el fabricante
- Garantía extendida: disponible para compra

3. Cobertura de Garantía
La garantía cubre:
- Defectos de fabricación
- Componentes defectuosos
- Fallos de funcionamiento

No cubre:
- Daño por uso inadecuado
- Accidentes o caídas
- Desgaste normal

4. Proceso de Reclamación
1. Contacta al soporte con prueba de compra
2. Describe el problema
3. Envía fotos del producto
4. Envía el producto para evaluación
5. Recibe reparación o reembolso

5. Contacto de Soporte
Email: soporte@otakushop.com
WhatsApp: +1 234 567 8900`,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold neon-text mb-4">
            📋 Políticas y Términos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Consulta nuestras políticas para una mejor experiencia de compra
          </p>
        </div>

        {/* Policies */}
        <div className="space-y-8">
          {policies.map((policy, idx) => (
            <NeonCard
              key={policy.id}
              neonColor={['purple', 'cyan', 'pink', 'purple', 'cyan'][idx]}
              className="p-8 animate-slide-in-right"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {policy.title}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-base">
                {policy.content}
              </div>
            </NeonCard>
          ))}
        </div>

        {/* Contact */}
        <NeonCard neonColor="gradient" className="mt-12 p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ❓ ¿Preguntas sobre nuestras políticas?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
            Contacta a nuestro equipo de soporte para aclaraciones o consultas específicas.
          </p>
          <div className="space-y-3 glass-effect p-6 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold">
              📧 Email: soporte@otakushop.com
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold">
              💬 WhatsApp: +1 234 567 8900
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold">
              🕐 Lunes a Viernes: 9:00 AM - 6:00 PM
            </p>
          </div>
        </NeonCard>
      </div>
    </div>
  )
}

export default PoliciesPage

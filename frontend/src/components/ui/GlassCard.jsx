import PropTypes from 'prop-types'

/**
 * GlassCard - Card con efecto glass morphism y opcional borde neon
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del card
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.neonBorder - Si debe tener borde con efecto neon
 * @param {string} props.neonColor - Color del borde neon: 'purple' | 'pink' | 'cyan'
 * @param {boolean} props.hover - Si debe tener efecto hover de elevación
 */
const GlassCard = ({ 
  children, 
  className = '', 
  neonBorder = false,
  neonColor = 'purple',
  hover = true,
  ...props 
}) => {
  const neonColors = {
    purple: 'border-neon-purple hover:shadow-[0_0_20px_rgba(181,92,255,0.4)]',
    pink: 'border-neon-pink hover:shadow-[0_0_20px_rgba(255,62,165,0.4)]',
    cyan: 'border-neon-cyan hover:shadow-[0_0_20px_rgba(66,226,244,0.4)]',
  }

  return (
    <div 
      className={`
        glass-effect 
        rounded-lg 
        p-6 
        ${hover ? 'hover-lift' : ''}
        ${neonBorder ? neonColors[neonColor] : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  neonBorder: PropTypes.bool,
  neonColor: PropTypes.oneOf(['purple', 'pink', 'cyan']),
  hover: PropTypes.bool,
}

export default GlassCard

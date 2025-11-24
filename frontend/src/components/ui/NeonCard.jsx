import PropTypes from 'prop-types'
import clsx from 'clsx'

/**
 * NeonCard - Card con bordes neon y efectos de brillo
 * 
 * @param {Object} props
 * @param {'purple'|'pink'|'cyan'|'gradient'} props.neonColor - Color del borde neon
 * @param {boolean} props.animated - Animar el efecto neon
 * @param {boolean} props.hover - Efecto hover adicional
 * @param {string} props.className - Clases adicionales
 * @param {React.ReactNode} props.children - Contenido del card
 * 
 * @example
 * <NeonCard neonColor="purple" animated>
 *   <h3>Título</h3>
 *   <p>Contenido...</p>
 * </NeonCard>
 */
export default function NeonCard({ 
  neonColor = 'purple',
  animated = false,
  hover = true,
  className,
  children 
}) {
  const borderColors = {
    purple: 'border-neon-purple shadow-[0_0_15px_rgba(181,92,255,0.3)] hover:shadow-[0_0_25px_rgba(181,92,255,0.5)]',
    pink: 'border-neon-pink shadow-[0_0_15px_rgba(255,62,165,0.3)] hover:shadow-[0_0_25px_rgba(255,62,165,0.5)]',
    cyan: 'border-neon-cyan shadow-[0_0_15px_rgba(66,226,244,0.3)] hover:shadow-[0_0_25px_rgba(66,226,244,0.5)]',
    gradient: 'border-transparent bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan shadow-[0_0_20px_rgba(181,92,255,0.4)]'
  }

  return (
    <div
      className={clsx(
        'rounded-lg p-6',
        'bg-white/5 dark:bg-gray-900/50',
        'backdrop-blur-sm',
        'border-2',
        borderColors[neonColor],
        hover && 'hover-lift',
        animated && 'animate-pulse-neon',
        'transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  )
}

NeonCard.propTypes = {
  neonColor: PropTypes.oneOf(['purple', 'pink', 'cyan', 'gradient']),
  animated: PropTypes.bool,
  hover: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
}

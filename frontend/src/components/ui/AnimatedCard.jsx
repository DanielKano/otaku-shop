import PropTypes from 'prop-types'
import clsx from 'clsx'

/**
 * AnimatedCard - Card con animaciones de entrada y hover
 * 
 * @param {Object} props
 * @param {'fade'|'slide'|'scale'|'flip'} props.animation - Tipo de animación
 * @param {number} props.delay - Delay de animación en ms
 * @param {boolean} props.hover3d - Efecto 3D en hover
 * @param {string} props.className - Clases adicionales
 * @param {React.ReactNode} props.children - Contenido del card
 * 
 * @example
 * <AnimatedCard animation="slide" delay={200} hover3d>
 *   <h3>Título</h3>
 * </AnimatedCard>
 */
export default function AnimatedCard({ 
  animation = 'fade',
  delay = 0,
  hover3d = false,
  className,
  children 
}) {
  const animations = {
    fade: 'animate-fade-in',
    slide: 'animate-slide-in-right',
    scale: 'animate-scale-in',
    flip: 'animate-flip-in'
  }

  const style = delay ? { animationDelay: `${delay}ms` } : {}

  return (
    <div
      style={style}
      className={clsx(
        'rounded-lg p-6',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'shadow-md hover:shadow-xl',
        animations[animation],
        hover3d && 'transform transition-all duration-300 hover:scale-105 hover:rotate-1',
        !hover3d && 'hover-lift',
        className
      )}
    >
      {children}
    </div>
  )
}

AnimatedCard.propTypes = {
  animation: PropTypes.oneOf(['fade', 'slide', 'scale', 'flip']),
  delay: PropTypes.number,
  hover3d: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
}

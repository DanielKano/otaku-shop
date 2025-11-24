import PropTypes from 'prop-types'
import clsx from 'clsx'

/**
 * StatsCardEnhanced - Card mejorado para mostrar estadísticas con efectos visuales
 * 
 * @param {Object} props
 * @param {string} props.title - Título de la estadística
 * @param {string|number} props.value - Valor principal
 * @param {string} props.icon - Emoji o ícono
 * @param {string} props.trend - Tendencia (up, down, neutral)
 * @param {string} props.trendValue - Valor de la tendencia
 * @param {'purple'|'pink'|'cyan'|'blue'|'green'} props.color - Color del tema
 * @param {boolean} props.neonEffect - Aplicar efecto neon
 * @param {string} props.className - Clases adicionales
 * 
 * @example
 * <StatsCardEnhanced 
 *   title="Ventas Totales" 
 *   value="$45,231" 
 *   icon="💰"
 *   trend="up" 
 *   trendValue="+12.5%"
 *   color="green"
 *   neonEffect
 * />
 */
export default function StatsCardEnhanced({ 
  title,
  value,
  icon,
  trend = 'neutral',
  trendValue,
  color = 'blue',
  neonEffect = false,
  className 
}) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
    pink: 'from-pink-500 to-pink-600 shadow-pink-500/30',
    cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-500/30',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    green: 'from-green-500 to-green-600 shadow-green-500/30'
  }

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500'
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→'
  }

  return (
    <div
      className={clsx(
        'rounded-xl p-6',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'shadow-lg hover:shadow-2xl',
        'transition-all duration-300',
        'hover-lift',
        neonEffect && 'hover:shadow-[0_0_30px_rgba(181,92,255,0.3)]',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={clsx(
          'w-12 h-12 rounded-lg',
          'bg-gradient-to-br',
          colorClasses[color],
          'flex items-center justify-center',
          'text-2xl',
          'shadow-lg'
        )}>
          {icon}
        </div>
        
        {trendValue && (
          <div className={clsx('flex items-center gap-1', trendColors[trend])}>
            <span className="font-bold">{trendIcons[trend]}</span>
            <span className="text-sm font-semibold">{trendValue}</span>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>

      {neonEffect && (
        <div className={clsx(
          'mt-4 h-1 rounded-full',
          'bg-gradient-to-r',
          colorClasses[color]
        )} />
      )}
    </div>
  )
}

StatsCardEnhanced.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.string,
  color: PropTypes.oneOf(['purple', 'pink', 'cyan', 'blue', 'green']),
  neonEffect: PropTypes.bool,
  className: PropTypes.string
}

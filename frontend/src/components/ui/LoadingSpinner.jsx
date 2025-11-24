import PropTypes from 'prop-types'

/**
 * LoadingSpinner - Spinner de carga reutilizable con efecto neon
 * 
 * @param {Object} props
 * @param {string} props.size - Tamaño del spinner: 'sm' | 'md' | 'lg'
 * @param {string} props.text - Texto opcional a mostrar debajo del spinner
 * @param {string} props.color - Color del spinner: 'primary' | 'neon-purple' | 'neon-pink' | 'neon-cyan'
 */
const LoadingSpinner = ({ size = 'md', text, color = 'neon-purple' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  }

  const colorClasses = {
    primary: 'border-gray-200 dark:border-gray-700 border-t-blue-500',
    'neon-purple': 'border-gray-200 dark:border-gray-700 border-t-neon-purple',
    'neon-pink': 'border-gray-200 dark:border-gray-700 border-t-neon-pink',
    'neon-cyan': 'border-gray-200 dark:border-gray-700 border-t-neon-cyan',
  }
  
  return (
    <div className="flex flex-col items-center justify-center p-4 animate-fade-in">
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          rounded-full 
          animate-spin
        `} 
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
          {text}
        </p>
      )}
    </div>
  )
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  text: PropTypes.string,
  color: PropTypes.oneOf(['primary', 'neon-purple', 'neon-pink', 'neon-cyan']),
}

export default LoadingSpinner

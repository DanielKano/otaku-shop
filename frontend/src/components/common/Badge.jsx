import { useState } from 'react'
import Button from '../ui/Button'

const Badge = ({
  label,
  variant = 'default',
  size = 'md',
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const variantClass = {
    default: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white',
    primary: 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100',
    success: 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100',
    error: 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100',
  }[variant]

  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }[size]

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-medium ${variantClass} ${sizeClass} ${className}`}
    >
      {label}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="ml-1 hover:opacity-70 transition"
          aria-label="Cerrar badge"
        >
          ✕
        </button>
      )}
    </span>
  )
}

export default Badge

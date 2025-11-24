import { useState } from 'react'
import { IoClose } from 'react-icons/io5'

const Alert = ({ type = 'info', message, title, dismissible = false, className = '' }) => {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const bgColor = {
    error: 'bg-red-50 dark:bg-red-900/20',
    success: 'bg-green-50 dark:bg-green-900/20',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20',
    info: 'bg-blue-50 dark:bg-blue-900/20',
  }[type]

  const borderColor = {
    error: 'border-red-300 dark:border-red-700',
    success: 'border-green-300 dark:border-green-700',
    warning: 'border-yellow-300 dark:border-yellow-700',
    info: 'border-blue-300 dark:border-blue-700',
  }[type]

  const textColor = {
    error: 'text-red-800 dark:text-red-200',
    success: 'text-green-800 dark:text-green-200',
    warning: 'text-yellow-800 dark:text-yellow-200',
    info: 'text-blue-800 dark:text-blue-200',
  }[type]

  const icon = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  }[type]

  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-lg ${bgColor} ${borderColor} ${textColor} ${className}`}
      role="alert"
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1">
        {title && <h4 className="font-semibold">{title}</h4>}
        <p className="text-sm">{message}</p>
      </div>
      {dismissible && (
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 hover:opacity-70 transition"
          aria-label="Cerrar alerta"
        >
          <IoClose size={20} />
        </button>
      )}
    </div>
  )
}

export default Alert

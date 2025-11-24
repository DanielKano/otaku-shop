import { forwardRef } from 'react'
import clsx from 'clsx'

const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const variantStyles = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg',
      outline: 'border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white',
      ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white',
      // Nuevas variantes con efectos neon
      neon: 'bg-gradient-to-r from-neon-purple to-neon-pink text-white hover:shadow-[0_0_20px_rgba(181,92,255,0.5)] hover:-translate-y-0.5 transition-all',
      'neon-outline': 'border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-gray-900 dark:hover:text-white transition-all',
      glass: 'glass-effect hover:bg-white/10 dark:hover:bg-black/30 border border-white/20 backdrop-blur-md',
      // Variantes adicionales
      gradient: 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all',
      'gradient-outline': 'border-2 border-transparent bg-clip-padding hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 bg-white dark:bg-gray-800 hover:text-white transition-all',
      'animated-neon': 'bg-gradient-to-r from-neon-purple to-neon-pink text-white animate-pulse-neon hover:shadow-[0_0_30px_rgba(181,92,255,0.7)] transition-all',
      glow: 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all',
    }

    const sizeStyles = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'rounded-lg font-medium transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading ? '...' : children}
      </button>
    )
  },
)

Button.displayName = 'Button'

export default Button

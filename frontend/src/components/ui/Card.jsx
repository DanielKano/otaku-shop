import clsx from 'clsx'

const Card = ({ children, title, footer, hover = false, onClick, className }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
        'overflow-hidden',
        hover && 'hover:shadow-lg cursor-pointer transition-shadow',
        className,
      )}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card

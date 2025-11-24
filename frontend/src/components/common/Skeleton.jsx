const Skeleton = ({ width = 'w-full', height = 'h-4', count = 1, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}
        ></div>
      ))}
    </div>
  )
}

export default Skeleton

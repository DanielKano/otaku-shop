const StatsCard = ({ icon, label, value, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700',
    green: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700',
    red: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700',
    purple: 'bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700',
  }

  const trendColor = trend?.percentage >= 0 ? 'text-green-600' : 'text-red-600'

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        {trend && (
          <div className="text-right">
            <p className={`text-sm font-semibold ${trendColor}`}>
              {trend.percentage >= 0 ? '↑' : '↓'} {Math.abs(trend.percentage)}%
            </p>
            <p className="text-xs text-gray-500">{trend.period}</p>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium">{label}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

export default StatsCard

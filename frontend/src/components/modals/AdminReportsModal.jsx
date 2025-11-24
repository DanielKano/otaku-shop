import { useState, useEffect } from 'react'
import services from '../../services'
import Button from '../ui/Button'

const AdminReportsModal = ({ isOpen, onClose }) => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, resolved

  useEffect(() => {
    if (isOpen) {
      fetchReports()
    }
  }, [isOpen])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await services.reportService?.getAll?.()
      // Fallback to generic reports endpoint if specific service not available
      const reportsData = response?.data || []
      setReports(reportsData)
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.status === filter)

  const handleResolve = async (reportId) => {
    try {
      // await services.reportService.resolve(reportId)
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: 'resolved' } : r
      ))
    } catch (error) {
      console.error('Error resolving report:', error)
    }
  }

  const handleDelete = async (reportId) => {
    if (confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      try {
        // await services.reportService.delete(reportId)
        setReports(reports.filter(r => r.id !== reportId))
      } catch (error) {
        console.error('Error deleting report:', error)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reportes y Denuncias
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {['all', 'pending', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendientes' : 'Resueltos'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-600 dark:text-gray-400">Cargando reportes...</p>
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="space-y-4">
              {filteredReports.map(report => (
                <div
                  key={report.id}
                  className={`border rounded-lg p-4 ${
                    report.status === 'pending'
                      ? 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {report.title || 'Sin título'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {report.description || report.message || 'Sin descripción'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'pending'
                        ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                        : 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100'
                    }`}>
                      {report.status === 'pending' ? '⏳ Pendiente' : '✓ Resuelto'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <span>Por: {report.reporter || 'Anónimo'}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(report.createdAt || report.date).toLocaleDateString()}</span>
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleResolve(report.id)}
                      >
                        ✓ Resolver
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(report.id)}
                      >
                        🗑 Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              ✓ No hay reportes en este filtro
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredReports.length} reporte{filteredReports.length !== 1 ? 's' : ''}
          </p>
          <Button 
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminReportsModal

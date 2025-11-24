import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import services from '../../services'

const ReportsModal = ({ isOpen, onClose }) => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, pending, resolved

  useEffect(() => {
    if (isOpen) {
      fetchReports()
    }
  }, [isOpen])

  const fetchReports = async () => {
    setLoading(true)
    try {
      // Intenta primero con endpoint específico de reportes
      try {
        const response = await services.api.get('/reports')
        setReports(response.data || [])
      } catch (err) {
        // Si no existe, muestra mensaje que no hay reportes
        setReports([])
      }
      setError('')
    } catch (err) {
      setError('Error al cargar reportes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolveReport = async (reportId) => {
    try {
      await services.api.put(`/reports/${reportId}/resolve`)
      setReports(reports.map(r =>
        r.id === reportId
          ? { ...r, status: 'RESOLVED' }
          : r
      ))
    } catch (err) {
      console.error('Error al resolver reporte:', err)
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('¿Estás seguro que quieres eliminar este reporte?')) {
      try {
        await services.api.delete(`/reports/${reportId}`)
        setReports(reports.filter(r => r.id !== reportId))
      } catch (err) {
        console.error('Error al eliminar reporte:', err)
      }
    }
  }

  const filteredReports = reports.filter(report => {
    if (filter === 'pending') return report.status === 'PENDING'
    if (filter === 'resolved') return report.status === 'RESOLVED'
    return true
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gestionar Denuncias
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'pending', label: 'Pendientes' },
              { value: 'resolved', label: 'Resueltas' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando denuncias...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {filter === 'all' && 'No hay denuncias'}
                {filter === 'pending' && 'No hay denuncias pendientes'}
                {filter === 'resolved' && 'No hay denuncias resueltas'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map(report => (
                <div
                  key={report.id}
                  className={`border rounded-lg p-4 ${
                    report.status === 'PENDING'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {report.title || `Reporte #${report.id}`}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          report.status === 'PENDING'
                            ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                            : 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                        }`}>
                          {report.status === 'PENDING' ? 'Pendiente' : 'Resuelto'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {report.description || 'Sin descripción'}
                      </p>
                      
                      {report.reportedBy && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Reportado por: <strong>{report.reportedBy}</strong>
                        </p>
                      )}
                      
                      {report.createdAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      {report.status === 'PENDING' && (
                        <button
                          onClick={() => handleResolveReport(report.id)}
                          className="text-sm px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded transition"
                        >
                          Resolver
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky bottom-0">
          <Button
            variant="primary"
            className="w-full"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReportsModal

import { useState } from 'react'
import Button from '../ui/Button'

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  const [activeTab, setActiveTab] = useState('items') // items, tracking, payment

  if (!isOpen || !order) return null

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: '⏳ Pendiente',
      processing: '🔄 En Proceso',
      shipped: '📦 Enviado',
      completed: '✓ Completado',
      cancelled: '✗ Cancelado',
    }
    return texts[status] || status
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Orden #{order.id}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {new Date(order.createdAt || order.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          {['items', 'tracking', 'payment'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm transition ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab === 'items' && '📦 Artículos'}
              {tab === 'tracking' && '📍 Seguimiento'}
              {tab === 'payment' && '💳 Pago'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                <>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name || item.productName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-4 mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span>${(order.total * 0.85).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Envío:</span>
                      <span>${(order.total * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2 font-semibold">
                      <span>Total:</span>
                      <span className="text-lg">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No hay artículos</p>
              )}
            </div>
          )}

          {/* Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status === 'completed' ? '✓' : '→'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {getStatusText(order.status)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.status === 'completed' && 'Tu orden fue completada'}
                    {order.status === 'shipped' && 'Tu orden está en camino'}
                    {order.status === 'processing' && 'Tu orden está siendo preparada'}
                    {order.status === 'pending' && 'Tu orden está pendiente de procesar'}
                  </p>
                </div>
              </div>

              {order.trackingNumber && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Número de Seguimiento</p>
                  <p className="font-mono font-semibold text-gray-900 dark:text-white break-all">
                    {order.trackingNumber}
                  </p>
                </div>
              )}

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">Dirección de Entrega:</p>
                <p className="text-gray-900 dark:text-white">
                  {order.shippingAddress || 'No especificada'}
                </p>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Método de Pago</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {order.paymentMethod || 'Tarjeta de Crédito'}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Estado del Pago</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  order.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {order.paymentStatus === 'paid' ? '✓ Pagado' : '⏳ Pendiente'}
                </span>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-4 border border-blue-200 dark:border-blue-700">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  💡 Puedes descargar tu recibo desde aquí
                </p>
              </div>

              <Button variant="primary" className="w-full">
                📄 Descargar Recibo
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          {order.status === 'pending' && (
            <Button variant="danger" size="sm">
              ✗ Cancelar Orden
            </Button>
          )}
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

export default OrderDetailsModal

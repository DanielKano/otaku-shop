import { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { notificationService } from '../../services/newFeatures';
import { useNotification } from '../../hooks/useNotification';

const NotificationCenter = () => {
  const {
    notifications: wsNotifications,
    unreadCount,
    setUnreadCount,
    markAsRead: wsMarkAsRead,
    removeNotification: wsRemoveNotification
  } = useWebSocket();
  
  const [showPanel, setShowPanel] = useState(false);
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadInitialNotifications();
  }, []);

  const loadInitialNotifications = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count.count);
      
      const unread = await notificationService.getUnreadNotifications();
      setAllNotifications(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadAllNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(0, 20);
      setAllNotifications(response.content || []);
    } catch (error) {
      console.error('Error loading all notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      wsMarkAsRead(notificationId);
      setAllNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showNotification('Todas las notificaciones marcadas como leídas', 'success');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al marcar notificaciones', 'error');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      wsRemoveNotification(notificationId);
      setAllNotifications(prev => prev.filter(n => n.id !== notificationId));
      showNotification('Notificación eliminada', 'success');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al eliminar notificación', 'error');
    }
  };

  const togglePanel = () => {
    setShowPanel(!showPanel);
    if (!showPanel) {
      loadAllNotifications();
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      ORDER_CREATED: '🛒',
      ORDER_SHIPPED: '📦',
      ORDER_DELIVERED: '✅',
      ORDER_CANCELLED: '❌',
      PRODUCT_LOW_STOCK: '⚠️',
      PRODUCT_BACK_IN_STOCK: '🔔',
      NEW_REVIEW: '⭐',
      PRICE_DROP: '💰',
      PAYMENT_SUCCESS: '💳',
      PAYMENT_FAILED: '❌',
      SYSTEM: 'ℹ️'
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={togglePanel}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : allNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                allNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      !notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                            >
                              Marcar como leída
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;

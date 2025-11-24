import { useEffect, useState, useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuth } from './useAuth';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/api/ws';

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token } = useAuth();
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);

  const connect = useCallback(() => {
    if (!user || !token || clientRef.current?.connected) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[WebSocket]', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('✅ WebSocket conectado');
        setConnected(true);

        // Suscribirse a notificaciones del usuario
        subscriptionRef.current = client.subscribe(
          `/user/${user.email}/queue/notifications`,
          (message) => {
            try {
              const notification = JSON.parse(message.body);
              console.log('🔔 Nueva notificación:', notification);
              
              setNotifications(prev => [notification, ...prev]);
              setUnreadCount(prev => prev + 1);

              // Mostrar notificación del navegador si está permitido
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, {
                  body: notification.message,
                  icon: '/favicon.ico',
                  badge: '/favicon.ico'
                });
              }
            } catch (error) {
              console.error('Error procesando notificación:', error);
            }
          }
        );
      },
      onDisconnect: () => {
        console.log('❌ WebSocket desconectado');
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('❌ Error STOMP:', frame);
        setConnected(false);
      }
    });

    client.activate();
    clientRef.current = client;
  }, [user, token]);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    setConnected(false);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Solicitar permiso para notificaciones del navegador
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Conectar cuando el usuario inicia sesión
  useEffect(() => {
    if (user && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, token, connect, disconnect]);

  return {
    connected,
    notifications,
    unreadCount,
    setUnreadCount,
    clearNotifications,
    markAsRead,
    removeNotification,
    connect,
    disconnect
  };
};

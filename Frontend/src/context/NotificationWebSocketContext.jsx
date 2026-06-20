import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL, getAccessToken, notificationAPI } from '../api/api';
import { useAuth } from './AuthContext';
import { NotificationWebSocketContext } from './notificationWebSocketContextValue';
import { useQueryClient } from '@tanstack/react-query';
const TTL_HOURS = 24;

const toTtlExpiresAt = (notification) => {
  if (notification.ttlExpiresAt) return notification.ttlExpiresAt;
  if (!notification.createdAt) return null;
  const createdAt = new Date(notification.createdAt);
  return new Date(createdAt.getTime() + TTL_HOURS * 60 * 60 * 1000).toISOString();
};

const normalizeNotification = (notification) => {
  const id = notification.id ?? notification.notificationId;
  return {
    ...notification,
    id,
    notificationId: notification.notificationId ?? id,
    read: Boolean(notification.read),
    ttlExpiresAt: toTtlExpiresAt(notification),
  };
};

const isVisibleWithinTtl = (notification) => {
  if (!notification.ttlExpiresAt) return true;
  return new Date(notification.ttlExpiresAt).getTime() > Date.now();
};

const mergeById = (current, incoming) => {
  const byId = new Map();
  [...incoming, ...current].forEach((item) => {
    if (item?.id == null) return;
    byId.set(item.id, normalizeNotification({ ...byId.get(item.id), ...item }));
  });
  return Array.from(byId.values()).sort((a, b) => {
    const left = new Date(a.createdAt || 0).getTime();
    const right = new Date(b.createdAt || 0).getTime();
    return right - left;
  });
};

export const NotificationWebSocketProvider = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  const queryClient = useQueryClient();
  const clientRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  const mergeNotifications = useCallback((items) => {
    setNotifications((current) => mergeById(current, items.map(normalizeNotification)));
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    setUnreadCount((current) => Math.max(current - 1, 0));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user?.id) {
      clientRef.current?.deactivate();
      clientRef.current = null;
      queueMicrotask(() => {
        setConnected(false);
        setNotifications([]);
        setUnreadCount(0);
      });
      return;
    }

    let cancelled = false;

    notificationAPI.getUnreadCount()
      .then((response) => {
        if (!cancelled) setUnreadCount(response.data?.unreadCount || 0);
      })
      .catch(() => {
        if (!cancelled) setUnreadCount(0);
      });

    const token = getAccessToken();
    if (!token) return undefined;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL.replace(/\/$/, '')}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        setConnected(true);
        client.subscribe('/user/queue/notifications', (message) => {
          const payload = normalizeNotification(JSON.parse(message.body));
          setNotifications((current) => mergeById(current, [payload]));
          if (typeof payload.unreadCount === 'number') {
            setUnreadCount(payload.unreadCount);
          } else if (!payload.read) {
            setUnreadCount((current) => current + 1);
          }

          // Invalidate appointment related query caches to trigger real-time updates
          queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
          queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
          if (payload.appointmentId) {
            queryClient.invalidateQueries({ queryKey: ["appointment-details", payload.appointmentId] });
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      onStompError: () => setConnected(false),
    });

    clientRef.current = client;
    client.activate();

    return () => {
      cancelled = true;
      client.deactivate();
      if (clientRef.current === client) {
        clientRef.current = null;
      }
      setConnected(false);
    };
  }, [isLoggedIn, user?.id, queryClient]);

  const visibleNotifications = useMemo(
    () => notifications.filter(isVisibleWithinTtl),
    [notifications]
  );

  const value = useMemo(() => ({
    connected,
    notifications,
    visibleNotifications,
    unreadCount,
    mergeNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  }), [
    connected,
    notifications,
    visibleNotifications,
    unreadCount,
    mergeNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  ]);

  return (
    <NotificationWebSocketContext.Provider value={value}>
      {children}
    </NotificationWebSocketContext.Provider>
  );
};

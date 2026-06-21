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

const mergeAppointmentById = (current, updatedAppointment) => {
  if (!Array.isArray(current) || !updatedAppointment?.appointmentId) {
    return current;
  }
  return current.map((item) =>
    item.appointmentId === updatedAppointment.appointmentId ? { ...item, ...updatedAppointment } : item
  );
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
      queryClient.removeQueries({ queryKey: ["receptionist-queue"] });
      queryClient.removeQueries({ queryKey: ["receptionist-appointments"] });
      queryClient.removeQueries({ queryKey: ["receptionist-search"] });
      return;
    }

    let cancelled = false;

    notificationAPI.getUnreadCount()
      .then((response) => {
        if (!cancelled) {
          const initialUnreadCount = response.data?.unreadCount || 0;
          setUnreadCount((current) => Math.max(current, initialUnreadCount));
        }
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
          setUnreadCount((current) => {
            const nextCount = !payload.read ? current + 1 : current;
            return typeof payload.unreadCount === 'number'
              ? Math.max(nextCount, payload.unreadCount)
              : nextCount;
          });

          // Invalidate appointment related query caches to trigger real-time updates
          queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
          queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
          if (payload.appointmentId) {
            queryClient.invalidateQueries({ queryKey: ["appointment-details", payload.appointmentId] });
          }
          queryClient.invalidateQueries({ queryKey: ["notifications-list"] });
          queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
        });

        client.subscribe('/user/queue/receptionist-queue', (message) => {
          const payload = JSON.parse(message.body);
          const queue = Array.isArray(payload?.queue) ? payload.queue : [];
          queryClient.setQueryData(["receptionist-queue"], queue);
          if (payload?.updatedAppointment?.appointmentId) {
            queryClient.setQueriesData({ queryKey: ["receptionist-appointments"] }, (current) =>
              mergeAppointmentById(current, payload.updatedAppointment)
            );
            queryClient.setQueriesData({ queryKey: ["doctor-appointments"] }, (current) =>
              mergeAppointmentById(current, payload.updatedAppointment)
            );
            queryClient.setQueriesData({ queryKey: ["my-appointments"] }, (current) =>
              mergeAppointmentById(current, payload.updatedAppointment)
            );
            queryClient.setQueryData(
              ["appointment-details", payload.updatedAppointment.appointmentId],
              payload.updatedAppointment
            );
          } else {
            queryClient.invalidateQueries({ queryKey: ["receptionist-appointments"] });
            queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
            queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
          }
          queryClient.invalidateQueries({ queryKey: ["receptionist-search"] });
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

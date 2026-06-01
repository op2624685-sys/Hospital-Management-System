import { useContext } from 'react';
import { NotificationWebSocketContext } from '../context/notificationWebSocketContextValue';

export const useNotificationWebSocket = () => {
  const context = useContext(NotificationWebSocketContext);
  if (!context) {
    throw new Error('useNotificationWebSocket must be used within NotificationWebSocketProvider');
  }
  return context;
};

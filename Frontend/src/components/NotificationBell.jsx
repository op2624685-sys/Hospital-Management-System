import React, { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const NotificationBell = ({ inMobileMenu = false, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => (await notificationAPI.getUnreadCount()).data,
    refetchInterval: 30000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-list'],
    queryFn: async () => (await notificationAPI.getList(12)).data,
    enabled: open || inMobileMenu,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open && !inMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, inMobileMenu]);

  const unreadCount = unreadData?.unreadCount || 0;

  const handleNotificationClick = (item) => {
    if (!item.read) {
      markReadMutation.mutate(item.id);
    }
    if (item.appointmentId) {
      if (hasRole('PATIENT')) {
        navigate(`/appointment/${item.appointmentId}`);
      } else if (hasRole('DOCTOR')) {
        navigate('/doctor/booked-details');
      }
    } else if (hasRole('DOCTOR')) {
      navigate('/doctor/booked-details');
    }
    setOpen(false);
    if (onNavigate) onNavigate();
  };

  return (
    <div className={`relative ${inMobileMenu ? 'w-full' : ''}`} ref={panelRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`relative ${inMobileMenu ? 'w-full justify-center py-2.5' : 'p-2'} rounded-xl border border-[var(--border)] bg-[var(--card)]/60 hover:bg-[var(--card)] transition-all flex items-center gap-2`}
        aria-label="Notifications">
        <Bell size={18} style={{ color: 'var(--foreground)' }} />
        {inMobileMenu && <span className="text-sm font-medium">Notifications</span>}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`${inMobileMenu ? 'mt-2 w-full' : 'absolute right-0 mt-2 w-[340px]'} max-h-[420px] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl z-[90]`}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
            <span className="text-sm font-semibold">Notifications</span>
            <button
              className="text-xs font-medium px-2 py-1 rounded-md bg-[var(--muted)] hover:opacity-90"
              onClick={() => markAllMutation.mutate()}>
              Mark all read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
              No notifications yet.
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full text-left px-3 py-2 border-b border-[var(--border)]/50 hover:bg-[var(--muted)]/50 transition ${item.read ? 'opacity-75' : ''}`}>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{item.message}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

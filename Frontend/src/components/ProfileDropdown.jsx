import React, { useRef, useEffect, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileDropdown = () => {
  const { logout, user, profileComplete } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // Get user initials from username
  const getInitials = (username) => {
    if (!username) return 'U';
    const parts = username.split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : username.substring(0, 2).toUpperCase();
  };

  // Generate consistent avatar background color based on username
  const getAvatarColor = (username) => {
    if (!username) return 'var(--primary)';
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF'
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Handle hover on container for desktop
  const handleContainerMouseEnter = () => {
    if (window.innerWidth > 1024) {
      clearTimeout(hoverTimeoutRef.current);
      setIsOpen(true);
    }
  };

  const handleContainerMouseLeave = () => {
    if (window.innerWidth > 1024) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 150); // Small delay to prevent flicker
    }
  };

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => clearTimeout(hoverTimeoutRef.current);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleViewProfile = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  const hasProfilePhoto = user?.profilePhoto;
  const username = user?.username || 'User';
  const initials = getInitials(username);
  const avatarColor = getAvatarColor(username);

  return (
    <div 
      ref={containerRef}
      className='relative'
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}>
      {/* Profile Trigger Button - Avatar Circle */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 px-2 py-1 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 relative'
        style={{
          background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
          border: '2px solid var(--border)'
        }}
        onMouseEnter={() => !profileComplete && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}>
        {/* Avatar Circle */}
        <div
          className='w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm relative'
          style={{
            background: hasProfilePhoto
              ? `url(${user.profilePhoto}) center/cover`
              : avatarColor,
          }}>
          {!hasProfilePhoto && initials}
          
          {/* Red Dot Badge for Incomplete Profile */}
          {!profileComplete && (
            <span 
              className='absolute top-0 right-0 inline-flex h-3 w-3 rounded-full bg-red-500 border-2 border-white'
              title="Complete your profile">
            </span>
          )}
        </div>

        {/* Username (hidden on mobile) */}
        <span
          className='hidden text-sm font-semibold max-w-[120px] truncate'
          style={{ color: 'var(--foreground)' }}>
          {username}
        </span>

        {/* Tooltip */}
        {showTooltip && !profileComplete && (
          <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none'>
            Complete your profile
            <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      <div
        ref={dropdownRef}
        className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl transition-all duration-200 z-40
          ${isOpen
            ? 'opacity-100 pointer-events-auto scale-100'
            : 'opacity-0 pointer-events-none scale-95'
          }`}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          top: 'calc(100% + 8px)',
        }}>
        {/* User Info Section */}
        <div
          className='px-4 py-4 border-b'
          style={{ borderColor: 'var(--border)' }}>
          <div className='flex items-center gap-3'>
            <div
              className='w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 relative'
              style={{
                background: hasProfilePhoto
                  ? `url(${user.profilePhoto}) center/cover`
                  : avatarColor,
              }}>
              {!hasProfilePhoto && initials}
              
              {/* Red Dot Badge in Dropdown */}
              {!profileComplete && (
                <span 
                  className='absolute top-0 right-0 inline-flex h-4 w-4 rounded-full bg-red-500 border-2 border-white'
                  title="Complete your profile">
                </span>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='font-semibold text-sm truncate' style={{ color: 'var(--foreground)' }}>
                {username}
              </p>
              {user?.email && (
                <p className='text-xs truncate' style={{ color: 'var(--muted-foreground)' }}>
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className='py-2'>
          <button
            onClick={handleViewProfile}
            className='w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200'
            style={{ color: 'var(--foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--primary) 8%, transparent)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <User size={16} style={{ color: 'var(--primary)' }} />
            <span>View Profile</span>
          </button>

          <div style={{ height: '1px', background: 'var(--border)', margin: '6px 0' }} />

          <button
            onClick={handleLogout}
            className='w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200'
            style={{ color: '#ef4444' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'color-mix(in srgb, #ef4444 10%, transparent)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;

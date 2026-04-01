import React, { useState, useEffect } from 'react';
import {
  Activity,
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Phone,
  Stethoscope,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorAPI } from '../api/api';

const baseNavLinks = [
  { to: '/', label: 'Home', icon: Activity },
  { to: '/appointment', label: 'Appointment', icon: CalendarDays },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope },
  { to: '/branches', label: 'Branches', icon: Building2 },
  { to: '/services', label: 'Services', icon: UserPlus },
  { to: '/about', label: 'About Us', icon: Users },
  { to: '/contact', label: 'Contact Us', icon: Phone },
];

import SwitchToggleThemeDemo from '@/components/ui/toggle-theme';

const Header = () => {
  const { isLoggedIn, logout, hasRole } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHeadAdmin = hasRole('HEADADMIN');
  const isAdmin = hasRole('ADMIN');
  const isDoctor = hasRole('DOCTOR');
  const isPatient = hasRole('PATIENT');
  const [isHead, setIsHead] = useState(false);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (isDoctor && isLoggedIn) {
        try {
          const { data } = await doctorAPI.getProfile();
          setIsHead(data.isHead);
        } catch (error) {
          console.error("Error fetching doctor profile:", error);
        }
      }
    };
    fetchDoctorProfile();
  }, [isDoctor, isLoggedIn]);

  let navLinks = baseNavLinks;
  if (isHeadAdmin) {
    navLinks = [
      { to: '/', label: 'Home', icon: Activity },
      { to: '/head-admin', label: 'Head Admin Panel', icon: LayoutDashboard },
      { to: '/contact', label: 'Contact Us', icon: Phone },
    ];
  } else if (isAdmin) {
    navLinks = [
      { to: '/', label: 'Home', icon: Activity },
      { to: '/admin', label: 'Admin Panel', icon: LayoutDashboard },
      { to: '/contact', label: 'Contact Us', icon: Phone },
    ];
  } else if (isDoctor) {
    navLinks = [
      { to: '/', label: 'Home', icon: Activity },
      { to: '/doctor/booked-details', label: 'Booked Details', icon: CalendarDays },
      { to: '/doctor/my-department', label: 'Department', icon: Building2 },
      { to: '/contact', label: 'Contact Us', icon: Phone },
    ];
    if (isHead) {
      navLinks.splice(3, 0, { to: '/doctor/department-head', label: 'Dept Head', icon: LayoutDashboard });
    }
  } else if (isPatient) {
    navLinks = [...baseNavLinks, { to: '/my-appointments', label: 'My Appointments', icon: CalendarDays }];
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 rounded-2xl mt-1 p-2
        ${scrolled
          ? 'bg-white/80 dark:bg-black/60 backdrop-blur-xl border-b shadow-md py-3'
          : 'bg-white/40 dark:bg-black/30 backdrop-blur-md py-4'
        }`}>

        <div className='flex justify-between items-center px-4 lg:px-10'>
          <RouterLink to="/" className='group flex items-center gap-2'>
            <div className='w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300' style={{ background: 'linear-gradient(135deg, #644a40, #8b5e52)' }}>
              <Activity size={18} className='text-white' />
            </div>
            <h1 className='text-2xl font-black tracking-tight'>
              <span style={{ color: '#644a40' }}>Medi</span>
              <span className="text-[#8b5e52] dark:text-[#ffe0c2]">Core</span>
            </h1>
          </RouterLink>

          <nav className='hidden lg:flex items-center gap-1 bg-white dark:bg-zinc-900 rounded-2xl p-1 shadow-sm' style={{ border: '1px solid rgba(100,74,64,0.15)' }}>
            {navLinks.map((link) => (
              <RouterLink key={link.to} to={link.to}
                className={`relative px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-1.5`}
                style={isActive(link.to)
                  ? { color: '#644a40', background: 'rgba(100,74,64,0.10)' }
                  : { color: 'var(--foreground)' }}
                onMouseEnter={e => { if (!isActive(link.to)) { e.currentTarget.style.color = '#644a40'; e.currentTarget.style.background = 'rgba(100,74,64,0.07)'; } }}
                onMouseLeave={e => { if (!isActive(link.to)) { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.background = 'transparent'; } }}
              >
                <link.icon size={14} />
                <span>{link.label}</span>
                {link.label === 'Dept Head' && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-white"></span>
                  </span>
                )}
              </RouterLink>
            ))}
          </nav>

          <div className='flex items-center gap-3'>
            <div className="flex items-center bg-white/50 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-border">
              <SwitchToggleThemeDemo />
            </div>
            
            <div className='hidden lg:flex items-center gap-3'>
            {isLoggedIn ? (
              <button
                onClick={logout}
                className='group flex items-center gap-2 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'
                style={{ background: '#3d2b24' }}>
                <LogOut size={15} className='group-hover:rotate-12 transition-transform duration-300' />
                <span>Logout</span>
              </button>
            ) : (
              <RouterLink
                to="/login"
                className='group flex items-center gap-2 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'
                style={{ background: 'linear-gradient(135deg, #644a40, #8b5e52)', boxShadow: '0 4px 16px rgba(100,74,64,0.30)' }}>
                <LogIn size={15} className='group-hover:-rotate-12 transition-transform duration-300' />
                <span>Login</span>
              </RouterLink>
            )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className='lg:hidden p-2 rounded-xl bg-white dark:bg-zinc-800 transition-all duration-300 active:scale-90 shadow-sm'
              style={{ border: '1px solid rgba(100,74,64,0.18)', color: '#644a40' }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed top-0 left-0 w-full h-full z-40 transition-all duration-500
        ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>

        <div
          className='absolute inset-0 bg-black/40 backdrop-blur-sm'
          onClick={() => setMenuOpen(false)}
        ></div>

        <div className={`absolute top-0 right-0 h-full w-72 shadow-2xl transition-transform duration-500
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ background: 'var(--background)' }}>

          <div className='p-6'>
            <div className='flex justify-between items-center mb-8'>
              <h2 className='font-black text-xl'>
                <span style={{ color: '#644a40' }}>Medi</span><span style={{ color: '#8b5e52' }}>Core</span>
              </h2>
              <button
                onClick={() => setMenuOpen(false)}
                className='p-2 rounded-xl transition-all'
                style={{ background: 'rgba(100,74,64,0.08)', color: '#644a40' }}>
                <X size={18} />
              </button>
            </div>

            <nav className='flex flex-col gap-1'>
              {navLinks.map((link, i) => (
                <RouterLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    transitionDelay: menuOpen ? `${i * 50}ms` : '0ms',
                    ...(isActive(link.to)
                      ? { background: 'rgba(100,74,64,0.10)', color: '#644a40', fontWeight: 600 }
                      : { color: '#4a3728' })
                  }}
                  className='flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300'>
                  <link.icon size={15} />
                  {link.label}
                </RouterLink>
              ))}
            </nav>

            <div className='mt-8'>
              {isLoggedIn ? (
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className='w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300'
                  style={{ background: '#3d2b24' }}>
                  <LogOut size={15} />
                  Logout
                </button>
              ) : (
                <RouterLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className='w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300'
                  style={{ background: 'linear-gradient(135deg, #644a40, #8b5e52)' }}>
                  <LogIn size={15} />
                  Login
                </RouterLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;

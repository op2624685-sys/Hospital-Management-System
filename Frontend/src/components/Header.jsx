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

const baseNavLinks = [
  { to: '/', label: 'Home', icon: Activity },
  { to: '/appointment', label: 'Appointment', icon: CalendarDays },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope },
  { to: '/branches', label: 'Branches', icon: Building2 },
  { to: '/departments', label: 'Departments', icon: LayoutDashboard },
  { to: '/services', label: 'Services', icon: UserPlus },
  { to: '/about', label: 'About Us', icon: Users },
  { to: '/contact', label: 'Contact Us', icon: Phone },
];

const Header = () => {
  const { isLoggedIn, logout, hasRole } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHeadAdmin = hasRole('HEADADMIN');
  const isAdmin = hasRole('ADMIN');
  const isDoctor = hasRole('DOCTOR');
  const isPatient = hasRole('PATIENT');

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
      { to: '/contact', label: 'Contact Us', icon: Phone },
    ];
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
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
        ${scrolled
          ? 'bg-white/88 backdrop-blur-xl border-b border-blue-100/70 shadow-[0_8px_32px_rgba(37,99,235,0.08)] py-3'
          : 'bg-white/55 backdrop-blur-md py-4'
        }`}>

        <div className='flex justify-between items-center px-4 lg:px-10'>
          <RouterLink to="/" className='group flex items-center gap-2'>
            <div className='w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300'>
              <Activity size={18} className='text-white' />
            </div>
            <h1 className='text-2xl font-black tracking-tight'>
              <span className='text-blue-600'>Medi</span>
              <span className='text-teal-600'>Core</span>
            </h1>
          </RouterLink>

          <nav className='hidden lg:flex items-center gap-1 bg-white border border-blue-100 rounded-2xl p-1 shadow-sm'>
            {navLinks.map((link) => (
              <RouterLink key={link.to} to={link.to}
                className={`relative px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-1.5
                  ${isActive(link.to)
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
                  }`}>
                <link.icon size={14} />
                <span>{link.label}</span>
              </RouterLink>
            ))}
          </nav>

          <div className='flex items-center gap-3'>
            <div className='hidden lg:flex items-center gap-3'>
            {isLoggedIn ? (
              <button
                onClick={logout}
                className='group flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'>
                <LogOut size={15} className='group-hover:rotate-12 transition-transform duration-300' />
                <span>Logout</span>
              </button>
            ) : (
              <RouterLink
                to="/login"
                className='group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-cyan-200 hover:shadow-lg'>
                <LogIn size={15} className='group-hover:-rotate-12 transition-transform duration-300' />
                <span>Login</span>
              </RouterLink>
            )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className='lg:hidden p-2 rounded-xl bg-white border border-blue-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all duration-300 active:scale-90'>
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

        <div className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl transition-transform duration-500
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

          <div className='p-6'>
            <div className='flex justify-between items-center mb-8'>
              <h2 className='font-black text-xl'>
                <span className='text-blue-600'>Medi</span><span className='text-teal-600'>Core</span>
              </h2>
              <button
                onClick={() => setMenuOpen(false)}
                className='p-2 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all'>
                <X size={18} />
              </button>
            </div>

            <nav className='flex flex-col gap-1'>
              {navLinks.map((link, i) => (
                <RouterLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  style={{ transitionDelay: menuOpen ? `${i * 50}ms` : '0ms' }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                    ${isActive(link.to)
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700'
                    }`}>
                  <link.icon size={15} />
                  {link.label}
                </RouterLink>
              ))}
            </nav>

            <div className='mt-8'>
              {isLoggedIn ? (
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className='w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all duration-300'>
                  <LogOut size={15} />
                  Logout
                </button>
              ) : (
                <RouterLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300'>
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

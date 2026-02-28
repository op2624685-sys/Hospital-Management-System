import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, Menu, X } from 'lucide-react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const baseNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/appointment', label: 'Appointment' },
  { to: '/doctors', label: 'Doctor' },
  { to: '/branches', label: 'Branches' },
  { to: '/departments', label: 'Departments' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
];

const Header = () => {
  const { isLoggedIn, logout, hasRole } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  const navLinks = hasRole('ADMIN')
    ? [...baseNavLinks, { to: '/admin', label: 'Admin Panel' }]
    : baseNavLinks;

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
          ? 'bg-transparent backdrop-blur-md shadow-lg shadow-black/5 py-3'
          : 'bg-transparent py-6'
        }`}>

        <div className='flex justify-between items-center px-10'>
          <RouterLink to="/" className='group flex items-center gap-2'>
            <div className='w-9 h-9 bg-linear-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300'>
              <span className='text-white font-black text-sm'>D</span>
            </div>
            <h1 className='text-2xl font-black tracking-tight'>
              <span className='text-orange-500'>DELTA</span>
              <span className={`transition-colors duration-300 ${scrolled ? 'text-orange-200' : 'text-orange-200'}`}>CARE</span>
            </h1>
          </RouterLink>

          <nav className='hidden lg:flex items-center gap-1'>
            {navLinks.map((link) => (
              <RouterLink
                key={link.to}
                to={link.to}
                onMouseEnter={() => setHoveredLink(link.to)}
                onMouseLeave={() => setHoveredLink(null)}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 group
                  ${isActive(link.to)
                    ? 'text-orange-500'
                    : 'text-zinc-300 hover:text-gray-900'
                  }`}>

                <span className={`absolute inset-0 rounded-xl transition-all duration-300
                  ${hoveredLink === link.to && !isActive(link.to)
                    ? 'bg-orange-50 scale-100 opacity-100'
                    : 'bg-orange-50 scale-95 opacity-0'
                  }`}>
                </span>

                {isActive(link.to) && (
                  <span className='absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full'></span>
                )}

                <span className='relative'>{link.label}</span>
              </RouterLink>
            ))}
          </nav>

          <div className='flex items-center gap-3'>
            {isLoggedIn ? (
              <button
                onClick={logout}
                className='group flex items-center gap-2 relative overflow-hidden bg-gray-900 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'>
                <span className='absolute inset-0 bg-linear-to-r from-rose-500 to-orange-500 translate-x-full group-hover:translate-x-0 transition-transform duration-300'></span>
                <LogOut size={15} className='relative z-10 group-hover:rotate-12 transition-transform duration-300' />
                <span className='relative z-10'>Logout</span>
              </button>
            ) : (
              <RouterLink
                to="/login"
                className='group flex items-center gap-2 relative overflow-hidden bg-linear-to-r from-orange-500 to-rose-500 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-orange-200 hover:shadow-lg'>
                <span className='absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300'></span>
                <LogIn size={15} className='relative z-10 group-hover:-rotate-12 transition-transform duration-300' />
                <span className='relative z-10'>Login</span>
              </RouterLink>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className='lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-orange-50 text-gray-600 hover:text-orange-500 transition-all duration-300 active:scale-90'>
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
                <span className='text-orange-500'>DELTA</span>CARE
              </h2>
              <button
                onClick={() => setMenuOpen(false)}
                className='p-2 rounded-xl bg-gray-100 hover:bg-orange-50 text-gray-600 hover:text-orange-500 transition-all'>
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
                      ? 'bg-orange-50 text-orange-500 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}>
                  {isActive(link.to) && (
                    <span className='w-1.5 h-1.5 bg-orange-500 rounded-full'></span>
                  )}
                  {link.label}
                </RouterLink>
              ))}
            </nav>

            <div className='mt-8'>
              {isLoggedIn ? (
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className='w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold text-sm hover:bg-rose-500 transition-all duration-300'>
                  <LogOut size={15} />
                  Logout
                </button>
              ) : (
                <RouterLink
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className='w-full flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-rose-500 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300'>
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
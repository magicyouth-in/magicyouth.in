import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const links = [
    { name: 'Home',    path: '/'        },
    { name: 'About',   path: '/about'   },
    { name: 'Mission', path: '/mission' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Events',  path: '/events'  },
    { name: 'Join',    path: '/join'    },
    { name: 'Contact', path: '/contact' },
  ];

  const active = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050014]/92 backdrop-blur-xl border-b border-purple-500/20 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'}`}>

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <img
              src="/assets/magic-logo.png"
              alt="MAGIC Youth"
              className="w-9 h-9 rounded-full object-cover border-2 border-purple-400/35 group-hover:border-purple-300/60 transition-colors"
            />
            <span className="font-extrabold text-lg tracking-widest text-white uppercase group-hover:text-purple-300 transition-colors">
              MAGIC YOUTH
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {links.map(link => {
              const isActive = active(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative text-xs font-semibold tracking-wide transition-all py-1 ${
                    isActive ? 'text-purple-300' : 'text-white/75 hover:text-purple-200'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin Pill + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all border ${
                location.pathname.startsWith('/admin')
                  ? 'bg-purple-700 text-white border-purple-500 shadow-purple-glow'
                  : 'text-purple-300 border-purple-400/40 hover:border-purple-300 bg-purple-950/30 hover:bg-purple-900/40'
              }`}
            >
              Admin
            </Link>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden p-2 rounded-xl text-purple-300 hover:bg-purple-900/40 border border-purple-500/25"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#07011a]/98 backdrop-blur-2xl border-b border-purple-900/40 px-5 py-5 space-y-1">
          {links.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active(link.path)
                  ? 'bg-purple-900/40 text-purple-200 border border-purple-500/25'
                  : 'text-white/75 hover:bg-purple-900/20 hover:text-white'
              }`}
            >
              {link.name}
              <ChevronRight className="w-4 h-4 text-purple-400/50" />
            </Link>
          ))}
          <div className="pt-4 border-t border-purple-900/30">
            <Link to="/join" className="w-full block text-center btn-purple-glow font-bold py-3 rounded-full text-sm">
              ✨ Join with Magic Youth
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import magicLogo from '../../assets/magic-logo.png';
import '../../styles/navbar.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const links = [
    { name: 'Home',          path: '/' },
    { name: 'About',         path: '/about' },
    { name: 'Mission',       path: '/mission' },
    { name: 'Teams',         path: '/teams' },
    { name: 'Gallery',       path: '/gallery' },
    { name: 'Events',        path: '/events' },
    { name: 'Documentation', path: '/documentation' },
    { name: 'Join',          path: '/join' },
    { name: 'Contact',       path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <img
            src={magicLogo}
            alt="MAGIC Youth Logo"
            className="navbar-logo"
          />
          <span className="navbar-title">MAGIC YOUTH</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-nav">
          {links.filter(l => l.name !== 'Join').map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions (Join CTA + Mobile Toggle) */}
        <div className="navbar-actions">
          <Link to="/join" className="navbar-join-btn">
            Join MAGIC Youth
          </Link>
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="navbar-mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X style={{ width: 24, height: 24 }} /> : <Menu style={{ width: 24, height: 24 }} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="navbar-mobile-drawer">
          {links.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`navbar-mobile-link ${isActive(link.path) ? 'active' : ''}`}
            >
              <span>{link.name}</span>
              <ChevronRight style={{ width: 16, height: 16 }} />
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

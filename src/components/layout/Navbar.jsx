import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import '../../styles/navbar.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Programs', path: '/programs' },
    { name: 'Chapters', path: '/chapters' },
    { name: 'Impact', path: '/impact' },
    { name: 'Media', path: '/media' },
    { name: 'Stories', path: '/stories' },
    { name: 'Team', path: '/teams' },
    { name: 'Resources', path: '/resources' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* LOGO AREA */}
        <Link to="/" className="navbar-brand">
          <img src="/assets/magic-logo.png" alt="MAGIC Logo" className="navbar-logo" />
          <div className="navbar-title" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-blue)' }}>MAGIC Youth</span>
            <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.05em' }}>A YES-J YOUTH WING</span>
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <nav className="navbar-nav">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="navbar-actions">
          <Link to="/join" className="navbar-join-btn">
            JOIN MAGIC
          </Link>
          <button 
            className="navbar-mobile-toggle" 
            onClick={() => setIsMobileOpen(!isMobileOpen)} 
            aria-label="Toggle mobile menu" 
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileOpen && (
        <div className="navbar-mobile-drawer">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`navbar-mobile-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="navbar-mobile-join">
            <Link to="/join" className="navbar-mobile-join-btn">
              JOIN MAGIC
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

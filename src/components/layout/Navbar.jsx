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

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* LOGO AREA */}
        <Link to="/" className="navbar-brand">
          <img src="/assets/magic-logo.png" alt="MAGIC Logo" className="navbar-logo" />
          <div className="navbar-title" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '1.25rem', color: 'var(--primary-blue)' }}>MAGIC Youth</span>
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <nav className="navbar-nav">
          <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/about" className={`navbar-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
          <Link to="/impact" className={`navbar-link ${location.pathname === '/impact' ? 'active' : ''}`}>Impact</Link>
          <Link to="/media" className={`navbar-link ${location.pathname === '/media' ? 'active' : ''}`}>Media</Link>
          <Link to="/teams" className={`navbar-link ${location.pathname === '/teams' ? 'active' : ''}`}>Team</Link>
          <Link to="/contact" className={`navbar-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="navbar-actions">
          <a href="https://yesj.org/contact?program=magic" target="_blank" rel="noopener noreferrer" className="navbar-join-btn">
            Join MAGIC
          </a>
          <button className="navbar-mobile-toggle" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileOpen && (
        <div className="navbar-mobile-drawer">
          <Link to="/" className={`navbar-mobile-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/about" className={`navbar-mobile-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
          <Link to="/impact" className={`navbar-mobile-link ${location.pathname === '/impact' ? 'active' : ''}`}>Impact</Link>
          <Link to="/media" className={`navbar-mobile-link ${location.pathname === '/media' ? 'active' : ''}`}>Media</Link>
          <Link to="/teams" className={`navbar-mobile-link ${location.pathname === '/teams' ? 'active' : ''}`}>Team</Link>
          <Link to="/contact" className={`navbar-mobile-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
          
          <div className="navbar-mobile-join">
            <a href="https://yesj.org/contact?program=magic" target="_blank" rel="noopener noreferrer" className="navbar-mobile-join-btn">
              Join MAGIC
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

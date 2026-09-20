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

  return (
    <nav className={`my-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="my-nav-container">
        {/* LOGO AREA */}
        <Link to="/" className="my-nav-brand">
          <img src="/assets/magic-logo.png" alt="MAGIC Logo" className="my-brand-logo" />
          <div className="my-brand-text">
            <span className="my-brand-title">MAGIC Youth</span>
            <span className="my-brand-subtitle">A YES-J Student Youth Wing</span>
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="my-nav-links desktop-only">
          <Link to="/" className="my-nav-link">Home</Link>
          <Link to="/about" className="my-nav-link">About</Link>
          <Link to="/impact" className="my-nav-link">Impact</Link>
          <Link to="/media" className="my-nav-link">Media</Link>
          <Link to="/teams" className="my-nav-link">Team</Link>
          <Link to="/contact" className="my-nav-link">Contact</Link>
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="my-nav-actions desktop-only">
          <a href="https://yesj.org/contact?program=magic" target="_blank" rel="noopener noreferrer" className="my-nav-btn-primary">
            Join MAGIC
          </a>
        </div>

        {/* MOBILE TOGGLE */}
        <button className="my-mobile-toggle mobile-only" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileOpen && (
        <div className="my-mobile-drawer mobile-only">
          <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileOpen(false)}>Home</Link>
          <Link to="/about" className="mobile-nav-link" onClick={() => setIsMobileOpen(false)}>About</Link>
          <Link to="/impact" className="mobile-nav-link" onClick={() => setIsMobileOpen(false)}>Impact</Link>
          <Link to="/media" className="mobile-nav-link" onClick={() => setIsMobileOpen(false)}>Media</Link>
          <Link to="/teams" className="mobile-nav-link" onClick={() => setIsMobileOpen(false)}>Team</Link>
          <Link to="/contact" className="mobile-nav-link" onClick={() => setIsMobileOpen(false)}>Contact</Link>
          
          <div className="mobile-nav-actions">
            <a href="https://yesj.org/contact?program=magic" target="_blank" rel="noopener noreferrer" className="my-nav-btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              Join MAGIC
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

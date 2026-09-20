import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* BRAND & NAVIGATION */}
        <div>
          <h3 className="footer-heading" style={{ color: 'white', fontSize: '1.25rem', marginBottom: '1.5rem' }}>MAGIC Youth</h3>
          <ul className="footer-links">
            <li><Link to="/about" className="footer-link">About</Link></li>
            <li><Link to="/impact" className="footer-link">Impact</Link></li>
            <li><Link to="/media" className="footer-link">Media</Link></li>
            <li><Link to="/teams" className="footer-link">Team</Link></li>
            <li><Link to="/contact" className="footer-link">Contact</Link></li>
          </ul>
        </div>
        
        {/* RESOURCES */}
        <div>
          <h3 className="footer-heading">Resources</h3>
          <ul className="footer-links">
            <li><Link to="/documentation" className="footer-link">Documentation</Link></li>
            <li><Link to="/media" className="footer-link">Publications</Link></li>
          </ul>
        </div>

        {/* CONNECT */}
        <div>
          <h3 className="footer-heading">Connect</h3>
          <ul className="footer-links">
            <li><a href="https://yesj.org" target="_blank" rel="noopener noreferrer" className="footer-link">YES-J Official Site</a></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <p style={{ textAlign: 'center' }}>
          © {new Date().getFullYear()} MAGIC Youth.<br/>
          Part of YES-J.
        </p>
        <div>
          <Link to="/admin/login" className="footer-link" style={{ fontSize: '0.75rem', opacity: 0.3, textDecoration: 'none' }}>Admin Login</Link>
        </div>
      </div>
    </footer>
  );
}

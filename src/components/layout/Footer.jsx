import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>MAGIC Youth</h2>
          <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Men and Women Aiming at Greater Initiatives for Change</p>
          <p>A YES-J student youth wing forming young people as agents of conscience, compassion, and commitment.</p>
        </div>
        <div>
          <h3 className="footer-heading">Explore</h3>
          <ul className="footer-links">
            <li><Link to="/" className="footer-link">Home</Link></li>
            <li><Link to="/about" className="footer-link">About</Link></li>
            <li><Link to="/impact" className="footer-link">Impact</Link></li>
            <li><Link to="/media" className="footer-link">Media</Link></li>
            <li><Link to="/teams" className="footer-link">Team</Link></li>
            <li><Link to="/contact" className="footer-link">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="footer-heading">Resources & Connect</h3>
          <ul className="footer-links" style={{ marginBottom: '2rem' }}>
            <li><Link to="/media" className="footer-link">Magazines</Link></li>
            <li><Link to="/media" className="footer-link">Images</Link></li>
            <li><Link to="/documentation" className="footer-link">Documentation</Link></li>
          </ul>
          <ul className="footer-links">
            <li><a href="https://yesj.org" target="_blank" rel="noopener noreferrer" className="footer-link">YES-J Official Site</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MAGIC Youth. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/admin/login" className="footer-link" style={{ fontSize: '0.75rem', opacity: 0.5 }}>Admin Login</Link>
        </div>
      </div>
    </footer>
  );
}

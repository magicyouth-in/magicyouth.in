import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>MAGIC Youth</h2>
          <p>Men & Women Aiming Greater Initiatives for Change. Empowering youth to lead, serve, and create meaningful change in society.</p>
        </div>
        <div>
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/" className="footer-link">Home</Link></li>
            <li><Link to="/about" className="footer-link">About Us</Link></li>
            <li><Link to="/mission" className="footer-link">Mission & Vision</Link></li>
            <li><Link to="/teams" className="footer-link">Teams</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="footer-heading">Get Involved</h3>
          <ul className="footer-links">
            <li><Link to="/events" className="footer-link">Events</Link></li>
            <li><Link to="/gallery" className="footer-link">Gallery</Link></li>
            <li><Link to="/join" className="footer-link">Join MAGIC</Link></li>
            <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MAGIC Youth. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/admin/login" className="footer-link">Admin Portal</Link>
        </div>
      </div>
    </footer>
  );
}

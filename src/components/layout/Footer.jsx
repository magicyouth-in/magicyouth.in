import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, Instagram } from 'lucide-react';
import '../../styles/footer.css';

export default function Footer() {
  const quickLinks = [
    { name: 'Teams',   to: '/teams' },
    { name: 'Gallery', to: '/gallery' },
    { name: 'Events',  to: '/events' },
    { name: 'Contact', to: '/contact' },
  ];

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-columns">
          {/* Brand */}
          <div className="brand-section">
            <Link to="/" className="brand">
              <div className="brand-icon">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="brand-text">
                MAGIC <span className="brand-highlight">YOUTH</span>
              </span>
            </Link>
            <p className="brand-description">
              Men &amp; Women Aiming Greater Initiatives for Change (MAGIC Youth) is a student-led youth organization inspiring leadership, innovation, and community service.
            </p>
            <div className="social-links">
              <a href="https://www.instagram.com/magicyouth" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="MAGIC Youth Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/yesj.offical" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YES-J Official Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://maps.google.com/?q=Youth+Empowering+Center+Jesuits+Vijayawada" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Location">
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="quick-links">
            <h3 className="section-title">Quick Links</h3>
            <ul>
              {quickLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="footer-link">{l.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div className="get-involved">
            <h3 className="section-title">Get Involved</h3>
            <ul>
              <li><Link to="/join" className="footer-link">✨ Join MAGIC Youth</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="footer-link">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* Campus Address */}
          <div className="address-section">
            <h3 className="section-title">Campus Address</h3>
            <ul className="info-list">
              <li className="info-item"><MapPin className="w-4 h-4" />Youth Empowering Center – Jesuits (YES-J), Vijayawada</li>
              <li className="info-item"><Mail className="w-4 h-4" />magicyouth.loyola@gmail.com</li>
              <li className="info-item"><Phone className="w-4 h-4" />+91 ----------</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bottom-bar">
          <p>© {new Date().getFullYear()} MAGIC Youth Organization. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-link">Terms of Service</Link>
            <Link to="/documentation" className="footer-link">Documentation</Link>
            <span style={{ opacity: 0.5 }}>|</span>
            <Link to="/admin/login" className="admin-link">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

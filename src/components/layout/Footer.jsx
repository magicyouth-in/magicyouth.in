import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Instagram } from 'lucide-react';
import '../../styles/footer.css';

export default function Footer() {
  const quickLinks = [
    { name: 'Home',          to: '/' },
    { name: 'About',         to: '/about' },
    { name: 'Mission',       to: '/mission' },
    { name: 'Events',        to: '/events' },
    { name: 'Gallery',       to: '/gallery' },
    { name: 'Teams',         to: '/teams' },
    { name: 'Documentation', to: '/documentation' },
    { name: 'Join',          to: '/join' },
    { name: 'Contact',       to: '/contact' },
  ];

  return (
    <footer className="footer">
      <div className="container-default footer-container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <h2 className="footer-logo">MAGIC YOUTH</h2>
            <p className="footer-tagline">
              Men and Women Aiming Greater Initiative for Change
            </p>
            <p className="footer-subtext">
              A student-led youth organization under YES-J inspiring leadership, innovation, and community service.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links-group">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-list">
              {quickLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="footer-link">{l.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-contact">
            <h3 className="footer-heading">Contact</h3>
            <ul className="footer-list">
              <li className="footer-contact-item">
                <MapPin size={18} />
                <span>YOUTH EMPOWERING CENTER - JESUITS (YES - J)<br/>Vijayawada</span>
              </li>
              <li className="footer-contact-item">
                <Mail size={18} />
                <a href="mailto:magicyouth.loyola@gmail.com" className="footer-link">magicyouth.loyola@gmail.com</a>
              </li>
            </ul>
            <div className="footer-socials">
              <a href="https://instagram.com/yesj.official" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <Instagram size={20} /> @yesj.official
              </a>
              <a href="https://instagram.com/magicyouth.in" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <Instagram size={20} /> @magicyouth.in
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} MAGIC Youth. All rights reserved.
          </p>
          <div className="footer-legal">
            <Link to="/privacy" className="footer-bottom-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-bottom-link">Terms of Service</Link>
            <Link to="/admin/login" className="footer-admin-link">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

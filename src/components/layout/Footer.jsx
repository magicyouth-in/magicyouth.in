import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer" style={{ backgroundColor: '#0B1120', color: '#94A3B8', padding: '4.5rem 1.5rem 2rem', borderTop: '1px solid #1E293B' }}>
      <div className="footer-container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3.5rem' }}>
        
        {/* BRAND & IDENTITY */}
        <div>
          <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 900, marginBottom: '1rem' }}>
            MAGIC Youth
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            Men and Women Aiming at Greater Initiatives for Change.
          </p>
          <div style={{ fontSize: '0.8125rem', color: 'var(--primary-pink)', fontWeight: 700 }}>
            Under YES-J Umbrella
          </div>
        </div>

        {/* EXPLORE */}
        <div>
          <h4 style={{ color: 'white', fontSize: '0.9375rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
            Explore
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li><Link to="/about" className="footer-link">About Us</Link></li>
            <li><Link to="/programs" className="footer-link">Flagship Programs</Link></li>
            <li><Link to="/chapters" className="footer-link">Campus Chapters</Link></li>
            <li><Link to="/impact" className="footer-link">Impact & Events</Link></li>
            <li><Link to="/stories" className="footer-link">Transformation Stories</Link></li>
          </ul>
        </div>
        
        {/* NETWORK & MEDIA */}
        <div>
          <h4 style={{ color: 'white', fontSize: '0.9375rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
            Network
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li><Link to="/teams" className="footer-link">Student Leadership</Link></li>
            <li><Link to="/media" className="footer-link">Photo & Video Gallery</Link></li>
            <li><Link to="/resources" className="footer-link">Resources & Toolkits</Link></li>
            <li><Link to="/join" className="footer-link">Become a Change Agent</Link></li>
            <li><Link to="/contact" className="footer-link">Contact & Inquiries</Link></li>
          </ul>
        </div>

        {/* AFFILIATION */}
        <div>
          <h4 style={{ color: 'white', fontSize: '0.9375rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
            Institutional Base
          </h4>
          <p style={{ color: '#64748B', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            YES-J Central Headquarters<br/>
            Vijayawada, Andhra Pradesh, India
          </p>
          <a href="https://yesj.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 700 }}>
            Visit YES-J Official Site &rarr;
          </a>
        </div>

      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid #1E293B', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: '#64748B' }}>
        <div>
          &copy; {new Date().getFullYear()} MAGIC Youth &bull; Youth Empowerment Services - Jesuits (YES-J).
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/privacy" style={{ color: '#64748B', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: '#64748B', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/admin/login" style={{ color: '#334155', textDecoration: 'none', fontSize: '0.75rem' }}>Admin Login</Link>
        </div>
      </div>
    </footer>
  );
}

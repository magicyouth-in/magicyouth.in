import React from 'react';
import '../styles/about.css';

export default function Terms() {
  return (
    <div>
      <section className="about-hero">
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <span className="about-badge">Legal</span>
          <h1 className="about-title">Terms &amp; <span className="highlight">Conditions</span></h1>
        </div>
      </section>

      <section style={{ padding: '3rem 1.5rem 5rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', backgroundColor: '#F8F7FC', border: '1px solid #E5E7EB', borderRadius: '1.25rem', padding: '2.5rem', fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.7 }}>
          <p style={{ marginBottom: '1.25rem' }}>
            Welcome to the MAGIC Youth Digital Platform. By accessing or using our website and services, you agree to comply with these terms.
          </p>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem' }}>Code of Conduct</h2>
          <p>
            All student members, volunteers, and event attendees are expected to demonstrate respect, integrity, and ethical conduct during all MAGIC Youth initiatives and activities.
          </p>
        </div>
      </section>
    </div>
  );
}

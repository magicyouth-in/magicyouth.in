import React from 'react';
import '../styles/about.css';

export default function Privacy() {
  return (
    <div>
      <section className="about-hero">
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <span className="about-badge">Legal</span>
          <h1 className="about-title">Privacy <span className="highlight">Policy</span></h1>
        </div>
      </section>

      <section style={{ padding: '3rem 1.5rem 5rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', backgroundColor: '#F8F7FC', border: '1px solid #E5E7EB', borderRadius: '1.25rem', padding: '2.5rem', fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.7 }}>
          <p style={{ marginBottom: '1.25rem' }}>
            At MAGIC Youth (Men &amp; Women Aiming Greater Initiatives for Change), we value your privacy and are committed to protecting your personal data.
          </p>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem' }}>Information We Collect</h2>
          <p style={{ marginBottom: '1.25rem' }}>
            We collect information you provide directly, such as name, email address, phone number, academic details, and volunteer application submissions when you fill out forms on our website.
          </p>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem' }}>How We Use Information</h2>
          <p>
            We use your information solely to process volunteer applications, manage event registrations, respond to contact inquiries, and coordinate campus leadership activities.
          </p>
        </div>
      </section>
    </div>
  );
}

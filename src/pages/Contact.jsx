import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import '../styles/home.css';

export default function Contact() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Message sent successfully!');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('Failed to send message.');
      }
    } catch (err) {
      setStatus('An error occurred.');
    }
  };

  return (
    <main className="home-wrapper">
      <section className="page-header-section">
        <div className="page-bg-glow"></div>
        <div className="page-header-content">
          <div className="section-eyebrow">Connect With Us</div>
          <h1 className="page-header-title">Contact MAGIC</h1>
          <p className="page-header-subtitle">
            Get in touch to learn more about our campus initiatives or how to start a MAGIC unit.
          </p>
        </div>
      </section>

      <section className="inner-section bg-light">
        <div className="content-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="section-title" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '1.5rem' }}>Get in Touch</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.125rem', lineHeight: 1.6 }}>
              Whether you want to partner with us, ask a question, or join our movement, we'd love to hear from you.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', flexShrink: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <Mail size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Email Us</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>admin@magicyouth.in</p>
                </div>
              </div>

              {/* Data driven: Only show verified HQ if known. Leaving placeholder structured but generic. */}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', flexShrink: 0, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Headquarters</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>Vijayawada, Andhra Pradesh, India</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Join the Movement</h4>
              <a href="https://yesj.org/contact?program=magic" target="_blank" rel="noopener noreferrer" className="btn-outline">
                YES-J Official Portal <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }} style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-primary)' }}>Send a Message</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Full Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Email Address</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Subject</label>
                <input type="text" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Message</label>
                <textarea required rows="4" value={form.message} onChange={e => setForm({...form, message: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ border: 'none', cursor: 'pointer', width: '100%' }}>Send Message</button>
              {status && <div style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-blue)', marginTop: '0.5rem' }}>{status}</div>}
            </form>
          </motion.div>

        </div>
      </section>
    </main>
  );
}

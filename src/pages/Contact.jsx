import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, ChevronDown, AlertCircle } from 'lucide-react';
import '../styles/about.css';
import '../styles/contact.css';

const faqs = [
  { q: 'How do I join MAGIC Youth?',              a: 'Visit the Join page, complete the volunteer application form, and our coordinators will contact you within 5–7 days.' },
  { q: 'Is membership free?',                     a: 'Yes — MAGIC Youth membership is completely free for students.' },
  { q: 'Which college is MAGIC Youth based at?',  a: 'We are based at Andhra Loyola Institute of Engineering and Technology (ALIET), Vijayawada, Andhra Pradesh.' },
  { q: 'Can students from other colleges join?',  a: 'Our primary membership is for ALIET students, but we welcome collaborations and partnerships with other institutions for specific events.' },
  { q: 'How can I register for an event?',        a: 'Visit the Events page to view upcoming activities and details.' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res  = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.message || 'Failed to send message. Try again.');
      }
    } catch {
      setError('Network error. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* ── CONTACT HERO ─────────────────────────────────────────── */}
      <section className="contact-hero">
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <span className="about-badge">Get in Touch</span>
          <h1 className="about-title">Contact <span className="highlight">MAGIC Youth</span></h1>
          <p className="about-lead">
            Have a question, collaboration proposal, or feedback? Send us a message and our team will get back to you.
          </p>
        </div>
      </section>

      {/* ── CONTACT SECTION ─────────────────────────────────────── */}
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-grid">
            {/* Info Cards */}
            <div>
              <div className="contact-info-card">
                <div className="contact-icon-box">
                  <MapPin style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.25rem' }}>Address</h3>
                  <p style={{ fontSize: '0.84375rem', color: '#4B5563', lineHeight: 1.5 }}>
                    Andhra Loyola Institute of Engineering and Technology (ALIET), Vijayawada — 520 008, AP
                  </p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-icon-box">
                  <Mail style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.25rem' }}>Email</h3>
                  <p style={{ fontSize: '0.84375rem', color: '#4B5563' }}>contact@magicyouth.in</p>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-icon-box">
                  <Phone style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.25rem' }}>Phone</h3>
                  <p style={{ fontSize: '0.84375rem', color: '#4B5563' }}>+91 98765 43210 (Mon – Sat, 9 AM – 6 PM)</p>
                </div>
              </div>

              {/* Map embed */}
              <div style={{ borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid #E5E7EB', height: '240px', marginTop: '1.5rem' }}>
                <iframe
                  title="ALIET Vijayawada Google Maps"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.2974794179373!2d80.64817457583642!3d16.51042738423455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35e54f50000001%3A0x7d6364bfeb83c8ed!2sAndhra%20Loyola%20Institute%2520of%2520Engineering%2520and%252520Technology%2520(ALIET)!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  style={{ width: '100%', height: '100%', border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Form */}
            <div className="contact-form-card">
              {sent ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#5B21B6' }}>
                    <CheckCircle2 style={{ width: 32, height: 32 }} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1F2937' }}>Message Sent!</h3>
                  <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: '0.5rem 0 1.5rem' }}>
                    Thank you, <strong>{form.name}</strong>. Our team will review your message and reply soon.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', subject:'General Inquiry', message:'' }); }}
                    className="btn-primary-purple"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1F2937', margin: 0 }}>Send Us a Message</h2>

                  {error && (
                    <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Your Name *</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} required className="join-input" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Email Address *</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required className="join-input" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Phone</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="join-input" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Subject</label>
                      <select name="subject" value={form.subject} onChange={handleChange} className="join-input">
                        {['General Inquiry','Event Collaboration','Volunteer Information','Media & Press','Other'].map(s =>
                          <option key={s} value={s}>{s}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Message *</label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows="5" required className="join-input" style={{ resize: 'none' }} />
                  </div>

                  <div>
                    <button type="submit" disabled={sending} className="btn-primary-purple" style={{ width: 'auto' }}>
                      <Send style={{ width: 16, height: 16 }} />
                      {sending ? 'Sending…' : 'Send Message'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div style={{ marginTop: '4rem' }}>
            <div className="home-section-header">
              <span className="section-label">Common Queries</span>
              <h2 className="section-title">Frequently Asked Questions</h2>
            </div>

            <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
              {faqs.map((faq, i) => (
                <div key={i} className="faq-card">
                  <button className="faq-header" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{faq.q}</span>
                    <ChevronDown style={{ width: 18, height: 18, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                  </button>
                  {openFaq === i && (
                    <div className="faq-body">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

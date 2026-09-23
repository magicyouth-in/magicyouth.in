import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import '../styles/home.css';

export default function Contact() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', interest: '', message: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Message sent successfully! Our coordination team will get in touch.');
        setForm({ name: '', email: '', phone: '', subject: '', interest: '', message: '' });
      } else {
        setStatus(data.message || 'Failed to send message.');
      }
    } catch (err) {
      setStatus('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="home-wrapper">
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Connect with MAGIC Youth
          </div>
          <h1 className="page-header-title" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.25rem, 4vw, 3rem)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.75rem' }}>
            Let's Turn Student Energy Into Meaningful Action
          </h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
            Whether you are a student, faculty member, institution, community partner, or someone interested in youth-led social change, we'd be glad to hear from you.
          </p>
        </motion.div>
      </section>

      <section className="inner-section" style={{ backgroundColor: 'white', paddingBottom: '4rem' }}>
        <div className="content-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', maxWidth: '1200px', margin: '0 auto', gap: '3.5rem' }}>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Connection Pathways</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>Students</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Interested in joining MAGIC or contributing to campus initiatives?</p>
                </div>
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>Faculty &amp; Institutions</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Interested in establishing a campus chapter or student formation programs?</p>
                </div>
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>Community &amp; Partners</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Interested in social impact collaborations and grassroots youth engagement?</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '0.5rem', backgroundColor: '#F0F9FF', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', flexShrink: 0 }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Central Headquarters</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                    YES-J Centre for Excellence, Andhra Loyola College Campus, Vijayawada, AP - 522 008, India
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '0.5rem', backgroundColor: '#F0F9FF', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', flexShrink: 0 }}>
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Direct Line</h4>
                  <a href="tel:+918686727202" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
                    +91-868-672-7202
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '0.5rem', backgroundColor: '#F0F9FF', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', flexShrink: 0 }}>
                  <Mail size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Email Inquiries</h4>
                  <a href="mailto:admin@magicyouth.in" style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
                    admin@magicyouth.in
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2.5rem', borderRadius: '1rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Send a Message</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Full Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Email Address *</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Phone / WhatsApp</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Institution / Subject</label>
                <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Area of Interest</label>
                <select value={form.interest} onChange={e => setForm({...form, interest: e.target.value})} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                  <option value="">Select an area...</option>
                  <option value="Joining MAGIC">Joining MAGIC</option>
                  <option value="Forming a Campus Unit">Forming a Campus Unit</option>
                  <option value="Community Partnership">Community Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Message *</label>
                <textarea required rows="4" value={form.message} onChange={e => setForm({...form, message: e.target.value})} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical', backgroundColor: 'white' }}></textarea>
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ border: 'none', cursor: 'pointer', width: '100%', padding: '0.85rem', fontWeight: 800 }}>
                {loading ? 'Sending...' : 'Submit Inquiry'}
              </button>
              {status && <div style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-blue)', marginTop: '0.5rem' }}>{status}</div>}
            </form>
          </motion.div>
        </div>
      </section>

      {/* WHAT HAPPENS NEXT TIMELINE */}
      <section style={{ backgroundColor: '#0F172A', padding: '5rem 1.5rem', color: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)' }}>The Process</div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '3.5rem' }}>What Happens Next</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', borderLeft: '2px solid #334155', paddingLeft: '2rem' }}>
            {[
              { num: '01', title: 'Reach Out', desc: 'Submit your inquiry through our platform or direct contact line.' },
              { num: '02', title: 'Connect', desc: 'Our coordination team reviews your request and connects with you directly.' },
              { num: '03', title: 'Collaborate', desc: 'We align on campus initiatives, formation programs, or community partnerships.' },
              { num: '04', title: 'Take Action', desc: 'Students are mobilized to create meaningful grassroots impact.' }
            ].map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-2.65rem', top: '0.25rem', width: '1rem', height: '1rem', backgroundColor: 'var(--primary-blue)', borderRadius: '50%', border: '3px solid #0F172A' }}></div>
                <div style={{ color: 'var(--primary-blue)', fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{step.num}</div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>{step.title}</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

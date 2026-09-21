import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, ArrowRight, ArrowDown } from 'lucide-react';
import '../styles/home.css';

export default function Contact() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
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
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div className="page-header-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Connect with MAGIC Youth
          </div>
          <h1 className="page-header-title" style={{ color: 'var(--text-primary)', fontSize: '3rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Let's Turn Student Energy Into Meaningful Action.
          </h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', marginTop: '1.5rem', fontSize: '1.25rem' }}>
            Whether you are a student, faculty member, institution, community partner, or someone interested in youth-led social change, we'd be glad to hear from you.
          </p>
        </div>
      </section>

      <section className="inner-section" style={{ backgroundColor: 'white', paddingBottom: '2rem' }}>
        <div className="content-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', maxWidth: '1200px', margin: '0 auto', gap: '3rem' }}>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Connection Pathways</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Students</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>Interested in joining MAGIC or contributing to campus initiatives?</p>
                </div>
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Faculty & Institutions</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>Interested in collaboration or student formation programs?</p>
                </div>
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Community & Partners</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', margin: 0 }}>Interested in social impact and grassroots youth engagement?</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '0.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', flexShrink: 0 }}>
                  <Mail size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Email Us</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>admin@magicyouth.in</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '0.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', flexShrink: 0 }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Headquarters</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>Vijayawada, Andhra Pradesh, India</p>
                </div>
              </div>
            </div>
          </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '3rem', borderRadius: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2rem' }}>Send a Message</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Full Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Email Address</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Phone / WhatsApp</label>
                <input type="tel" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Institution / Organization</label>
                <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Area of Interest</label>
                <select value={form.interest || ''} onChange={e => setForm({...form, interest: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white' }}>
                  <option value="">Select an area...</option>
                  <option value="Joining MAGIC">Joining MAGIC</option>
                  <option value="Forming a Campus Unit">Forming a Campus Unit</option>
                  <option value="Community Partnership">Community Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Message</label>
                <textarea required rows="4" value={form.message} onChange={e => setForm({...form, message: e.target.value})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ border: 'none', cursor: 'pointer', width: '100%', padding: '1rem' }}>Submit Inquiry</button>
              {status && <div style={{ textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-blue)', marginTop: '0.5rem' }}>{status}</div>}
            </form>
          </motion.div>
        </div>
      </section>

      {/* WHAT HAPPENS NEXT TIMELINE */}
      <section style={{ backgroundColor: '#0F172A', padding: '6rem 1.5rem', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)' }}>The Process</div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4rem' }}>What Happens Next</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', borderLeft: '2px solid #334155', paddingLeft: '2rem' }}>
            {[
              { num: '01', title: 'Reach Out', desc: 'Submit your inquiry through our platform.' },
              { num: '02', title: 'Connect', desc: 'Our coordination team reviews your request and connects with you.' },
              { num: '03', title: 'Collaborate', desc: 'We align on campus initiatives, formation programs, or community needs.' },
              { num: '04', title: 'Take Action', desc: 'Students are mobilized to create meaningful grassroots impact.' }
            ].map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-2.65rem', top: '0.25rem', width: '1rem', height: '1rem', backgroundColor: 'var(--primary-blue)', borderRadius: '50%', border: '3px solid #0F172A' }}></div>
                <div style={{ color: 'var(--primary-blue)', fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{step.num}</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ color: '#94A3B8', fontSize: '1rem' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* YES-J CTA */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '6rem 1.5rem', textAlign: 'center' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem' }}>MAGIC Youth is part of the wider YES-J movement.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2rem' }}>Have an idea? Start a conversation.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://yesj.org/contact?program=magic" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Explore YES-J <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>
      </section>

    </main>
  );
}

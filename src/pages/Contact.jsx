import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, ChevronDown, AlertCircle } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.09 } })
};

const faqs = [
  { q: 'How do I join MAGIC Youth?',              a: 'Visit the Join page, complete the 7-step volunteer application (Personal, Academic, Skills, Interests, Motivation, Uploads, Review), and our coordinators will contact you within 5–7 days.' },
  { q: 'Is membership free?',                     a: 'Yes — MAGIC Youth membership is entirely free. Our programs are student-funded and volunteer-driven.' },
  { q: 'Which college is MAGIC Youth based at?',  a: 'We are based at Andhra Loyola Institute of Engineering and Technology (ALIET), Vijayawada, Andhra Pradesh.' },
  { q: 'Can students from other colleges join?',  a: 'Our primary membership is for ALIET students, but we welcome collaborations and partnerships with other institutions for specific events.' },
  { q: 'How can I register for an event?',        a: 'Visit the Events page, find the event you\'re interested in, and click "Register Now". Fill in your details and you\'re confirmed.' },
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
      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="page-header px-4">
        <div className="max-w-4xl mx-auto">
          <motion.span custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="inline-block text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3.5 py-1 rounded-full border border-purple-500/25 mb-4"
          >
            Get in Touch
          </motion.span>
          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight"
          >
            Contact <span className="gradient-text-purple">MAGIC Youth</span>
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="mt-4 text-purple-200/65 text-sm max-w-xl mx-auto"
          >
            Have a question, collaboration idea, or just want to say hello? We'd love to hear from you.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── CONTACT INFO ──────────────────────────────────── */}
          <div className="space-y-5">
            {[
              { icon: MapPin, title: 'Address', lines: ['Andhra Loyola Institute of Engineering', 'and Technology (ALIET)', 'Vijayawada — 520 008, Andhra Pradesh'] },
              { icon: Mail,   title: 'Email',   lines: ['contact@magicyouth.in'] },
              { icon: Phone,  title: 'Phone',   lines: ['+91 98765 43210', 'Mon – Sat, 9 AM – 6 PM'] },
            ].map((item, i) => (
              <motion.div key={item.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="dark-glass-card p-6 flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-900/40 border border-purple-500/25 text-purple-300 flex items-center justify-center flex-shrink-0 shadow-purple-glow">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                  {item.lines.map(l => <p key={l} className="text-xs text-purple-200/65 leading-relaxed">{l}</p>)}
                </div>
              </motion.div>
            ))}

            {/* Google Map Card */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="dark-glass-card p-4 overflow-hidden border border-purple-500/20 shadow-2xl h-80"
            >
              <iframe
                title="ALIET Vijayawada Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.2974794179373!2d80.64817457583642!3d16.51042738423455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35e54f50000001%3A0x7d6364bfeb83c8ed!2sAndhra%20Loyola%20Institute%2520of%2520Engineering%2520and%252520Technology%2520(ALIET)!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full rounded-xl border-0 opacity-80 hover:opacity-100 transition duration-300"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>

          {/* ── CONTACT FORM ──────────────────────────────────── */}
          <div className="lg:col-span-2">
            <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="dark-glass-card p-8 border-purple-500/25 h-full flex flex-col justify-between"
            >
              {sent ? (
                <div className="py-14 text-center my-auto">
                  <div className="w-16 h-16 rounded-full bg-purple-900/50 border border-purple-400/35 text-purple-300 flex items-center justify-center mx-auto mb-5 shadow-purple-glow">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                  <p className="text-xs text-purple-200/65 mt-2 max-w-sm mx-auto">
                    Thank you for reaching out, <strong>{form.name}</strong>. Our team will reply to you shortly.
                  </p>
                  <button onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', subject:'General Inquiry', message:'' }); }}
                    className="mt-7 btn-purple-glow text-xs font-bold px-7 py-2.5 rounded-full">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-white mb-2">Send Us a Message</h2>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-300 mb-1">Your Name *</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} required
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-300 mb-1">Email Address *</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} required
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-300 mb-1">Phone</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-purple-300 mb-1">Subject</label>
                      <select name="subject" value={form.subject} onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none">
                        {['General Inquiry','Event Collaboration','Volunteer Information','Media & Press','Other'].map(s =>
                          <option key={s} value={s}>{s}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-purple-300 mb-1">Message *</label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows="5" required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs resize-none outline-none" />
                  </div>

                  <button type="submit" disabled={sending}
                    className="btn-purple-glow font-bold px-8 py-3 rounded-full text-sm inline-flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── FAQ ─────────────────────────────────────────────────── */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="dark-glass-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-white text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-purple-400 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-xs text-purple-200/65 leading-relaxed border-t border-purple-900/30 pt-4">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

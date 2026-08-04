import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Search, Users, X, CheckCircle2, Filter } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] } })
};

const STATUS_TABS = [
  { key: 'all',       label: 'All'        },
  { key: 'upcoming',  label: 'Upcoming'   },
  { key: 'ongoing',   label: 'Ongoing'    },
  { key: 'completed', label: 'Completed'  },
];

const CATEGORY_TABS = [
  'All Categories',
  'Cultural',
  'Sports & Chess',
  'Technical',
  'Social Outreach',
  'Leadership',
  'Programs',
];

export default function Events() {
  const [events,     setEvents]     = useState([]);
  const [status,     setStatus]     = useState('all');
  const [category,   setCategory]   = useState('All Categories');
  const [query,      setQuery]       = useState('');
  const [modal,      setModal]       = useState(null);
  const [submitted,  setSubmitted]   = useState(false);
  const [submitting, setSubmitting]  = useState(false);
  const [regForm,    setRegForm]     = useState({ name: '', email: '', phone: '', rollNo: '' });

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(d => { if (d.success) setEvents(d.data || []); })
      .catch(() => {});
  }, []);

  const filtered = events.filter(e => {
    const matchStatus   = status === 'all'              || e.status === status;
    const matchCategory = category === 'All Categories' || e.category === category;
    const q             = query.toLowerCase();
    const matchQ        = !q
      || e.title?.toLowerCase().includes(q)
      || e.description?.toLowerCase().includes(q)
      || e.venue?.toLowerCase().includes(q);
    return matchStatus && matchCategory && matchQ;
  });

  const openModal = (evt) => {
    setModal(evt);
    setSubmitted(false);
    setRegForm({ name: '', email: '', phone: '', rollNo: '' });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...regForm, eventId: modal._id, eventName: modal.title }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const StatusBadge = ({ s }) => (
    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
      s === 'upcoming'  ? 'badge-upcoming'  :
      s === 'ongoing'   ? 'badge-ongoing'   :
                          'badge-completed'
    }`}>{s}</span>
  );

  return (
    <div>

      {/* ── PAGE HERO ─────────────────────────────────────────────── */}
      <div className="page-header px-4">
        <div className="max-w-4xl mx-auto">
          <motion.span custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="inline-block text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3.5 py-1 rounded-full border border-purple-500/25 mb-4"
          >
            All Activities & Programs
          </motion.span>
          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight"
          >
            MAGIC Youth <span className="gradient-text-purple">Events</span>
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="mt-4 text-purple-200/60 text-sm max-w-2xl mx-auto leading-relaxed"
          >
            Flagship chess championships, cultural festivals, technical workshops, social impact
            campaigns, leadership programs — all in one place.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── SEARCH + STATUS FILTER BAR ─────────────────────────── */}
        <div className="dark-glass-card p-5 mb-6 space-y-4">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2">
              {STATUS_TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setStatus(t.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    status === t.key
                      ? 'btn-purple-glow text-white'
                      : 'bg-purple-950/40 text-purple-300/70 hover:text-white hover:bg-purple-900/30 border border-purple-500/20'
                  }`}
                >
                  {t.label}
                  {t.key !== 'all' && events.filter(e => e.status === t.key).length > 0 && (
                    <span className="ml-1.5 text-[9px] bg-purple-800/60 text-purple-200 px-1.5 py-0.5 rounded-full">
                      {events.filter(e => e.status === t.key).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-purple-400/60 absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search events & programs…"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950/80 border border-purple-500/20 text-white placeholder-purple-300/30"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-900/30">
            <span className="text-[10px] font-bold text-purple-400/60 uppercase tracking-wider self-center mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {CATEGORY_TABS.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  category === c
                    ? 'bg-purple-700/70 text-white border border-purple-400/40'
                    : 'bg-purple-950/40 text-purple-300/60 border border-purple-500/15 hover:border-purple-400/30 hover:text-purple-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

        </div>

        {/* ── RESULTS COUNT ─────────────────────────────────────────── */}
        <p className="text-xs text-purple-300/40 mb-6 font-medium">
          Showing {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
          {status !== 'all' ? ` · ${status}` : ''}
          {category !== 'All Categories' ? ` · ${category}` : ''}
          {query ? ` · "${query}"` : ''}
        </p>

        {/* ── EVENT CARDS ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((evt, i) => (
                <motion.div
                  key={evt._id}
                  layout
                  custom={i % 6}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="dark-glass-card overflow-hidden flex flex-col group"
                >
                  {/* Cover Image */}
                  <div className="aspect-video bg-purple-950/40 relative overflow-hidden">
                    {evt.posterImage ? (
                      <img
                        src={`/uploads/events/${evt.posterImage}`}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-purple-500/20">
                          <Calendar className="w-14 h-14 mx-auto mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {evt.category || 'MAGIC Youth'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Status badge overlay */}
                    <div className="absolute top-3 left-3">
                      <StatusBadge s={evt.status} />
                    </div>

                    {/* Academic year / category */}
                    {(evt.academicYear || evt.category) && (
                      <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-purple-300 text-[9px] font-bold px-2 py-0.5 rounded-md border border-purple-500/20">
                        {evt.category || evt.academicYear}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs font-semibold text-purple-400 mb-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        📅 {evt.date
                          ? new Date(evt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'TBA'}
                      </span>
                      {evt.participants && (
                        <span className="flex items-center gap-1 text-purple-300/50">
                          <Users className="w-3 h-3" /> {evt.participants}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 leading-snug">{evt.title}</h3>
                    <p className="text-xs text-purple-200/55 leading-relaxed line-clamp-3 flex-1">
                      {evt.description || 'An initiative organized by MAGIC Youth for students and the community.'}
                    </p>

                    {/* Card Footer */}
                    <div className="mt-5 pt-4 border-t border-purple-900/30 flex items-center justify-between">
                      <span className="text-[11px] text-purple-300/45 flex items-center gap-1 truncate max-w-[160px]">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-purple-400/50" />
                        {evt.venue || 'ALIET Campus'}
                      </span>
                      <button
                        onClick={() => openModal(evt)}
                        className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
                          evt.status === 'upcoming'
                            ? 'btn-purple-glow border border-purple-400/20'
                            : 'btn-ghost'
                        }`}
                      >
                        {evt.status === 'upcoming' ? 'Register Now' : 'View Details'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-3 text-center py-28"
              >
                <Calendar className="w-12 h-12 mx-auto mb-4 text-purple-500/20" />
                <p className="text-purple-300/40 text-sm">No events found matching your search or filter.</p>
                <button
                  onClick={() => { setStatus('all'); setCategory('All Categories'); setQuery(''); }}
                  className="mt-4 text-xs font-bold text-purple-400 hover:text-purple-200 underline underline-offset-2"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ── REGISTRATION / DETAIL MODAL ──────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={e => { if (e.target === e.currentTarget) setModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="dark-glass-card max-w-lg w-full p-7 relative shadow-2xl border-purple-500/30 my-8"
            >
              <button
                onClick={() => setModal(null)}
                className="absolute top-4 right-4 text-purple-400/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-purple-900/50 border border-purple-400/30 text-purple-300 flex items-center justify-center mx-auto mb-5 shadow-purple-glow">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {modal.status === 'upcoming' ? 'Registration Confirmed!' : 'Details Viewed'}
                  </h3>
                  <p className="text-xs text-purple-200/60 mt-2 max-w-xs mx-auto leading-relaxed">
                    {modal.status === 'upcoming'
                      ? `You are registered for "${modal.title}". A confirmation will be sent to your email.`
                      : `Thank you for viewing details for "${modal.title}".`}
                  </p>
                  <button onClick={() => setModal(null)} className="mt-7 btn-purple-glow text-xs font-bold px-7 py-2.5 rounded-full">
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Event Info */}
                  <div>
                    <div className="mb-1">
                      <StatusBadge s={modal.status} />
                    </div>
                    <h3 className="font-bold text-xl text-white mt-2 leading-snug">{modal.title}</h3>
                    <p className="text-xs text-purple-300/50 mt-1">
                      📅 {modal.date ? new Date(modal.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBA'}
                      {modal.venue && <span> &nbsp;·&nbsp; 📍 {modal.venue}</span>}
                    </p>
                  </div>

                  {modal.description && (
                    <p className="text-xs text-purple-200/60 leading-relaxed bg-purple-950/50 rounded-xl p-4 border border-purple-500/15">
                      {modal.description}
                    </p>
                  )}

                  {/* Registration form for upcoming events */}
                  {modal.status === 'upcoming' ? (
                    <form onSubmit={handleRegister} className="space-y-3">
                      <p className="text-xs font-semibold text-purple-300 border-b border-purple-900/40 pb-2">
                        Fill in your details to reserve your slot:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-purple-300 mb-1">Full Name *</label>
                          <input type="text" required value={regForm.name}
                            onChange={e => setRegForm(f => ({...f, name: e.target.value}))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-purple-500/20 text-white text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-purple-300 mb-1">Email *</label>
                          <input type="email" required value={regForm.email}
                            onChange={e => setRegForm(f => ({...f, email: e.target.value}))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-purple-500/20 text-white text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-purple-300 mb-1">Phone *</label>
                          <input type="tel" required value={regForm.phone}
                            onChange={e => setRegForm(f => ({...f, phone: e.target.value}))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-purple-500/20 text-white text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-purple-300 mb-1">Roll No / ID</label>
                          <input type="text" value={regForm.rollNo}
                            onChange={e => setRegForm(f => ({...f, rollNo: e.target.value}))}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-purple-500/20 text-white text-xs" />
                        </div>
                      </div>
                      <button type="submit" disabled={submitting}
                        className="w-full btn-purple-glow font-bold text-sm py-3 rounded-full">
                        {submitting ? 'Processing…' : '✓ Confirm Registration'}
                      </button>
                    </form>
                  ) : (
                    <button type="button" onClick={() => setModal(null)}
                      className="w-full btn-ghost font-bold text-sm py-3 rounded-full">
                      Close
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

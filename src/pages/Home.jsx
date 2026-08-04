import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, HeartHandshake, Globe, Award, Sparkles,
  ShieldCheck, Target, Compass, ChevronRight, Star,
  Quote, Image as ImageIcon, ArrowRight
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, delay: i * 0.11, ease: [0.16, 1, 0.3, 1] }
  })
};

const values = [
  { title: 'Integrity & Transparency', desc: 'Honesty and accountability in every initiative we lead.', icon: ShieldCheck },
  { title: 'Youth Leadership',         desc: 'Nurturing student decision-making and self-organizing capacity.', icon: Award },
  { title: 'Compassionate Service',    desc: 'Dedicated to uplifting communities through collective volunteering.', icon: HeartHandshake },
  { title: 'Continuous Innovation',    desc: 'Fostering creative approaches to student engagement.', icon: Sparkles },
  { title: 'Community First',          desc: 'People-centred programs that create real, lasting impact.', icon: Globe },
  { title: 'Mission-Driven Action',    desc: 'Every effort connects directly to our purpose and vision.', icon: Target },
];

const reasons = [
  { title: 'Build Real Leadership',   desc: 'Step into organizing, managing, and leading programs that impact hundreds of students.' },
  { title: 'Expand Your Network',     desc: 'Connect with like-minded peers, alumni, faculty mentors, and community leaders.' },
  { title: 'Earn Verified Certificates', desc: 'Receive officially verified volunteering and participation certificates for every event.' },
  { title: 'Develop Diverse Skills',  desc: 'From public speaking to event logistics — grow skills that define your career.' },
];

const testimonials = [
  {
    name: 'Sandeep Chenupati',
    role: 'Student Coordinator (ALIET)',
    quote: 'Being a part of MAGIC Youth has completely changed my perspective on student leadership. Leading state-level tournaments gave me immense confidence.'
  },
  {
    name: 'Dr. K. Srinivas',
    role: 'Faculty Mentor',
    quote: 'The dedication of these students is exemplary. They bridge the gap between academic education and societal outreach effortlessly.'
  },
  {
    name: 'Anjali Mary',
    role: 'Social Media Lead',
    quote: 'MAGIC Youth is not just a club, it is a family of change-makers. I got to practice real-world project execution with absolute autonomy.'
  }
];

export default function Home() {
  const [team, setTeam] = useState([]);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    // Fetch team (limit to top 4)
    fetch('/api/team')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setTeam(d.data.slice(0, 4));
        }
      })
      .catch(() => {});

    // Fetch gallery preview (limit to 6)
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setGallery(d.data.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[750px] h-[750px] rounded-full bg-purple-700/10 blur-[130px]" />
        </div>

        {/* MAGIC Logo */}
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="mb-8 max-w-[260px] sm:max-w-[360px]"
        >
          <img
            src="/assets/magic.png"
            alt="MAGIC Youth Logo"
            className="w-full h-auto drop-shadow-[0_0_70px_rgba(168,85,247,0.38)]"
          />
        </motion.div>

        <motion.h1
          custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl"
        >
          Experience the <span className="gradient-text-purple">Taste of Magic</span>
        </motion.h1>

        <motion.p
          custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="mt-5 text-base sm:text-lg text-white/65 max-w-2xl leading-relaxed"
        >
          Join us and be part of a creative youth movement that changes lifestyles
          through innovation, events, and passion.
        </motion.p>

        <motion.div
          custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/join" className="btn-purple-glow inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full text-sm animate-pulse">
            Join with Magic Youth
          </Link>
          <Link to="/about" className="btn-ghost inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-full text-sm">
            Learn More <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div
          custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-purple-400/40 text-[11px]"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-purple-500/35 to-transparent" />
          <span>Scroll to explore</span>
        </motion.div>
      </section>

      {/* ── IMPACT STATS ───────────────────────────────────── */}
      <section className="section-divider py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: Users,         label: 'Active Members',   value: '250+' },
              { icon: Globe,         label: 'Events Organized', value: '45+'  },
              { icon: HeartHandshake,label: 'Volunteers',       value: '500+' },
              { icon: Award,         label: 'Community Drives', value: '18+'  },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="dark-glass-card p-6 text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-900/40 border border-purple-500/20 text-purple-300 flex items-center justify-center mx-auto mb-3 shadow-purple-glow">
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-[11px] font-medium text-purple-300/60 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT PREVIEW ──────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/20">
              About MAGIC Youth
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 leading-snug tracking-tight">
              Making A Greater Impact<br className="hidden sm:block" /> in Communities
            </h2>
            <p className="mt-5 text-purple-200/65 text-sm leading-relaxed">
              MAGIC Youth — <em>Men & Women Aiming Greater Initiatives for Change</em> — is a student-led nonprofit
              organization founded at Andhra Loyola Institute of Engineering and Technology, Vijayawada.
            </p>
            <p className="mt-3 text-purple-200/65 text-sm leading-relaxed">
              We empower youth through leadership development, community service, skill-building workshops,
              and social awareness campaigns across our campus and surrounding communities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/about" className="btn-purple-glow inline-flex items-center gap-2 font-bold px-6 py-2.5 rounded-full text-sm">
                Learn More About Us <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: 'Founded', val: '2022', sub: 'ALIET Campus, Vijayawada' },
              { label: 'Mission', val: 'Empower', sub: 'Through leadership & service' },
              { label: 'Community', val: 'First', sub: 'People-centered programs' },
              { label: 'Impact', val: 'Real', sub: '500+ lives touched annually' },
            ].map(item => (
              <div key={item.label} className="dark-glass-card p-5 text-center">
                <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">{item.label}</div>
                <div className="text-2xl font-extrabold text-white mt-1">{item.val}</div>
                <div className="text-[11px] text-purple-300/50 mt-0.5">{item.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── VISION PREVIEW & MISSION PREVIEW ───────────────── */}
      <section className="section-divider py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/20">
              Our Vision & Mission
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
              Driving Change & Purpose
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="dark-glass-card p-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-900/40 border border-purple-500/20 text-purple-300 flex items-center justify-center mb-6 shadow-purple-glow">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Our Vision</h3>
              <p className="text-purple-200/65 text-sm leading-relaxed mb-6">
                To cultivate a vibrant generation of empathetic, skilled, and socially conscious youth who lead
                initiatives that transform their communities and inspire meaningful progress.
              </p>
              <Link to="/mission" className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-250 transition-colors border-t border-purple-900/30 pt-4 w-full">
                Read Full Vision <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="dark-glass-card p-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-900/40 border border-purple-500/20 text-purple-300 flex items-center justify-center mb-6 shadow-purple-glow">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
              <p className="text-purple-200/65 text-sm leading-relaxed mb-6">
                To empower students through a collaborative platform for leadership development, community
                volunteering, technical and cultural workshops, and social campaigns.
              </p>
              <Link to="/mission" className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-250 transition-colors border-t border-purple-900/30 pt-4 w-full">
                Read Full Mission <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/20">
            Our Foundation
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
            Core Values
          </h2>
          <p className="mt-3 text-purple-200/60 text-sm">
            The principles that guide every decision, event, and community interaction we make.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="dark-glass-card p-7"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/20 text-purple-300 flex items-center justify-center mb-4 shadow-purple-glow">
                <v.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base mb-2">{v.title}</h3>
              <p className="text-xs text-purple-200/60 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHY JOIN MAGIC YOUTH ───────────────────────────── */}
      <section className="section-divider py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/20">
              Volunteer With Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
              Why Join MAGIC Youth?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="dark-glass-card p-7 flex items-start gap-5"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0 shadow-purple-glow mt-0.5">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1.5">{r.title}</h3>
                  <p className="text-xs text-purple-200/60 leading-relaxed">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP PREVIEW ─────────────────────────────── */}
      {team.length > 0 && (
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/20">
                Youth Leadership
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
                Our Student Coordinators
              </h2>
            </div>
            <Link to="/about" className="mt-4 md:mt-0 text-xs font-bold text-purple-450 hover:text-purple-300 transition-colors inline-flex items-center gap-1">
              View Leadership Team <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {team.map((m, i) => (
              <motion.div
                key={m._id}
                custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="dark-glass-card p-5 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-purple-950/60 mx-auto mb-3 overflow-hidden border-2 border-purple-500/35 shadow-purple-glow">
                  {m.photo ? (
                    <img src={`/uploads/team/${m.photo}`} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-purple-200">{m.name[0]}</div>
                  )}
                </div>
                <h3 className="font-bold text-white text-sm leading-tight">{m.name}</h3>
                <p className="text-[10px] text-purple-400 font-semibold mt-0.5">{m.position || 'Coordinator'}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── GALLERY PREVIEW ────────────────────────────────── */}
      {gallery.length > 0 && (
        <section className="section-divider py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/20">
                  Visual Memories
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
                  Gallery Highlights
                </h2>
              </div>
              <Link to="/gallery" className="mt-4 md:mt-0 text-xs font-bold text-purple-450 hover:text-purple-300 transition-colors inline-flex items-center gap-1">
                View Full Gallery <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((photo, i) => (
                <div key={photo._id || i} className="aspect-square rounded-2xl overflow-hidden border border-purple-500/15 hover:border-purple-400/40 transition-all hover:scale-[1.02] cursor-pointer">
                  <img src={`/uploads/gallery/${photo.filename}`} alt={photo.eventName} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ───────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/20">
            Voices of Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
            What People Say
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              custom={idx} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="dark-glass-card p-8 flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-purple-500/35 mb-4" />
                <p className="text-xs text-purple-200/75 leading-relaxed italic">"{t.quote}"</p>
              </div>
              <div className="mt-6 pt-4 border-t border-purple-900/30 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-950 border border-purple-500/20 flex items-center justify-center font-bold text-xs text-purple-300">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{t.name}</h4>
                  <p className="text-[10px] text-purple-400/80">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── JOIN CTA ───────────────────────────────────────── */}
      <section className="py-20 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="dark-glass-card p-12 sm:p-16 relative overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-80 h-80 rounded-full bg-purple-600/20 blur-[80px]" />
          </div>
          <div className="relative">
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-4 opacity-70" />
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Ready to Make an Impact?
            </h2>
            <p className="text-purple-200/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
              Join MAGIC Youth and become part of a student-led organization making a real change in community service and leadership.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/join" className="btn-purple-glow font-bold px-9 py-3.5 rounded-full text-sm">
                ✨ Join MAGIC Youth
              </Link>
              <Link to="/contact" className="btn-ghost font-semibold px-9 py-3.5 rounded-full text-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

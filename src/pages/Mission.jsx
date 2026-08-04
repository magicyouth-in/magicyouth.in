import React from 'react';
import { motion } from 'framer-motion';
import { Target, Compass, Award, ShieldCheck, Heart, Sparkles, Flame, CheckCircle, TrendingUp } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } })
};

export default function Mission() {
  const values = [
    { title: 'Integrity & Transparency', desc: 'Operating with honesty and accountability in every community initiative we lead.', icon: ShieldCheck },
    { title: 'Youth-Led Governance',     desc: 'Nurturing student autonomy, decision-making, and self-organizing capacity.',     icon: Award },
    { title: 'Compassionate Service',    desc: 'Dedicated to uplifting underserved communities through collective volunteering.', icon: Heart },
    { title: 'Continuous Innovation',    desc: 'Fostering creative approaches to student engagement and social awareness.',        icon: Sparkles },
  ];

  const objectives = [
    { title: 'Youth Governance', desc: 'Promote student-led committees, event organizing, budget management, and transparent leadership.' },
    { title: 'Social Outreach', desc: 'Execute multi-campus blood donation drives, educational volunteer classes, and sustainability drives.' },
    { title: 'Skill Development', desc: 'Conduct state-level chess championships, code-a-thons, and public speaking workshops.' },
    { title: 'Social Awareness Campaigns', desc: 'Run campus programs for mental health advocacy, traffic safety, and digital literacy.' }
  ];

  const futureGoals = [
    { title: 'Regional Expansion', desc: 'Establishing MAGIC Youth student chapters across multiple Jesuit and non-Jesuit engineering colleges in Andhra Pradesh.' },
    { title: 'Corporate Skill Partnerships', desc: 'Partnering with tech firms and skill portals to provide certified career training for our active volunteer force.' },
    { title: 'Structured Mentorship Schemes', desc: 'Connecting senior MAGIC Youth alumni with current members for career guidance and internship opportunities.' },
    { title: 'Digital Social Platform scaling', desc: 'Upgrading our digital portal to track volunteer service hours and issue tamper-proof digital certificates.' }
  ];

  return (
    <div>
      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="page-header px-4">
        <div className="max-w-4xl mx-auto">
          <motion.span custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="inline-block text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3.5 py-1 rounded-full border border-purple-500/25 mb-4"
          >
            Our Purpose
          </motion.span>
          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight"
          >
            Mission & <span className="gradient-text-purple">Vision</span>
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="mt-4 text-purple-200/65 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Men & Women Aiming Greater Initiatives for Change. Discover the core values, objectives, and future roadmaps that define us.
          </motion.p>
        </div>
      </div>

      {/* ── VISION & MISSION SPLIT ──────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="dark-glass-card p-10 border-purple-500/20"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-500/25 text-purple-300 flex items-center justify-center mb-6 shadow-purple-glow">
              <Compass className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
            <p className="text-purple-200/75 text-sm leading-relaxed">
              To cultivate a vibrant generation of empathetic, skilled, and socially conscious young people who
              actively lead initiatives that transform society and inspire meaningful progress across campuses,
              cities, and beyond.
            </p>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="dark-glass-card p-10 border-purple-500/20"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-500/25 text-purple-300 flex items-center justify-center mb-6 shadow-purple-glow">
              <Target className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-purple-200/75 text-sm leading-relaxed">
              To empower students with a collaborative platform for leadership development, community volunteering,
              technical and cultural workshops, and impactful social awareness campaigns — building character and
              capability in equal measure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── OBJECTIVES ──────────────────────────────────────────── */}
      <section className="section-divider py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/25">
              Action Plan
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">Core Objectives</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {objectives.map((item, idx) => (
              <div key={idx} className="dark-glass-card p-6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0 shadow-purple-glow">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-purple-200/70 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUTURE GOALS ────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-1 sticky top-28">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/25 inline-block">
              Roadmap
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-4 tracking-tight">Future Goals</h2>
            <p className="text-purple-200/60 text-xs leading-relaxed mt-4">
              Here is what MAGIC Youth is aiming to build as we scale our operations and reach wider student circles.
            </p>
            <div className="w-20 h-20 rounded-2xl bg-purple-950/60 border border-purple-500/25 flex items-center justify-center text-purple-300 shadow-purple-glow mt-8">
              <TrendingUp className="w-10 h-10 animate-pulse" />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            {futureGoals.map((goal, idx) => (
              <div key={idx} className="dark-glass-card p-8 border-l-4 border-l-purple-500">
                <h4 className="font-bold text-white text-sm mb-2">{goal.title}</h4>
                <p className="text-purple-200/65 text-xs leading-relaxed">{goal.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ─────────────────────────────────────────── */}
      <section className="section-divider py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/25">
              Guiding Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={v.title} className="dark-glass-card p-6">
                <div className="w-11 h-11 rounded-xl bg-purple-900/40 border border-purple-500/25 text-purple-300 flex items-center justify-center mb-4 shadow-purple-glow">
                  <v.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{v.title}</h3>
                <p className="text-xs text-purple-200/65 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

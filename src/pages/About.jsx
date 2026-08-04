import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Compass, Award, ShieldCheck, Heart, Sparkles, Users, Layers, Landmark } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } })
};

export default function About() {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetch('/api/team')
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setTeam(d.data); })
      .catch(() => {});
  }, []);

  const values = [
    { title: 'Integrity & Transparency', desc: 'Operating with honesty and accountability in every community initiative we lead.', icon: ShieldCheck },
    { title: 'Youth-Led Governance',     desc: 'Nurturing student autonomy, decision-making, and self-organizing capacity.',     icon: Users },
    { title: 'Compassionate Service',    desc: 'Dedicated to uplifting underserved communities through collective volunteering.', icon: Heart },
    { title: 'Continuous Innovation',    desc: 'Fostering creative approaches to student engagement and social awareness.',        icon: Sparkles },
    { title: 'Strategic Leadership',     desc: 'Building the next generation of campus leaders through mentorship & guidance.',   icon: Award },
    { title: 'Mission-Driven Impact',    desc: 'Every action connects directly to our purpose of building thriving communities.', icon: Target },
  ];

  const objectives = [
    { title: 'Community Transformation', desc: 'Executing impactful local projects including blood donations, school tutoring, and clean environment campaigns.' },
    { title: 'Student Skill Cultivation', desc: 'Providing avenues for tech development, creative workshops, and competitive gaming like state-level chess.' },
    { title: 'Leadership Incubation', desc: 'Mentoring active youth through practical event planning, budget execution, and campus teamwork.' },
    { title: 'Social Justice Focus', desc: 'Increasing societal empathy by addressing inequalities and raising community awareness.' }
  ];

  return (
    <div>
      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="page-header px-4">
        <div className="max-w-4xl mx-auto">
          <motion.span custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="inline-block text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3.5 py-1 rounded-full border border-purple-500/25 mb-4"
          >
            Our Identity
          </motion.span>
          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight"
          >
            About <span className="gradient-text-purple">MAGIC Youth</span>
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="mt-4 text-purple-200/65 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Men & Women Aiming Greater Initiatives for Change — a student-led organization empowering
            youth through leadership, service, and innovation since 2022.
          </motion.p>
        </div>
      </div>

      {/* ── ORG HISTORY ─────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4 block">History</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-5">
              Born from Student Initiative
            </h2>
            <p className="text-purple-200/70 text-sm leading-relaxed mb-4">
              MAGIC Youth was founded by a passionate group of students at Andhra Loyola Institute of Engineering
              and Technology (ALIET), Vijayawada. They believed that young people hold the key to creating sustainable
              change — both within their university campus and in the broader community.
            </p>
            <p className="text-purple-200/70 text-sm leading-relaxed mb-4">
              Starting with small community outreach programs, the organization quickly grew into a recognized platform
              for leadership development, cultural events, strategic competitions, and social impact campaigns.
            </p>
            <p className="text-purple-200/70 text-sm leading-relaxed">
              Today, MAGIC Youth hosts state-level chess tournaments, blood donation drives, school teaching programs,
              tech workshops, and volunteer programs — all designed and led by students, for students.
            </p>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: 'Founded', val: '2022', sub: 'ALIET, Vijayawada' },
              { label: 'Members', val: '250+', sub: 'Active volunteers' },
              { label: 'Events', val: '45+', sub: 'Programs organized' },
              { label: 'Impact', val: '500+', sub: 'Lives touched' },
            ].map((stat, i) => (
              <div key={stat.label} className="dark-glass-card p-6 text-center">
                <div className="text-3xl font-extrabold text-white">{stat.val}</div>
                <div className="text-xs font-bold text-purple-400 mt-1 uppercase tracking-wider">{stat.label}</div>
                <div className="text-[10px] text-purple-300/50 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── VISION & MISSION ────────────────────────────────────── */}
      <section className="section-divider py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Vision & Mission</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="dark-glass-card p-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-500/25 text-purple-300 flex items-center justify-center mb-6 shadow-purple-glow">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
              <p className="text-purple-200/75 text-sm leading-relaxed">
                To cultivate a vibrant generation of empathetic, skilled, and socially conscious young people who
                actively lead initiatives that transform their communities and inspire meaningful progress across
                campuses, cities, and beyond.
              </p>
            </motion.div>

            <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="dark-glass-card p-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-500/25 text-purple-300 flex items-center justify-center mb-6 shadow-purple-glow">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
              <p className="text-purple-200/75 text-sm leading-relaxed">
                To empower students with a collaborative platform for leadership development, community volunteering,
                technical and cultural workshops, and impactful social awareness campaigns — building character and
                capability in equal measure.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── OBJECTIVES ──────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4 block">Key Focus Areas</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Our Core Objectives</h2>
            <p className="text-purple-200/60 text-xs leading-relaxed mt-4">
              MAGIC Youth works strategically to merge student development with real community impact. We establish programs that yield measurable outputs for social good.
            </p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {objectives.map((obj, i) => (
              <div key={obj.title} className="dark-glass-card p-6 border-l-4 border-l-purple-500">
                <h4 className="font-bold text-white text-sm mb-2">{obj.title}</h4>
                <p className="text-purple-200/65 text-xs leading-relaxed">{obj.desc}</p>
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
              Our Foundation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="dark-glass-card p-7"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-500/25 text-purple-300 flex items-center justify-center mb-4 shadow-purple-glow">
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{v.title}</h3>
                <p className="text-xs text-purple-200/65 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── YES-J RELATIONSHIP ──────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="dark-glass-card p-8 md:p-12 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-72 h-72 rounded-full bg-purple-600/10 blur-[80px]" />
          </div>
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3.5 py-1 rounded-full border border-purple-500/25 mb-4 inline-block">
                Academic & Jesuit Alliance
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4">
                Collaborative Integration with YES-J
              </h3>
              <p className="text-purple-200/70 text-xs md:text-sm leading-relaxed mb-4">
                As a student-led organization based at Andhra Loyola Institute of Engineering and Technology, Vijayawada,
                MAGIC Youth is closely aligned and collaborates with <strong>YES-J (Youth Empowerment Services - Jesuits)</strong>.
              </p>
              <p className="text-purple-200/70 text-xs md:text-sm leading-relaxed">
                YES-J operates as the central coordination body promoting social awareness, ethics, social justice outreach, and
                character-building in Jesuit institutions. This partnership grants our members access to mentors, collaborative state-wide volunteering
                networks, and specialized community resources, enhancing our ability to create a lasting impact.
              </p>
            </div>
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-32 h-32 rounded-2xl bg-purple-950/60 border border-purple-500/25 flex flex-col items-center justify-center text-center p-4 shadow-purple-glow">
                <Landmark className="w-10 h-10 text-purple-300 mb-2" />
                <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">YES-J ALIGNMENT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP TEAM ─────────────────────────────────────── */}
      {team.length > 0 && (
        <section className="section-divider py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3 py-1 rounded-full border border-purple-500/25">
                Leadership
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">Meet Our Team</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {team.map((m, i) => (
                <motion.div key={m._id} custom={i % 5} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className="dark-glass-card p-5 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-purple-950/60 mx-auto mb-3 overflow-hidden border-2 border-purple-500/35 shadow-purple-glow">
                    {m.photo
                      ? <img src={`/uploads/team/${m.photo}`} alt={m.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-purple-200">{m.name[0]}</div>
                    }
                  </div>
                  <h3 className="font-bold text-white text-sm leading-tight">{m.name}</h3>
                  <p className="text-[10px] text-purple-400 font-semibold mt-0.5">{m.position || 'Member'}</p>
                  {m.department && <p className="text-[10px] text-purple-300/45 mt-0.5">{m.department}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

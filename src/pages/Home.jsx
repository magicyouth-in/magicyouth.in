import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, Heart, Award, ArrowRight, ArrowDown, Volume2, VolumeX, 
  ChevronDown, BookOpen, Leaf, Sparkles, Rocket, 
  Globe, Shield, CheckCircle2, Building, MessageSquare, Compass
} from 'lucide-react';
import '../styles/home.css';

export default function Home() {
  const [stats, setStats] = useState({ events: null, units: null, members: null, initialized: false });
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [publishedPrograms, setPublishedPrograms] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [stories, setStories] = useState([]);
  
  // Video Controls State
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // FAQ State
  const [activeFaq, setActiveFaq] = useState(null);

  // Active Journey Step State
  const [activeJourney, setActiveJourney] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let eCount = null; let uCount = null; let mCount = null;
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        if (eventsData.success) {
          const progs = eventsData.data || [];
          eCount = progs.length;
          setPublishedPrograms(progs);
          setRecentEvents([...progs].sort((a,b) => new Date(b.date || b.startDate || b.start_date || b.created_at) - new Date(a.date || a.startDate || a.start_date || a.created_at)).slice(0, 3));
        }

        const galleryRes = await fetch('/api/gallery');
        const galleryData = await galleryRes.json();
        if (galleryData.success) {
          setRecentPhotos(galleryData.data.slice(0, 4));
        }

        const unitsRes = await fetch('/api/units?includeInactive=false');
        const unitsData = await unitsRes.json();
        if (unitsData.success) {
          const uList = unitsData.data || [];
          uCount = uList.length;
          setUnits(uList);
          const alietMatch = uList.find(u => u.name?.toUpperCase().includes('ALIET') || u.code?.toUpperCase().includes('ALIET'));
          if (alietMatch) {
            setSelectedUnit(alietMatch._id || alietMatch.id);
          } else if (uList.length > 0) {
            setSelectedUnit(uList[0]._id || uList[0].id);
          }
        }

        const teamsRes = await fetch('/api/teams');
        const teamsData = await teamsRes.json();
        if (teamsData.success && teamsData.data.length > 0) {
          mCount = teamsData.data.reduce((acc, t) => acc + (t.memberCount || 0), 0);
        }

        const storiesRes = await fetch('/api/testimonials');
        const storiesData = await storiesRes.json();
        if (storiesData.success) {
          setStories(storiesData.data || []);
        }
        
        setStats({ events: eCount, units: uCount, members: mCount, initialized: true });
      } catch (err) {
        setStats({ events: null, units: null, members: null, initialized: true });
      }
    };
    fetchData();
  }, []);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoRef.current.volume = 1.0;
        videoRef.current.play().catch(() => {});
      }
    }
    setIsMuted(nextMuted);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const journeySteps = [
    { 
      num: '01', 
      title: 'EXPERIENCE', 
      tagline: 'See beyond the classroom.', 
      desc: 'Ground learning in reality through immersive exposure visits, grassroots social encounters, and real-world community interactions.' 
    },
    { 
      num: '02', 
      title: 'REFLECTION', 
      tagline: 'Understand before you act.', 
      desc: 'Engage in structured personal and group discernment to critically analyze root causes, social structures, and personal calling.' 
    },
    { 
      num: '03', 
      title: 'INVOLVEMENT', 
      tagline: 'Turn understanding into action.', 
      desc: 'Design, organize, and lead concrete campus and community initiatives that address pressing social, educational, and environmental needs.' 
    },
    { 
      num: '04', 
      title: 'TRANSFORMATION', 
      tagline: 'Carry the experience forward.', 
      desc: 'Cultivate enduring personal integrity, transformed campus culture, and a lifelong commitment to social justice and leadership.' 
    }
  ];

  const whatWeDoList = [
    { title: 'Leadership Formation', desc: 'Capacity-building workshops, ethical leadership labs, and peer mentoring.', icon: Compass },
    { title: 'Community Engagement', desc: 'Direct outreach, rural immersion, and grassroots social solidarity initiatives.', icon: Heart },
    { title: 'Social Awareness', desc: 'Campaigns on human rights, constitutional values, and civic responsibility.', icon: Globe },
    { title: 'Environmental Action', desc: 'Campus sustainability, clean-up drives, tree planting, and climate advocacy.', icon: Leaf }
  ];

  const faqs = [
    {
      q: 'What is MAGIC Youth and how is it connected to YES-J?',
      a: 'MAGIC Youth (Men and Women Aiming at Greater Initiatives for Change) is the collegiate youth movement operating under the institutional umbrella of YES-J (Youth Empowering Service – Jesuits).'
    },
    {
      q: 'Who can join MAGIC Youth and how do I register?',
      a: 'Any student enrolled in higher education institutions can join. You can connect with your campus chapter or register directly through our online Join Us portal.'
    },
    {
      q: 'How can an institution start a MAGIC chapter?',
      a: 'Colleges can start an official chapter by identifying a faculty mentor, forming a founding student committee, and submitting a formal request for YES-J charter verification.'
    },
    {
      q: 'What kind of activities do student members lead?',
      a: 'Student members organize community literacy outreach, environmental sustainability campaigns, youth leadership summits, and grassroots social solidarity initiatives.'
    }
  ];

  return (
    <main className="home-wrapper">
      {/* 1. CINEMATIC FULL-WIDTH RESPONSIVE VIDEO ELEMENT (NATURAL ASPECT RATIO, NO CROPPING) */}
      <section className="video-section">
        {!videoError ? (
          <video
            ref={videoRef}
            src="/videos/magic-youth.mp4"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            poster="/assets/magic-logo.png"
            onError={() => setVideoError(true)}
          />
        ) : (
          <div 
            style={{
              width: '100%',
              minHeight: '240px',
              backgroundImage: `url(${recentPhotos.length > 0 ? recentPhotos[0].file_path : '/assets/magic-logo.png'})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}
          />
        )}

        {/* Floating Minimal Video Sound Control (Bottom-Right, Compact Icon Only) */}
        <button
          onClick={toggleSound}
          aria-label={isMuted ? "Unmute Video" : "Mute Video"}
          title={isMuted ? "Unmute Video" : "Mute Video"}
          className={`video-sound-toggle-icon ${!isMuted ? 'unmuted' : ''}`}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </section>

      {/* 2. MAGIC YOUTH EDITORIAL INTRODUCTION (TEXT STRICTLY BELOW VIDEO) */}
      <section className="intro-section">
        <div className="intro-container">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: '-40px' }} 
            variants={fadeUp}
          >
            <div className="intro-eyebrow">
              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> YES-J &bull; MAGIC YOUTH
            </div>
            
            <h1 className="intro-headline">
              Men and Women Aiming at <span style={{ color: 'var(--primary-blue)' }}>Greater Initiatives</span> for <span style={{ color: 'var(--primary-pink)' }}>Change</span>
            </h1>
            
            <p className="intro-subtitle">
              A campus-based movement that forms young people as agents of conscience, compassion, and commitment.
            </p>
            
            <div className="intro-actions">
              <Link 
                to="/join" 
                className="btn-primary" 
                style={{ 
                  backgroundColor: 'var(--primary-blue)', 
                  color: 'white', 
                  padding: '1rem 2.5rem', 
                  borderRadius: '999px', 
                  textDecoration: 'none', 
                  fontWeight: 800, 
                  fontSize: '1rem', 
                  boxShadow: '0 8px 20px rgba(2, 132, 199, 0.25)' 
                }}
              >
                JOIN MAGIC &rarr;
              </Link>
              <Link 
                to="/about" 
                className="btn-outline" 
                style={{ 
                  color: 'var(--text-primary)', 
                  borderColor: 'var(--border-color)', 
                  backgroundColor: '#FFFFFF',
                  padding: '1rem 2.5rem', 
                  borderRadius: '999px', 
                  textDecoration: 'none', 
                  fontWeight: 800, 
                  fontSize: '1rem', 
                  border: '2px solid var(--border-color)' 
                }}
              >
                DISCOVER OUR STORY &rarr;
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. OUR MOVEMENT & OUR STRUCTURE */}
      <section className="movement-section">
        <div className="movement-container">
          <motion.div 
            className="movement-header"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: '-40px' }} 
            variants={fadeUp}
          >
            <div className="movement-eyebrow">
              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Institutional Foundation
            </div>
            <h2 className="movement-title">
              OUR <span style={{ color: 'var(--primary-blue)' }}>MOVEMENT</span>
            </h2>
            <p className="movement-desc">
              MAGIC Youth forms young leaders through the institutional guidance of YES-J and active collegiate partnerships, mobilizing students as collaborative agents of social transformation.
            </p>
          </motion.div>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary-blue)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Organizational Hierarchy
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              OUR <span style={{ color: 'var(--primary-blue)' }}>STRUCTURE</span>
            </h3>
          </div>

          {/* Connected Structure Flow Diagram */}
          <div className="structure-flow">
            {/* Level 01: YES-J */}
            <motion.div 
              className="structure-card"
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp}
            >
              <div className="structure-badge">
                <Shield size={28} />
              </div>
              <div className="structure-content">
                <div className="structure-level-tag">LEVEL 01 &bull; APEX UMBRELLA</div>
                <div className="structure-name">YES-J</div>
                <p className="structure-description">
                  Youth Empowering Service – Jesuits. The apex institutional body providing vision, leadership formation, and ethical guidance.
                </p>
              </div>
            </motion.div>

            {/* Connector */}
            <div className="structure-connector-line">
              <ArrowDown size={18} style={{ color: 'var(--primary-blue)', position: 'absolute', bottom: '-2px', background: 'white', borderRadius: '50%' }} />
            </div>

            {/* Level 02: MAGIC YOUTH (Featured Central Movement) */}
            <motion.div 
              className="structure-card featured-core"
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp}
              transition={{ delay: 0.1 }}
            >
              <div className="structure-badge">
                <Sparkles size={30} />
              </div>
              <div className="structure-content">
                <div className="structure-level-tag" style={{ color: 'var(--primary-blue)', fontWeight: 900 }}>LEVEL 02 &bull; <span style={{ color: 'var(--primary-pink)' }}>YOUTH MOVEMENT</span></div>
                <div className="structure-name">MAGIC YOUTH</div>
                <p className="structure-description">
                  Men and Women Aiming at Greater Initiatives for Change. The official student youth wing under YES-J coordinating campus chapters.
                </p>
              </div>
            </motion.div>

            {/* Connector */}
            <div className="structure-connector-line">
              <ArrowDown size={18} style={{ color: 'var(--primary-blue)', position: 'absolute', bottom: '-2px', background: 'white', borderRadius: '50%' }} />
            </div>

            {/* Level 03: EDUCATIONAL INSTITUTIONS */}
            <motion.div 
              className="structure-card"
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp}
              transition={{ delay: 0.2 }}
            >
              <div className="structure-badge" style={{ backgroundColor: '#F1F5F9', color: 'var(--primary-blue)' }}>
                <Building size={28} />
              </div>
              <div className="structure-content">
                <div className="structure-level-tag">LEVEL 03 &bull; CAMPUS PARTNERS</div>
                <div className="structure-name">EDUCATIONAL INSTITUTIONS</div>
                <p className="structure-description">
                  Colleges and higher education institutions hosting chartered MAGIC Youth chapters and faculty mentorship.
                </p>
              </div>
            </motion.div>

            {/* Connector */}
            <div className="structure-connector-line">
              <ArrowDown size={18} style={{ color: 'var(--primary-blue)', position: 'absolute', bottom: '-2px', background: 'white', borderRadius: '50%' }} />
            </div>

            {/* Level 04: STUDENT AGENTS OF CHANGE */}
            <motion.div 
              className="structure-card"
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp}
              transition={{ delay: 0.3 }}
            >
              <div className="structure-badge" style={{ backgroundColor: '#E0F2FE', color: 'var(--primary-blue)' }}>
                <Users size={28} />
              </div>
              <div className="structure-content">
                <div className="structure-level-tag">LEVEL 04 &bull; ACTIVE FORMATION</div>
                <div className="structure-name">STUDENT AGENTS OF CHANGE</div>
                <p className="structure-description">
                  Empowered student leaders formed in conscience, compassion, and commitment to drive transformative community initiatives.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. COMPACT VISION & MISSION */}
      <section className="vision-mission-compact">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem' }}>
            <div style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Purpose & Calling
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.65rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              OUR <span style={{ color: 'var(--primary-blue)' }}>VISION & MISSION</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Vision Card */}
            <motion.div 
              style={{ backgroundColor: '#FFFFFF', border: '1.5px solid var(--border-color)', padding: '2.5rem 2.25rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp}
            >
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary-blue)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> OUR VISION
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.4, marginBottom: '1rem' }}>
                  "A just, equal, and compassionate society where young people lead meaningful change."
                </h3>
              </div>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                Envisioning formed student leaders who embody empathy, critical social awareness, and institutional responsibility for community welfare.
              </p>
            </motion.div>

            {/* Mission Card */}
            <motion.div 
              style={{ backgroundColor: '#FFFFFF', border: '1.5px solid var(--border-color)', padding: '2.75rem 2.25rem', borderRadius: '1.25rem', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp}
              transition={{ delay: 0.15 }}
            >
              <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary-blue)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> OUR MISSION
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                Forming Young Leaders Who:
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Understand social realities through direct grassroots engagement',
                  'Think critically with conscience, compassion, and conviction',
                  'Lead organized student initiatives for community empowerment',
                  'Cultivate enduring social responsibility and ethical leadership'
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5 }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. THE MAGIC JOURNEY (INTERACTIVE 4-STAGE PIPELINE) */}
      <section className="programs-section" style={{ backgroundColor: '#F8FAFC', color: 'var(--text-primary)', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> The Transformative Process
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
              The MAGIC <span style={{ color: 'var(--primary-pink)' }}>Journey</span>
            </h2>
            <p style={{ color: '#475569', fontSize: '1.125rem', maxWidth: '600px', margin: '1rem auto 0' }}>
              A sequential formation framework transforming student enthusiasm into lasting social impact.
            </p>
          </div>

          {/* Interactive Step Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {journeySteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveJourney(idx)}
                style={{
                  backgroundColor: activeJourney === idx ? '#FFFFFF' : '#FFFFFF',
                  border: activeJourney === idx ? '2px solid var(--primary-blue)' : '1px solid #E2E8F0',
                  boxShadow: activeJourney === idx ? '0 4px 20px rgba(2, 132, 199, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
                  padding: '1.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: activeJourney === idx ? 'var(--primary-blue)' : '#64748B', letterSpacing: '0.05em' }}>
                    PHASE {step.num}
                  </span>
                  {activeJourney === idx && (
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-pink)' }} />
                  )}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.35rem' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
                  {step.tagline}
                </div>
              </button>
            ))}
          </div>

          {/* Active Detail Display */}
          <motion.div 
            key={activeJourney}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E2E8F0', 
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
              padding: '3rem 2.5rem', 
              borderRadius: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Phase {journeySteps[activeJourney].num} &bull; Detailed Overview
            </div>
            <h3 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A' }}>
              {journeySteps[activeJourney].title}: <span style={{ color: 'var(--primary-blue)' }}>{journeySteps[activeJourney].tagline}</span>
            </h3>
            <p style={{ color: '#334155', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '850px' }}>
              {journeySteps[activeJourney].desc}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. WHAT WE DO */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Areas of Action
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              What We Do
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '600px', margin: '1rem auto 0' }}>
              Translating youthful energy into measurable social interventions across diverse domains.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {whatWeDoList.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <motion.div 
                  key={idx} 
                  style={{ backgroundColor: 'white', padding: '2.5rem 2rem', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <IconComp size={24} style={{ color: 'var(--primary-blue)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65 }}>
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. PROGRAMS PREVIEW (DATABASE-DRIVEN, STRICTLY ADMIN-MANAGED) */}
      <section style={{ backgroundColor: 'white', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
            <div>
              <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Key Initiatives
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Flagship Programs
              </h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {units.length > 1 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '999px', padding: '0.4rem 0.85rem' }}>
                  <Building size={14} style={{ color: 'var(--primary-blue)' }} />
                  <select 
                    value={selectedUnit} 
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8125rem', cursor: 'pointer' }}
                  >
                    <option value="All">All Chapters</option>
                    {units.map(u => (
                      <option key={u._id || u.id} value={u._id || u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <Link to="/programs" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary-blue)', borderColor: 'var(--border-color)' }}>
                View All Programs <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {(() => {
            const displayedPrograms = publishedPrograms.filter(p => {
              if (selectedUnit === 'All') return true;
              return (
                p.unitId?._id === selectedUnit ||
                p.unitId?.id === selectedUnit ||
                p.unit_id === selectedUnit
              );
            });

            if (displayedPrograms.length === 0) {
              return (
                <div style={{
                  textAlign: 'center',
                  padding: '3.5rem 2rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '1rem',
                  border: '1px dashed var(--border-color)',
                  maxWidth: '650px',
                  margin: '0 auto'
                }}>
                  <BookOpen size={40} color="var(--primary-blue)" style={{ margin: '0 auto 1.25rem', opacity: 0.6 }} />
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Programs will be announced soon.
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                    Our chapter coordinators and formation directors are finalizing upcoming youth initiatives. Please check back soon or connect with our campus leads.
                  </p>
                  <Link to="/join" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.65rem 1.5rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
                    Join as a Change Agent &rarr;
                  </Link>
                </div>
              );
            }

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
                {displayedPrograms.map((prog, i) => {
                  const catLower = (prog.category || '').toLowerCase();
                  let IconComp = BookOpen;
                  if (catLower.includes('env') || catLower.includes('green') || catLower.includes('eco')) IconComp = Leaf;
                  else if (catLower.includes('summit') || catLower.includes('cult') || catLower.includes('gather') || catLower.includes('magis') || catLower.includes('camp')) IconComp = Sparkles;
                  else if (catLower.includes('innov') || catLower.includes('tech') || catLower.includes('elevate') || catLower.includes('lead')) IconComp = Rocket;

                  return (
                    <motion.div 
                      key={prog._id || prog.id || i} 
                      style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border-color)', padding: '2.5rem 1.75rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                      initial="hidden" 
                      whileInView="visible" 
                      viewport={{ once: true }} 
                      variants={fadeUp} 
                      transition={{ delay: i * 0.08 }}
                    >
                      <div>
                        <div style={{ width: '42px', height: '42px', borderRadius: '0.5rem', backgroundColor: 'white', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                          <IconComp size={20} style={{ color: 'var(--primary-blue)' }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--primary-pink)', marginRight: '4px' }}>●</span> {prog.category || 'Initiative'}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                          {prog.title}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                          {prog.description}
                        </p>
                      </div>
                      <Link to="/programs" style={{ color: 'var(--primary-blue)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        Explore &rarr;
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>

      {/* 7. FEATURED STORY / EVENTS */}
      {stats.initialized && recentEvents.length > 0 && (
        <section style={{ backgroundColor: '#F8FAFC', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Featured Impact
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '4rem', alignItems: 'center' }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <img 
                  src={recentEvents[0].photoUrl || "/assets/magic-logo.png"} 
                  alt={recentEvents[0].title} 
                  loading="lazy" 
                  style={{ width: '100%', height: '380px', objectFit: 'cover', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }} 
                />
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
                  {recentEvents[0].academicYear || recentEvents[0].event_date || 'Campus Engagement'}
                </div>
                <h3 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '1rem' }}>
                  {recentEvents[0].title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                  {recentEvents[0].description}
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/impact" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '0.75rem 1.75rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    View Event Highlights <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* 8. STORIES & TESTIMONIALS (DATABASE-DRIVEN) */}
      {stories.length > 0 && (
        <section style={{ backgroundColor: 'white', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Student Voices
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Stories of <span style={{ color: 'var(--primary-blue)' }}>Transformation</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
              {stories.slice(0, 3).map((story, i) => (
                <motion.div 
                  key={story._id || story.id || i} 
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border-color)', padding: '2.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeUp} 
                  transition={{ delay: i * 0.1 }}
                >
                  <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '2rem' }}>
                    "{story.quote || story.excerpt || story.fullStory}"
                  </p>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '0.9375rem' }}>
                      {story.author || story.name || 'Student Changemaker'}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {story.unit || story.chapter || story.role || 'MAGIC Youth Member'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. LEADERSHIP & GUIDANCE */}
      <section className="leadership-section">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div 
            style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.75rem' }}
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: '-40px' }} 
            variants={fadeUp}
          >
            <div style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Institutional Guidance
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.65rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              LEADERSHIP & <span style={{ color: 'var(--primary-blue)' }}>GUIDANCE</span>
            </h2>
          </motion.div>

          <motion.div 
            className="leadership-card"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeUp}
          >
            <div className="leadership-img-wrapper">
              <img 
                src="/assets/fr-bala-kumar.png" 
                alt="Fr. Bala Kumar Bollineni, SJ" 
                className="leadership-img"
              />
            </div>
            <div className="leadership-info">
              <div className="leadership-role-tag">
                <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> FOUNDER-DIRECTOR, YES-J
              </div>
              <h3 className="leadership-name">
                Fr. Bala Kumar Bollineni, SJ
              </h3>
              <div className="leadership-official-role">
                Founder-Director, Youth Empowering Service-Jesuits (YES-J)
              </div>
              <p className="leadership-desc">
                Founder-Director of YES-J and a foundational guide in the formation and accompaniment of young people through MAGIC Youth.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 10. REAL IMPACT METRICS */}
      {stats.initialized && (
        <section className="impact-strip" style={{ backgroundColor: '#F8FAFC', padding: '4.5rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>
                {stats.units !== null && stats.units > 0 ? stats.units : 'Campus'}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stats.units !== null && stats.units > 0 ? 'Active Units' : 'Engagement'}
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>
                {stats.events !== null && stats.events > 0 ? stats.events : 'Youth'}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stats.events !== null && stats.events > 0 ? 'Events Conducted' : 'In Action'}
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>
                {stats.members !== null && stats.members > 0 ? stats.members : 'Leadership'}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stats.members !== null && stats.members > 0 ? 'Student Leaders' : 'Formation'}
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.3 }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                YES-J
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Affiliated Umbrella
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* 10. START A CHAPTER 4-STEP SEQUENCE */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Campus Expansion
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Start a <span style={{ color: 'var(--primary-blue)' }}>MAGIC</span> <span style={{ color: 'var(--primary-pink)' }}>Chapter</span> at Your Institution
            </h2>
            <p style={{ color: '#475569', fontSize: '1.125rem', maxWidth: '650px', margin: '1rem auto 0' }}>
              Empower your college students by establishing an official YES-J student youth wing.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.75rem', marginBottom: '3.5rem' }}>
            {[
              { num: '01', title: 'Faculty Sponsorship', desc: 'Identify a supportive faculty mentor or department coordinator to guide institutional alignment.' },
              { num: '02', title: 'Core Mobilization', desc: 'Form an enthusiastic founding committee of student leaders across various academic years.' },
              { num: '03', title: 'Formal Submission', desc: 'Submit the formal chapter establishment request through the YES-J institutional portal.' },
              { num: '04', title: 'Charter Verification', desc: 'Receive official YES-J chapter charter, orientation toolkits, and launch your first campus initiative.' }
            ].map((step, idx) => (
              <div key={idx} style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '2.25rem 1.75rem', borderRadius: '0.75rem', position: 'relative' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-blue)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{step.num}</span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-pink)' }} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/chapters#start-chapter" className="btn-primary" style={{ backgroundColor: 'var(--primary-blue)', color: 'white', padding: '1rem 2.5rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800, fontSize: '1rem', boxShadow: '0 8px 20px rgba(2, 132, 199, 0.25)' }}>
              START A CHAPTER &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 11. INTERACTIVE FAQ ACCORDION */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Common Inquiries
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1.5rem 1.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.0625rem',
                      fontWeight: 800,
                      color: isOpen ? 'var(--primary-blue)' : 'var(--text-primary)'
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown 
                      size={20} 
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease', color: 'var(--text-secondary)' }} 
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 1.75rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. FINAL CALL TO ACTION */}
      <section className="final-cta-section" style={{ backgroundColor: '#0F172A', padding: '7rem 1.5rem', textAlign: 'center', color: 'white' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)', fontWeight: 900, marginBottom: '1.5rem', color: 'white', lineHeight: 1.15 }}>
            Young people can be more than participants.<br/>
            <span style={{ color: 'var(--primary-blue)' }}>They can become agents of </span><span style={{ color: 'var(--primary-pink)' }}>change</span>.
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', maxWidth: '640px', margin: '0 auto 2.5rem', color: '#94A3B8', lineHeight: 1.6 }}>
            Join MAGIC Youth today and be part of an inspiring campus journey rooted in YES-J's transformative mission.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/join" 
              className="btn-primary" 
              style={{ 
                backgroundColor: 'var(--primary-blue)', 
                color: 'white', 
                padding: '1.1rem 2.75rem', 
                borderRadius: '999px', 
                textDecoration: 'none', 
                fontWeight: 800, 
                fontSize: '1.05rem', 
                boxShadow: '0 10px 25px rgba(2, 132, 199, 0.35)' 
              }}
            >
              JOIN MAGIC &rarr;
            </Link>
            <a href="https://yesj.org" target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', padding: '1.1rem 2.75rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800, fontSize: '1.05rem', border: '2px solid' }}>
              EXPLORE YES-J &rarr;
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

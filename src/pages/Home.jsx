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
          eCount = eventsData.data.length;
          setRecentEvents(eventsData.data.sort((a,b) => new Date(b.startDate || b.start_date) - new Date(a.startDate || a.start_date)).slice(0, 3));
        }

        const galleryRes = await fetch('/api/gallery');
        const galleryData = await galleryRes.json();
        if (galleryData.success) {
          setRecentPhotos(galleryData.data.slice(0, 4));
        }

        const unitsRes = await fetch('/api/units?includeInactive=false');
        const unitsData = await unitsRes.json();
        if (unitsData.success) {
          uCount = unitsData.data.length;
        }

        const teamsRes = await fetch('/api/teams');
        const teamsData = await teamsRes.json();
        if (teamsData.success && teamsData.data.length > 0) {
          mCount = teamsData.data.reduce((acc, t) => acc + (t.memberCount || 0), 0);
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
    { title: 'Community Engagement', desc: 'Direct outreach, rural immersion, and grassroots social solidarity programs.', icon: Heart },
    { title: 'Education & Literacy', desc: 'Remedial teaching, academic mentoring, and educational equity initiatives.', icon: BookOpen },
    { title: 'Leadership Development', desc: 'Capacity-building workshops, ethical leadership labs, and peer mentorship.', icon: Compass },
    { title: 'Social Awareness', desc: 'Campaigns on human rights, constitutional values, and civic responsibility.', icon: Globe },
    { title: 'Environmental Action', desc: 'Campus sustainability, tree planting, zero-waste drives, and climate action.', icon: Leaf },
    { title: 'Youth Participation', desc: 'Student-led campus councils, debates, cultural expression, and collective action.', icon: Users }
  ];

  const faqs = [
    {
      q: 'Who can join MAGIC Youth?',
      a: 'Any student enrolled in higher education institutions or colleges who is passionate about social justice, personal growth, and community action can join MAGIC Youth.'
    },
    {
      q: 'How can I join MAGIC Youth?',
      a: 'You can join through your campus MAGIC chapter or register directly through our online "Join Us" portal. Our campus coordinators will connect you with ongoing initiatives.'
    },
    {
      q: 'How can I start a MAGIC chapter at my institution?',
      a: 'Starting a chapter involves a 4-step institutional process: securing faculty sponsorship, mobilizing a student core committee, submitting a formal chapter request, and receiving YES-J charter verification.'
    },
    {
      q: 'What activities does MAGIC Youth conduct?',
      a: 'MAGIC Youth conducts community engagement projects, leadership camps, social awareness campaigns, environmental sustainability drives, educational tutoring for underprivileged children, and regional youth conventions.'
    },
    {
      q: 'Can students participate without an existing campus chapter?',
      a: 'Yes! Individual students can participate in regional YES-J conventions, open social action drives, online leadership workshops, and can take the initiative to start a chapter on their campus.'
    },
    {
      q: 'How can institutions collaborate with YES-J / MAGIC Youth?',
      a: 'Colleges and universities can collaborate through institutional partnerships, faculty-led community outreach programs, and co-hosting regional youth leadership summits.'
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

        {/* Floating Minimal Video Sound Control (Bottom-Right) */}
        <button
          onClick={toggleSound}
          aria-label={isMuted ? "Turn Sound On" : "Turn Sound Off"}
          className={`video-sound-toggle ${!isMuted ? 'unmuted' : ''}`}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span>{isMuted ? 'Sound Off' : 'Sound On'}</span>
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
              YES-J &bull; MAGIC YOUTH
            </div>
            
            <h1 className="intro-headline">
              Men and Women Aiming at <span style={{ color: 'var(--primary-pink)' }}>Greater Initiatives</span> for Change
            </h1>
            
            <p className="intro-subtitle">
              A campus-based movement that forms young people as agents of conscience, compassion, and commitment.
            </p>
            
            <div className="intro-actions">
              <Link 
                to="/join" 
                className="btn-primary" 
                style={{ 
                  backgroundImage: 'var(--gradient-brand)',
                  backgroundColor: 'var(--primary-blue)', 
                  color: 'white', 
                  padding: '1rem 2.5rem', 
                  borderRadius: '999px', 
                  textDecoration: 'none', 
                  fontWeight: 800, 
                  fontSize: '1rem', 
                  boxShadow: '0 10px 25px rgba(2, 132, 199, 0.4)' 
                }}
              >
                JOIN MAGIC &rarr;
              </Link>
              <Link 
                to="/about" 
                className="btn-outline" 
                style={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.35)', 
                  padding: '1rem 2.5rem', 
                  borderRadius: '999px', 
                  textDecoration: 'none', 
                  fontWeight: 800, 
                  fontSize: '1rem', 
                  border: '2px solid' 
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
              Institutional Foundation
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
              Organizational Hierarchy
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              OUR <span style={{ color: 'var(--primary-pink)' }}>STRUCTURE</span>
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
                <div className="structure-name">YES-J (Youth Empowering Service – Jesuits)</div>
                <p className="structure-description">
                  The Jesuit youth ministry umbrella providing institutional vision, ethical leadership values, and spiritual grounding in conscience, compassion, and commitment.
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
                <div className="structure-level-tag" style={{ color: 'var(--primary-pink)', fontWeight: 900 }}>LEVEL 02 &bull; CENTRAL MOVEMENT</div>
                <div className="structure-name">
                  MAGIC YOUTH <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-pink)', marginLeft: '0.5rem' }}>(Men and Women Aiming at Greater Initiatives for Change)</span>
                </div>
                <p className="structure-description">
                  A campus-based youth movement under YES-J that organizes, forms, and mentors college students into active, empathetic leaders for societal change.
                </p>
              </div>
            </motion.div>

            {/* Connector */}
            <div className="structure-connector-line">
              <ArrowDown size={18} style={{ color: 'var(--primary-pink)', position: 'absolute', bottom: '-2px', background: 'white', borderRadius: '50%' }} />
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
              <div className="structure-badge" style={{ backgroundColor: '#FFE4E6', color: 'var(--primary-pink)' }}>
                <Building size={28} />
              </div>
              <div className="structure-content">
                <div className="structure-level-tag">LEVEL 03 &bull; CAMPUS COLLABORATION</div>
                <div className="structure-name">EDUCATIONAL INSTITUTIONS</div>
                <p className="structure-description">
                  Colleges and higher education campuses across Andhra Pradesh and Telangana where institutional MAGIC chapters and faculty mentors operate.
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
                  Young people who experience grassroots reality, reflect critically with conscience, participate in community initiatives, and lead lasting transformation.
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
            <div style={{ color: 'var(--primary-pink)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Purpose & Calling
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.65rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              OUR <span style={{ color: 'var(--primary-blue)' }}>VISION & MISSION</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Vision Card */}
            <motion.div 
              style={{ backgroundColor: '#0F172A', color: 'white', padding: '2.75rem 2.25rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(15,23,42,0.1)' }}
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp}
            >
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary-pink)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  OUR VISION
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.4, marginBottom: '1.25rem' }}>
                  "A just, equal, and compassionate society where young people lead meaningful change."
                </h3>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.975rem', lineHeight: 1.7, margin: 0 }}>
                Envisioning a generation of formed student leaders who embody empathy, critical social awareness, and institutional responsibility for community welfare.
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
                OUR MISSION
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                Forming Young Leaders Who:
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Understand social realities and structural challenges',
                  'Think critically with conscience and conviction',
                  'Engage empathetically with grassroots communities',
                  'Take concrete, organized, and constructive action',
                  'Develop collaborative student leadership skills',
                  'Carry lifelong social responsibility beyond college'
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
      <section className="programs-section" style={{ backgroundColor: '#0F172A', color: 'white', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-pink)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              The Transformative Process
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
              The MAGIC Journey
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1.125rem', maxWidth: '600px', margin: '1rem auto 0' }}>
              A sequential formation framework transforming student enthusiasm into lasting social impact.
            </p>
          </div>

          {/* Interactive Step Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {journeySteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveJourney(idx)}
                style={{
                  backgroundColor: activeJourney === idx ? '#1E293B' : 'rgba(30, 41, 59, 0.5)',
                  border: activeJourney === idx ? '2px solid var(--primary-pink)' : '1px solid #334155',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: activeJourney === idx ? 'var(--primary-pink)' : '#64748B', marginBottom: '0.5rem' }}>
                  PHASE {step.num}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '0.35rem' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
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
              backgroundColor: '#1E293B', 
              border: '1px solid #334155', 
              padding: '3rem', 
              borderRadius: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary-pink)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Phase {journeySteps[activeJourney].num} &bull; Detailed Overview
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>
              {journeySteps[activeJourney].title}: <span style={{ color: 'var(--primary-blue)' }}>{journeySteps[activeJourney].tagline}</span>
            </h3>
            <p style={{ color: '#E2E8F0', fontSize: '1.15rem', lineHeight: 1.8, maxWidth: '850px' }}>
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
              Areas of Action
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
                  <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', backgroundColor: idx % 2 === 0 ? '#E0F2FE' : '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <IconComp size={24} style={{ color: idx % 2 === 0 ? 'var(--primary-blue)' : 'var(--primary-pink)' }} />
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

      {/* 6. PROGRAMS PREVIEW */}
      <section style={{ backgroundColor: 'white', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3.5rem' }}>
            <div>
              <div className="section-eyebrow" style={{ color: 'var(--primary-pink)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Key Initiatives
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Flagship Programs
              </h2>
            </div>
            <Link to="/programs" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              View All Programs <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[
              { name: 'Project Shiksha', tag: 'Education Outreach', desc: 'Providing academic support, literacy campaigns, and mentoring for underprivileged students.', icon: BookOpen },
              { name: 'Green Footprints', tag: 'Environment', desc: 'Promoting eco-conservation, campus clean drives, and climate awareness initiatives.', icon: Leaf },
              { name: 'MAGIS / Yuvotsavaalu', tag: 'Youth Gathering', desc: 'Annual convention celebrating student culture, social reflection, and solidarity.', icon: Sparkles },
              { name: 'Elevate X', tag: 'Social Innovation', desc: 'Student-led social entrepreneurship incubation addressing grassroots challenges.', icon: Rocket }
            ].map((prog, i) => {
              const IconComp = prog.icon;
              return (
                <motion.div 
                  key={i} 
                  style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border-color)', padding: '2.5rem 1.75rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  transition={{ delay: i * 0.1 }}
                >
                  <div>
                    <div style={{ width: '42px', height: '42px', borderRadius: '0.5rem', backgroundColor: 'white', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                      <IconComp size={20} style={{ color: 'var(--primary-blue)' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-pink)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                      {prog.tag}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                      {prog.name}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      {prog.desc}
                    </p>
                  </div>
                  <Link to="/programs" style={{ color: 'var(--primary-blue)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    Learn More &rarr;
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FEATURED STORY / EVENTS */}
      {stats.initialized && recentEvents.length > 0 && (
        <section style={{ backgroundColor: '#F8FAFC', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Featured Impact
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
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-pink)', marginBottom: '0.5rem' }}>
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

      {/* 8. STORIES & TESTIMONIALS */}
      <section style={{ backgroundColor: 'white', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-pink)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Student Voices
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Stories of Transformation
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {[
              {
                quote: "MAGIC taught me that youth leadership is not about occupying titles, but about listening deeply to marginalized communities and taking consistent, humble action.",
                author: "Student Coordinator",
                chapter: "ALIET Chapter"
              },
              {
                quote: "Through rural immersion visits, I experienced realities that textbooks never touched. That exposure shaped my career decisions toward community development.",
                author: "Core Committee Member",
                chapter: "Vijayawada Unit"
              },
              {
                quote: "Participating in Project Shiksha transformed our entire campus culture into one of active volunteerism and educational solidarity.",
                author: "Volunteer Lead",
                chapter: "Campus Executive"
              }
            ].map((story, i) => (
              <motion.div 
                key={i} 
                style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border-color)', padding: '2.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
              >
                <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '2rem' }}>
                  "{story.quote}"
                </p>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '0.9375rem' }}>
                    {story.author}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {story.chapter}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. START A CHAPTER 4-STEP SEQUENCE */}
      <section style={{ backgroundColor: '#0B1120', color: 'white', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-pink)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Campus Expansion
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
              Start a MAGIC Chapter at Your Institution
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1.125rem', maxWidth: '650px', margin: '1rem auto 0' }}>
              Empower your college students by establishing an official YES-J student youth wing.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
            {[
              { num: '01', title: 'Faculty Sponsorship', desc: 'Identify a supportive faculty mentor or department coordinator to guide institutional alignment.' },
              { num: '02', title: 'Core Mobilization', desc: 'Form an enthusiastic founding committee of student leaders across various academic years.' },
              { num: '03', title: 'Formal Submission', desc: 'Submit the formal chapter establishment request through the YES-J institutional portal.' },
              { num: '04', title: 'Charter Verification', desc: 'Receive official YES-J chapter charter, orientation toolkits, and launch your first campus initiative.' }
            ].map((step, idx) => (
              <div key={idx} style={{ backgroundColor: '#1E293B', border: '1px solid #334155', padding: '2rem 1.5rem', borderRadius: '0.75rem', position: 'relative' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-pink)', marginBottom: '0.75rem' }}>{step.num}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/chapters" className="btn-primary" style={{ backgroundColor: 'var(--primary-pink)', color: 'white', padding: '1rem 2.5rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 800, fontSize: '1rem' }}>
              Explore Chapters & Start One &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 10. REAL IMPACT METRICS */}
      {stats.initialized && (
        <section className="impact-strip" style={{ backgroundColor: 'white', padding: '4rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
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
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-pink)', marginBottom: '0.25rem' }}>
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

      {/* 11. INTERACTIVE FAQ ACCORDION */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Common Inquiries
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
            <span style={{ color: 'var(--primary-pink)' }}>They can become agents of change.</span>
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', maxWidth: '640px', margin: '0 auto 2.5rem', color: '#94A3B8', lineHeight: 1.6 }}>
            Join MAGIC Youth today and be part of an inspiring campus journey rooted in YES-J's transformative mission.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/join" 
              className="btn-primary" 
              style={{ 
                backgroundImage: 'var(--gradient-brand)',
                backgroundColor: 'var(--primary-blue)', 
                color: 'white', 
                padding: '1.1rem 2.75rem', 
                borderRadius: '999px', 
                textDecoration: 'none', 
                fontWeight: 800, 
                fontSize: '1.05rem', 
                boxShadow: '0 10px 25px rgba(2, 132, 199, 0.4)' 
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

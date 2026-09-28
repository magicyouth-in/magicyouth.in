import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartHandshake, CheckCircle2, ArrowRight, ArrowLeft,
  User, GraduationCap, Wrench, MessageSquare, AlertCircle,
  FileUp, Image as ImageIcon, ClipboardList, Loader2, Sparkles,
  Building2, Award, Heart, Users, ShieldAlert, Crown
} from 'lucide-react';
import '../styles/about.css';
import '../styles/join.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const DEFAULT_LEADERSHIP_ROLES = [
  'First Lead',
  'Second Lead',
  'Secretary',
  'Deputy Secretary',
  'Procurator',
  'Social Media Coordinator',
  'Event Coordinator',
  'Volunteer Coordinator',
  'Cultural Coordinator'
];

export default function JoinUs() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [units, setUnits] = useState([]);
  const [leadershipRoles, setLeadershipRoles] = useState(DEFAULT_LEADERSHIP_ROLES);

  useEffect(() => {
    // Fetch Active Units
    fetch('/api/units?includeInactive=false')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          // Filter to only Active units for applications
          const activeUnits = d.data.filter(u => u.status === 'Active');
          setUnits(activeUnits);

          // Preselect default unit if form doesn't have one
          const def = activeUnits.find(u => u.isDefault || u.is_default) || activeUnits[0];
          if (def) {
            setFormData(prev => ({
              ...prev,
              unitId: prev.unitId || def._id || def.id,
              college: prev.college || def.institution || ''
            }));
          }
        }
      })
      .catch(() => {});

    // Fetch Leadership Roles
    fetch('/api/leadership-roles')
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setLeadershipRoles(d.data.map(r => r.name));
        }
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    college: '',
    department: '',
    year: '1st Year',
    city: '',
    unitId: '',
    membershipType: 'MEMBER', // 'MEMBER' | 'LEADERSHIP'
    preferredLeadershipRole: 'First Lead',
    skills: [],
    interests: [],
    previousExperience: '',
    reason: '',
  });

  const [files, setFiles] = useState({
    resume: null,
    profileImage: null,
  });

  const skillOptions = [
    'Event Management', 'Public Speaking', 'Graphic Design',
    'Web Development', 'Photography', 'Social Media',
    'Content Writing', 'Logistics', 'Public Relations'
  ];

  const interestOptions = [
    'Community Service', 'Tech Workshops', 'Chess & Sports',
    'Cultural Programs', 'Environmental Drives', 'Peer Mentoring'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // If user changes unitId, optionally update college placeholder if empty
      if (name === 'unitId') {
        const matchingUnit = units.find(u => (u._id || u.id) === value);
        if (matchingUnit && matchingUnit.institution && !prev.college) {
          updated.college = matchingUnit.institution;
        }
      }
      return updated;
    });
  };

  const toggleOption = (field, item) => {
    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles[0]) {
      setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const validateStep = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
        setErrorMsg('Please fill in your personal contact details (Name, Email, Phone).');
        return false;
      }
      if (!formData.unitId) {
        setErrorMsg('Please select a target MAGIC Youth Unit.');
        return false;
      }
      if (formData.membershipType === 'LEADERSHIP' && !formData.preferredLeadershipRole) {
        setErrorMsg('Please select your preferred leadership role for nomination.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.college.trim() || !formData.department.trim() || !formData.city.trim()) {
        setErrorMsg('Please fill in your academic details (College, Department, City).');
        return false;
      }
    }
    if (currentStep === 3) {
      if (formData.skills.length === 0) {
        setErrorMsg('Please select at least one skill.');
        return false;
      }
    }
    if (currentStep === 5) {
      if (!formData.reason.trim()) {
        setErrorMsg('Please state your motivation for joining MAGIC Youth.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const bodyData = new FormData();
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          bodyData.append(key, JSON.stringify(formData[key]));
        } else {
          bodyData.append(key, formData[key]);
        }
      });

      if (files.resume) bodyData.append('resume', files.resume);
      if (files.profileImage) bodyData.append('profileImage', files.profileImage);

      const res = await fetch('/api/join', {
        method: 'POST',
        body: bodyData
      });

      const data = await res.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        setErrorMsg(data.message || 'Failed to submit application. Please try again.');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Type & Unit', icon: User },
    { num: 2, label: 'Academic', icon: GraduationCap },
    { num: 3, label: 'Skills', icon: Wrench },
    { num: 4, label: 'Interests', icon: Sparkles },
    { num: 5, label: 'Motivation', icon: MessageSquare },
    { num: 6, label: 'Uploads', icon: FileUp },
    { num: 7, label: 'Review', icon: ClipboardList }
  ];

  const selectedUnitObj = units.find(u => (u._id || u.id) === formData.unitId);

  return (
    <div>
      {/* ── JOIN HERO ───────────────────────────────────────────── */}
      <section className="join-hero page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ maxWidth: '850px', margin: '0 auto' }}>
          <span className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-block' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> YES-J &bull; MAGIC YOUTH MEMBERSHIP
          </span>
          <h1 className="page-header-title" style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Become a <span style={{ color: 'var(--primary-blue)' }}>Change</span> <span style={{ color: 'var(--primary-pink)' }}>Agent</span>
          </h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
            Join a campus-based movement forming young people as leaders of conscience, compassion, and commitment.
          </p>
        </motion.div>
      </section>

      {/* ── FORM CONTAINER ──────────────────────────────────────── */}
      <section className="join-section" style={{ backgroundColor: 'var(--bg-primary)', padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: '4rem', alignItems: 'start' }} className="join-split-layout">
          
          {/* WHY JOIN SIDEBAR */}
          <div className="join-sidebar" style={{ position: 'sticky', top: '80px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-primary)' }}>Why Join MAGIC Youth?</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--primary-blue-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Award size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Leadership &amp; Growth</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Develop practical leadership skills by organizing events, managing budgets, and leading student committees.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--bg-accent-blue)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Heart size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Community Impact</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Directly impact your community through organized volunteering and social awareness drives.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Collegiate Network</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Join a massive network of like-minded students across different collegiate chapters under MAGIC Youth.</p>
                </div>
              </div>
            </div>
          </div>

          {/* APPLICATION FORM */}
          <div className="join-form-wrapper" style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            {isSubmitted ? (
            <div className="join-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary-blue)' }}>
                <CheckCircle2 style={{ width: 36, height: 36 }} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1F2937' }}>Application Received!</h2>
              <p style={{ fontSize: '0.9375rem', color: '#4B5563', maxWidth: '28rem', margin: '0.75rem auto 2rem', lineHeight: 1.6 }}>
                Thank you, <strong>{formData.name}</strong>! Your application for <strong>{selectedUnitObj?.name || 'MAGIC Youth'}</strong> has been submitted.
                {formData.membershipType === 'LEADERSHIP' ? (
                  <span style={{ display: 'block', marginTop: '0.5rem', color: '#0369A1', fontWeight: 600 }}>
                    Your nomination for <strong>{formData.preferredLeadershipRole}</strong> has been logged for the chapter election &amp; selection process.
                  </span>
                ) : (
                  <span style={{ display: 'block', marginTop: '0.5rem' }}>
                    Our chapter coordinators will review your membership and contact you with onboarding details.
                  </span>
                )}
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStep(1);
                  setFormData({
                    name: '', email: '', phone: '', gender: 'Male', dob: '',
                    college: '', department: '', year: '1st Year', city: '',
                    unitId: units[0]?._id || units[0]?.id || '',
                    membershipType: 'MEMBER', preferredLeadershipRole: 'First Lead',
                    skills: [], interests: [], previousExperience: '', reason: ''
                  });
                  setFiles({ resume: null, profileImage: null });
                }}
                className="btn-primary"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <div className="join-card">
              {/* Stepper Bar */}
              <div className="stepper-bar">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {steps.map(s => {
                    let stateClass = 'inactive';
                    if (currentStep === s.num) stateClass = 'active';
                    else if (currentStep > s.num) stateClass = 'completed';

                    return (
                      <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <div className={`stepper-step ${stateClass}`}>
                          {currentStep > s.num ? '✓' : s.num}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: currentStep === s.num ? 700 : 500, color: currentStep === s.num ? 'var(--primary-blue)' : '#6B7280' }}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                {errorMsg && (
                  <div style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.84375rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {/* STEP 1: Personal & Unit Selection */}
                  {currentStep === 1 && (
                    <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.25rem' }}>Step 1: Membership Type &amp; Personal Info</h3>
                      
                      {/* Unit Selection */}
                      <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '0.75rem', border: '1.5px solid #E2E8F0' }}>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                          Select Target Unit / Chapter *
                        </label>
                        {units.length > 0 ? (
                          <select name="unitId" value={formData.unitId} onChange={handleChange} className="join-input" style={{ fontWeight: 600, backgroundColor: '#FFFFFF' }} required>
                            {units.map(u => (
                              <option key={u._id || u.id} value={u._id || u.id}>
                                {u.name} {u.institution ? `(${u.institution})` : ''} {u.isDefault || u.is_default ? '★ (Default Unit)' : ''}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>Loading active chapters...</div>
                        )}
                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '0.35rem' }}>
                          Applications are only accepted for currently active MAGIC Youth collegiate units.
                        </span>
                      </div>

                      {/* Membership Type Selector */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                          Membership Type *
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <button
                            type="button"
                            onClick={() => setFormData(f => ({ ...f, membershipType: 'MEMBER' }))}
                            style={{
                              padding: '1rem',
                              borderRadius: '0.75rem',
                              border: `2px solid ${formData.membershipType === 'MEMBER' ? '#0284C7' : '#E2E8F0'}`,
                              backgroundColor: formData.membershipType === 'MEMBER' ? '#EFF6FF' : '#FFFFFF',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.35rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: formData.membershipType === 'MEMBER' ? '#0284C7' : '#374151' }}>
                                ○ MEMBER
                              </span>
                              {formData.membershipType === 'MEMBER' && <CheckCircle2 size={16} color="#0284C7" />}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              Join as an active general member participating in events &amp; volunteering.
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormData(f => ({ ...f, membershipType: 'LEADERSHIP' }))}
                            style={{
                              padding: '1rem',
                              borderRadius: '0.75rem',
                              border: `2px solid ${formData.membershipType === 'LEADERSHIP' ? '#E11D48' : '#E2E8F0'}`,
                              backgroundColor: formData.membershipType === 'LEADERSHIP' ? '#FFF1F2' : '#FFFFFF',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.35rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: formData.membershipType === 'LEADERSHIP' ? '#E11D48' : '#374151' }}>
                                ★ LEADERSHIP
                              </span>
                              {formData.membershipType === 'LEADERSHIP' && <Crown size={16} color="#E11D48" />}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              Nominate yourself for consideration in chapter leadership roles.
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Leadership Role Options & Notice (If Leadership chosen) */}
                      {formData.membershipType === 'LEADERSHIP' && (
                        <div style={{ backgroundColor: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: '0.875rem', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#C2410C', fontWeight: 800, fontSize: '0.875rem' }}>
                            <Crown size={18} /> PREFERRED LEADERSHIP ROLE (NOMINATION)
                          </div>
                          
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#431407', marginBottom: '0.375rem' }}>
                              Select Preferred Role *
                            </label>
                            <select
                              name="preferredLeadershipRole"
                              value={formData.preferredLeadershipRole}
                              onChange={handleChange}
                              className="join-input"
                              style={{ backgroundColor: '#FFFFFF', fontWeight: 600 }}
                              required
                            >
                              {leadershipRoles.map((r, idx) => (
                                <option key={idx} value={r}>{idx + 1}. {r}</option>
                              ))}
                            </select>
                          </div>

                          {/* Important Nomination Advisory */}
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #FDBA74', fontSize: '0.78125rem', color: '#9A3412', lineHeight: 1.5 }}>
                            <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#EA580C' }} />
                            <div>
                              <strong>Leadership Nomination Notice:</strong> Selecting a leadership role indicates your interest and nomination for the chapter election &amp; selection process. It is <em>not</em> an automatic appointment. Final roles are officially designated by the administration following interview/selection. If not assigned a leadership post, your application remains active for regular membership.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Personal Contact Inputs */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Full Name *</label>
                          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Ananya Rao" className="join-input" required />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Email Address *</label>
                          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" className="join-input" required />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Phone Number *</label>
                          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="join-input" required />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="join-input">
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="join-input" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Academic */}
                  {currentStep === 2 && (
                    <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem' }}>Step 2: Academic Details</h3>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>College / Institution *</label>
                        <input type="text" name="college" value={formData.college} onChange={handleChange} placeholder="e.g. Loyola College" className="join-input" required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Department / Branch *</label>
                        <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science and Engineering" className="join-input" required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Year of Study</label>
                          <select name="year" value={formData.year} onChange={handleChange} className="join-input">
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Postgraduate">Postgraduate</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>City / Location *</label>
                          <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Vijayawada" className="join-input" required />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Skills */}
                  {currentStep === 3 && (
                    <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.25rem' }}>Step 3: Skills &amp; Capabilities</h3>
                      <p style={{ fontSize: '0.84375rem', color: '#6B7280' }}>Select all skills you can contribute to MAGIC Youth events *</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {skillOptions.map(skill => {
                          const selected = formData.skills.includes(skill);
                          return (
                            <button
                              type="button"
                              key={skill}
                              onClick={() => toggleOption('skills', skill)}
                              className={`join-option-chip ${selected ? 'selected' : ''}`}
                            >
                              {selected ? '✓ ' : '+ '}{skill}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: Interests */}
                  {currentStep === 4 && (
                    <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.25rem' }}>Step 4: Areas of Interest</h3>
                      <p style={{ fontSize: '0.84375rem', color: '#6B7280' }}>Select event categories you wish to participate in</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {interestOptions.map(interest => {
                          const selected = formData.interests.includes(interest);
                          return (
                            <button
                              type="button"
                              key={interest}
                              onClick={() => toggleOption('interests', interest)}
                              className={`join-option-chip ${selected ? 'selected' : ''}`}
                            >
                              {selected ? '✓ ' : '+ '}{interest}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 5: Motivation */}
                  {currentStep === 5 && (
                    <motion.div key="step5" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem' }}>Step 5: Motivation Statement</h3>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>
                          Why do you want to join MAGIC Youth? *
                        </label>
                        <textarea
                          name="reason"
                          value={formData.reason}
                          onChange={handleChange}
                          rows="4"
                          placeholder="Tell us what drives you to join our youth movement..."
                          className="join-input"
                          style={{ resize: 'none' }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>
                          Previous Volunteering / Leadership Experience (Optional)
                        </label>
                        <textarea
                          name="previousExperience"
                          value={formData.previousExperience}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Past community service, student clubs, or organizing experience..."
                          className="join-input"
                          style={{ resize: 'none' }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 6: Uploads */}
                  {currentStep === 6 && (
                    <motion.div key="step6" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.25rem' }}>Step 6: Document Uploads</h3>
                      <p style={{ fontSize: '0.84375rem', color: '#6B7280' }}>Upload your profile picture and resume for coordinator review.</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ border: '1px dashed #D1D5DB', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', backgroundColor: '#F8F7FC' }}>
                          <ImageIcon style={{ width: 32, height: 32, color: 'var(--primary-blue)', margin: '0 auto 0.5rem' }} />
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1F2937' }}>Profile Photo</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.25rem 0 1rem' }}>JPG or PNG format</div>
                          <label className="btn-secondary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                            Choose File
                            <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                          </label>
                          {files.profileImage && (
                            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, marginTop: '0.5rem' }}>✓ {files.profileImage.name}</div>
                          )}
                        </div>

                        <div style={{ border: '1px dashed #D1D5DB', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', backgroundColor: '#F8F7FC' }}>
                          <FileUp style={{ width: 32, height: 32, color: 'var(--primary-blue)', margin: '0 auto 0.5rem' }} />
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1F2937' }}>Resume / CV</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.25rem 0 1rem' }}>PDF format only</div>
                          <label className="btn-secondary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                            Choose File
                            <input type="file" name="resume" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                          </label>
                          {files.resume && (
                            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, marginTop: '0.5rem' }}>✓ {files.resume.name}</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 7: Review */}
                  {currentStep === 7 && (
                    <motion.div key="step7" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.25rem' }}>Step 7: Review &amp; Submit</h3>
                      <p style={{ fontSize: '0.84375rem', color: '#6B7280', marginBottom: '1rem' }}>Please verify your details before final submission.</p>

                      <div style={{ backgroundColor: '#F8F7FC', border: '1px solid #E5E7EB', borderRadius: '1rem', padding: '1.25rem', fontSize: '0.84375rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div><strong>Selected Unit:</strong> {selectedUnitObj?.name || 'MAGIC Youth'}</div>
                        <div>
                          <strong>Membership Type:</strong>{' '}
                          <span style={{ fontWeight: 800, color: formData.membershipType === 'LEADERSHIP' ? '#E11D48' : '#0284C7' }}>
                            {formData.membershipType === 'LEADERSHIP' ? '★ LEADERSHIP NOMINATION' : '● REGULAR MEMBER'}
                          </span>
                        </div>
                        {formData.membershipType === 'LEADERSHIP' && (
                          <div><strong>Preferred Leadership Role:</strong> <span style={{ fontWeight: 700, color: '#C2410C' }}>{formData.preferredLeadershipRole}</span> (Nomination)</div>
                        )}
                        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '0.5rem 0' }} />
                        <div><strong>Name:</strong> {formData.name} ({formData.gender})</div>
                        <div><strong>Email:</strong> {formData.email}</div>
                        <div><strong>Phone:</strong> {formData.phone}</div>
                        <div><strong>College:</strong> {formData.college}</div>
                        <div><strong>Department:</strong> {formData.department} ({formData.year})</div>
                        <div><strong>City:</strong> {formData.city}</div>
                        <div><strong>Skills:</strong> {formData.skills.join(', ') || 'None selected'}</div>
                        <div><strong>Interests:</strong> {formData.interests.join(', ') || 'None selected'}</div>
                        <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#4B5563' }}>"{formData.reason}"</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #E5E7EB' }}>
                  {currentStep > 1 ? (
                    <button type="button" onClick={prevStep} className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem' }}>
                      ← Back
                    </button>
                  ) : <div />}

                  {currentStep < 7 ? (
                    <button type="button" onClick={nextStep} className="btn-primary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.8125rem' }}>
                      Next Step →
                    </button>
                  ) : (
                    <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.875rem' }}>
                      {isSubmitting ? 'Submitting...' : formData.membershipType === 'LEADERSHIP' ? 'Submit Leadership Nomination' : 'Submit Membership Application'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      </section>
    </div>
  );
}

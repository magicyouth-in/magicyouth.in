import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle2, ArrowRight, ArrowLeft,
  User, GraduationCap, Wrench, MessageSquare, AlertCircle,
  FileUp, Image as ImageIcon, ClipboardList, Loader2, Sparkles,
  Building2, Award, Heart, Users, ShieldAlert, Crown, RefreshCw
} from 'lucide-react';
import '../styles/about.css';
import '../styles/join.css';

const DEFAULT_LEADERSHIP_ROLES = [
  'First Lead',
  'Second Lead',
  'Secretary',
  'Deputy Secretary',
  'Procurator',
  'Social Media Coordinator',
  'Event Coordinator',
  'Volunteer Coordinator',
  'Cultural Coordinator',
  'Communication Coordinator'
];

/** SessionStorage cache key and configuration for public chapter metadata */
const CHAPTERS_CACHE_KEY = 'magic_youth_public_chapters_cache';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache validity
const FETCH_TIMEOUT_MS = 6000; // 6-second request timeout safeguard
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB maximum upload limit matching backend multer

/** Helper to safely retrieve cached public chapters from sessionStorage */
const getCachedChapters = () => {
  try {
    const raw = sessionStorage.getItem(CHAPTERS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.data) || parsed.data.length === 0) return null;
    if (typeof parsed.timestamp !== 'number') return null;
    const isStale = (Date.now() - parsed.timestamp) > CACHE_TTL_MS;
    return { data: parsed.data, isStale };
  } catch (e) {
    try { sessionStorage.removeItem(CHAPTERS_CACHE_KEY); } catch (_) {}
    return null;
  }
};

/** Helper to safely store public chapter metadata in sessionStorage */
const setCachedChapters = (data) => {
  try {
    if (Array.isArray(data) && data.length > 0) {
      sessionStorage.setItem(CHAPTERS_CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        // Store only non-sensitive public chapter attributes
        data: data.map(u => ({
          _id: u._id || u.id,
          id: u.id || u._id,
          name: u.name,
          institution: u.institution || '',
          isDefault: !!(u.isDefault || u.is_default),
          is_default: !!(u.isDefault || u.is_default),
          status: u.status || 'Active'
        }))
      }));
    }
  } catch (e) {
    // Gracefully handle private browsing or quota limitations
  }
};

export default function JoinUs() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Initialize with cached chapters if available for instantaneous display
  const [units, setUnits] = useState(() => {
    const cached = getCachedChapters();
    return cached && cached.data.length > 0 ? cached.data : [];
  });
  const [unitsLoading, setUnitsLoading] = useState(() => {
    const cached = getCachedChapters();
    return !(cached && cached.data.length > 0);
  });
  const [unitsError, setUnitsError] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [leadershipRoles, setLeadershipRoles] = useState(DEFAULT_LEADERSHIP_ROLES);

  const unitsAbortControllerRef = useRef(null);

  const loadUnits = useCallback(async (force = false) => {
    // Cancel any prior in-flight request to prevent duplicate network calls
    if (unitsAbortControllerRef.current) {
      unitsAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    unitsAbortControllerRef.current = controller;

    if (force) {
      setUnitsLoading(true);
      setUnitsError(false);
    } else {
      const cached = getCachedChapters();
      if (cached && cached.data.length > 0) {
        setUnits(cached.data);
        setUnitsLoading(false);
        setUnitsError(false);
        setIsRevalidating(true);

        const def = cached.data.find(u => u.isDefault || u.is_default) || cached.data[0];
        if (def) {
          setFormData(prev => ({
            ...prev,
            unitId: prev.unitId || def._id || def.id,
            college: prev.college || def.institution || ''
          }));
        }
      } else {
        setUnitsLoading(true);
        setUnitsError(false);
      }
    }

    const executeFetchAttempt = async () => {
      const timeoutController = new AbortController();
      const timer = setTimeout(() => timeoutController.abort(), FETCH_TIMEOUT_MS);

      const onAbort = () => timeoutController.abort();
      controller.signal.addEventListener('abort', onAbort);

      try {
        const res = await fetch('/api/units?includeInactive=false', {
          signal: timeoutController.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        clearTimeout(timer);
        throw err;
      } finally {
        controller.signal.removeEventListener('abort', onAbort);
      }
    };

    try {
      let data = null;
      try {
        data = await executeFetchAttempt();
      } catch (firstErr) {
        if (controller.signal.aborted) return;
        console.warn('[JOIN UNITS] Primary request failed or timed out, executing 1 automatic retry...', firstErr.message);
        // Brief pause before single automatic retry
        await new Promise(r => setTimeout(r, 1000));
        if (controller.signal.aborted) return;
        data = await executeFetchAttempt();
      }

      if (controller.signal.aborted) return;

      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        // Normalize active units (case-insensitive)
        const activeList = data.data.filter(u => {
          const s = String(u.status || '').toLowerCase();
          return s === 'active' || s === '';
        });

        const finalUnits = activeList.length > 0 ? activeList : data.data;
        setUnits(finalUnits);
        setCachedChapters(finalUnits);
        setUnitsError(false);

        // Preselect default unit if form doesn't have one
        const def = finalUnits.find(u => u.isDefault || u.is_default) || finalUnits[0];
        if (def) {
          setFormData(prev => ({
            ...prev,
            unitId: prev.unitId || def._id || def.id,
            college: prev.college || def.institution || ''
          }));
        }
      } else {
        setUnits([]);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error('[JOIN UNITS LOAD ERROR]', err);
      // Only display full error state if we don't have any cached units displayed
      setUnits(prev => {
        if (!prev || prev.length === 0) {
          setUnitsError(true);
        }
        return prev;
      });
    } finally {
      if (!controller.signal.aborted) {
        setUnitsLoading(false);
        setIsRevalidating(false);
      }
    }
  }, []);

  useEffect(() => {
    loadUnits();

    // Fetch Leadership Roles with abort cleanup
    const rolesController = new AbortController();
    fetch('/api/leadership-roles', { signal: rolesController.signal })
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data) && d.data.length > 0) {
          setLeadershipRoles(d.data.map(r => r.name));
        }
      })
      .catch(() => {});

    return () => {
      if (unitsAbortControllerRef.current) {
        unitsAbortControllerRef.current.abort();
      }
      rolesController.abort();
    };
  }, [loadUnits]);

  const [formData, setFormData] = useState(() => {
    const cached = getCachedChapters();
    const def = cached?.data?.find(u => u.isDefault || u.is_default) || cached?.data?.[0];
    return {
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      dob: '',
      college: def?.institution || '',
      department: '',
      year: '1st Year',
      city: '',
      unitId: def?._id || def?.id || '',
      membershipType: 'MEMBER', // 'MEMBER' | 'LEADERSHIP'
      preferredLeadershipRole: 'First Lead',
      skills: [],
      interests: [],
      previousExperience: '',
      reason: '',
    };
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
    setErrorMsg('');
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles?.[0];
    if (!file) return;

    // 1. File Size Validation (<= 10MB limit matching server multer)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const label = name === 'profileImage' ? 'Profile photo' : 'Resume / CV';
      setErrorMsg(`${label} (${sizeMb} MB) exceeds the maximum allowed size of 10 MB. Please select a smaller file.`);
      e.target.value = '';
      setFiles(prev => ({ ...prev, [name]: null }));
      return;
    }

    // 2. File Type Validation
    if (name === 'profileImage') {
      const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);
      if (!isImage) {
        setErrorMsg('Please upload a valid image file (JPG, PNG, or WebP) for your profile photo.');
        e.target.value = '';
        setFiles(prev => ({ ...prev, [name]: null }));
        return;
      }
    } else if (name === 'resume') {
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      if (!isPdf) {
        setErrorMsg('Please upload your resume in PDF format (.pdf).');
        e.target.value = '';
        setFiles(prev => ({ ...prev, [name]: null }));
        return;
      }
    }

    setFiles(prev => ({ ...prev, [name]: file }));
  };

  const validateStep = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
        setErrorMsg('Please fill in your contact information (Name, Email, Phone).');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        setErrorMsg('Please enter a valid email address.');
        return false;
      }
      if (formData.phone.trim().replace(/\D/g, '').length < 7) {
        setErrorMsg('Please enter a valid phone number.');
        return false;
      }
      if (unitsLoading && units.length === 0) {
        setErrorMsg('Loading active chapters. Please wait a moment before proceeding.');
        return false;
      }
      if ((unitsError || units.length === 0) && !formData.unitId) {
        setErrorMsg('Collegiate chapters must be loaded before you can proceed. Please click Retry.');
        return false;
      }
      if (!formData.unitId) {
        setErrorMsg('Please select your target MAGIC Youth chapter.');
        return false;
      }
      const matchingUnit = units.find(u => (u._id || u.id) === formData.unitId);
      if (!matchingUnit && units.length > 0) {
        setErrorMsg('Selected chapter is invalid. Please select an active chapter.');
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
      if (!Array.isArray(formData.skills) || formData.skills.length === 0) {
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
    if (currentStep === 6) {
      if (files.profileImage && files.profileImage.size > MAX_FILE_SIZE) {
        setErrorMsg('Profile photo exceeds the 10 MB limit. Please select a smaller file.');
        return false;
      }
      if (files.resume && files.resume.size > MAX_FILE_SIZE) {
        setErrorMsg('Resume exceeds the 10 MB limit. Please select a smaller file.');
        return false;
      }
    }
    return true;
  };

  /** Comprehensive validator verifying all registration steps before final submission */
  const validateAllSteps = () => {
    setErrorMsg('');
    // Step 1
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg('Please complete your contact details (Name, Email, Phone) in Step 1.');
      setCurrentStep(1);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setErrorMsg('Please provide a valid email address in Step 1.');
      setCurrentStep(1);
      return false;
    }
    if (formData.phone.trim().replace(/\D/g, '').length < 7) {
      setErrorMsg('Please provide a valid phone number in Step 1.');
      setCurrentStep(1);
      return false;
    }
    if (!formData.unitId) {
      setErrorMsg('Please select your target Collegiate Chapter in Step 1.');
      setCurrentStep(1);
      return false;
    }
    if (units.length > 0 && !units.some(u => (u._id || u.id) === formData.unitId)) {
      setErrorMsg('The selected chapter is not recognized. Please choose from active chapters in Step 1.');
      setCurrentStep(1);
      return false;
    }
    if (formData.membershipType === 'LEADERSHIP' && !formData.preferredLeadershipRole) {
      setErrorMsg('Please select your preferred leadership role in Step 1.');
      setCurrentStep(1);
      return false;
    }
    // Step 2
    if (!formData.college.trim() || !formData.department.trim() || !formData.city.trim()) {
      setErrorMsg('Please complete your academic details (College, Department, City) in Step 2.');
      setCurrentStep(2);
      return false;
    }
    // Step 3
    if (!Array.isArray(formData.skills) || formData.skills.length === 0) {
      setErrorMsg('Please select at least one skill in Step 3.');
      setCurrentStep(3);
      return false;
    }
    // Step 5
    if (!formData.reason.trim()) {
      setErrorMsg('Please state your motivation for joining in Step 5.');
      setCurrentStep(5);
      return false;
    }
    // Step 6 files validation
    if (files.profileImage && files.profileImage.size > MAX_FILE_SIZE) {
      setErrorMsg('Profile photo exceeds 10 MB limit. Please re-upload in Step 6.');
      setCurrentStep(6);
      return false;
    }
    if (files.resume && files.resume.size > MAX_FILE_SIZE) {
      setErrorMsg('Resume exceeds 10 MB limit. Please re-upload in Step 6.');
      setCurrentStep(6);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
      window.scrollTo({ top: 160, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 160, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateAllSteps()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const bodyData = new FormData();
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          bodyData.append(key, JSON.stringify(formData[key]));
        } else {
          bodyData.append(key, formData[key] ?? '');
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
        setErrorMsg(data.message || 'Failed to submit application. Please verify your details and try again.');
      }
    } catch {
      setErrorMsg('Network error. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Type & Unit' },
    { num: 2, label: 'Academic' },
    { num: 3, label: 'Skills' },
    { num: 4, label: 'Interests' },
    { num: 5, label: 'Motivation' },
    { num: 6, label: 'Uploads' },
    { num: 7, label: 'Review' }
  ];

  const selectedUnitObj = units.find(u => (u._id || u.id) === formData.unitId);

  return (
    <div>
      {/* ── 1. REFINED HERO SECTION ── */}
      <section className="join-hero-section">
        <div className="join-hero-content">
          <span className="join-eyebrow">
            <span style={{ color: 'var(--primary-pink)', fontSize: '0.9rem' }}>●</span> YES-J &bull; MAGIC YOUTH MEMBERSHIP
          </span>
          <h1 className="join-title">
            Become a Member of MAGIC Youth
          </h1>
          <p className="join-subtitle">
            Join a campus-based collegiate movement forming student leaders of conscience, compassion, and commitment across our chartered collegiate chapters.
          </p>
        </div>
      </section>

      {/* ── 2. MAIN APPLICATION CONTENT ── */}
      <section className="join-main-section">
        <div className="join-layout-grid">
          
          {/* ── LEFT SIDEBAR: INSTITUTIONAL CONTEXT ── */}
          <aside className="join-sidebar-card">
            <h2 className="join-sidebar-heading">Chapter Membership</h2>
            
            <div className="join-sidebar-list">
              <div className="join-sidebar-item">
                <div className="join-sidebar-icon-wrap">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="join-sidebar-item-title">Student Leadership Formation</h3>
                  <p className="join-sidebar-item-desc">
                    Develop practical organizational governance, team coordination, and student committee leadership skills.
                  </p>
                </div>
              </div>
              
              <div className="join-sidebar-item">
                <div className="join-sidebar-icon-wrap" style={{ backgroundColor: '#FFF1F2', color: 'var(--primary-pink)' }}>
                  <Heart size={18} />
                </div>
                <div>
                  <h3 className="join-sidebar-item-title">Grassroots Social Action</h3>
                  <p className="join-sidebar-item-desc">
                    Lead structured community service drives, literacy tutoring, and campus environmental initiatives.
                  </p>
                </div>
              </div>

              <div className="join-sidebar-item">
                <div className="join-sidebar-icon-wrap" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="join-sidebar-item-title">Inter-Collegiate Network</h3>
                  <p className="join-sidebar-item-desc">
                    Collaborate with student leaders, animators, and coordinators across chartered collegiate chapters.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0', fontSize: '0.78125rem', color: '#64748B', lineHeight: 1.5 }}>
              Applications are reviewed unit-wise by chapter coordinators upon submission.
            </div>
          </aside>

          {/* ── RIGHT MAIN: APPLICATION FORM ── */}
          <main className="join-form-card">
            {isSubmitted ? (
              <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Application Submitted
                </h2>
                <p style={{ fontSize: '0.9375rem', color: '#475569', maxWidth: '30rem', margin: '0.75rem auto 1.75rem', lineHeight: 1.6 }}>
                  Thank you, <strong>{formData.name}</strong>. Your membership application for <strong>{selectedUnitObj?.name || 'MAGIC Youth'}</strong> has been received.
                  {formData.membershipType === 'LEADERSHIP' ? (
                    <span style={{ display: 'block', marginTop: '0.5rem', color: '#0369A1', fontWeight: 600 }}>
                      Your nomination for <strong>{formData.preferredLeadershipRole}</strong> has been forwarded to the chapter selection committee.
                    </span>
                  ) : (
                    <span style={{ display: 'block', marginTop: '0.5rem' }}>
                      Your chapter coordinators will review your details and contact you with onboarding information.
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
                  style={{ backgroundColor: 'var(--primary-blue)', color: '#FFFFFF', padding: '0.625rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <div>
                {/* Stepper Header */}
                <div className="join-stepper-wrapper">
                  {/* Mobile Stepper Pill */}
                  <div className="join-stepper-mobile">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>
                      <span>Step {currentStep} of {steps.length}</span>
                      <span style={{ color: 'var(--primary-blue)' }}>{steps[currentStep - 1].label}</span>
                    </div>
                    <div className="join-stepper-progress-bar">
                      <div className="join-stepper-progress-fill" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
                    </div>
                  </div>

                  {/* Desktop Stepper */}
                  <div className="join-stepper-desktop">
                    {steps.map((s) => {
                      let state = 'inactive';
                      if (currentStep === s.num) state = 'active';
                      else if (currentStep > s.num) state = 'completed';

                      return (
                        <div key={s.num} className="join-step-item">
                          <div className={`join-step-bubble ${state}`}>
                            {currentStep > s.num ? '✓' : s.num}
                          </div>
                          <span className={`join-step-label ${state}`}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="join-form-body">
                  {errorMsg && (
                    <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: '#FFF1F2', border: '1px solid #FDA4AF', color: '#BE123C', fontSize: '0.84375rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* ── STEP 1: Membership Type & Unit Selection ── */}
                  {currentStep === 1 && (
                    <div>
                      <h3 className="join-form-step-title">Step 1: Chapter &amp; Membership Selection</h3>
                      
                      {/* Unit Selection */}
                      <div className="join-field-group">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <label className="join-label" style={{ marginBottom: 0 }}>Select Collegiate Chapter / Unit *</label>
                          {isRevalidating && (
                            <span style={{ fontSize: '0.72rem', color: '#0284C7', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Loader2 size={11} className="animate-spin" /> Syncing chapters...
                            </span>
                          )}
                        </div>

                        {unitsLoading && units.length === 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6875rem 0.875rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.5rem', color: '#64748B', fontSize: '0.84375rem' }}>
                            <Loader2 size={16} className="animate-spin" color="var(--primary-blue)" />
                            <span>Loading active chapters from database...</span>
                          </div>
                        ) : unitsError && units.length === 0 ? (
                          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.8125rem', color: '#9A3412' }}>
                            <span>Unable to load chapters. Please verify your connection.</span>
                            <button
                              type="button"
                              onClick={() => loadUnits(true)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#FFFFFF', border: '1px solid #FDBA74', padding: '0.3rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: '#C2410C', cursor: 'pointer' }}
                            >
                              <RefreshCw size={12} /> Retry
                            </button>
                          </div>
                        ) : units.length === 0 ? (
                          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.8125rem', color: '#64748B' }}>
                            <span>No active collegiate chapters available at this time.</span>
                            <button
                              type="button"
                              onClick={() => loadUnits(true)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.3rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                            >
                              <RefreshCw size={12} /> Refresh
                            </button>
                          </div>
                        ) : (
                          <select name="unitId" value={formData.unitId} onChange={handleChange} className="join-input" required>
                            {!formData.unitId && <option value="" disabled>-- Select your Collegiate Chapter --</option>}
                            {units.map(u => (
                              <option key={u._id || u.id} value={u._id || u.id}>
                                {u.name} {u.institution ? `(${u.institution})` : ''} {u.isDefault || u.is_default ? '★ (Default Chapter)' : ''}
                              </option>
                            ))}
                          </select>
                        )}
                        <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                          Applications are accepted for all active chartered MAGIC Youth units.
                        </span>
                      </div>

                      {/* Membership Type Radio (Stacked on mobile, 2-col on desktop) */}
                      <div className="join-field-group" style={{ marginTop: '1rem' }}>
                        <label className="join-label">Membership Category *</label>
                        <div className="join-membership-cards-grid">
                          <button
                            type="button"
                            onClick={() => setFormData(f => ({ ...f, membershipType: 'MEMBER' }))}
                            style={{
                              padding: '0.875rem 1rem',
                              borderRadius: '0.5rem',
                              border: `1.5px solid ${formData.membershipType === 'MEMBER' ? 'var(--primary-blue)' : '#CBD5E1'}`,
                              backgroundColor: formData.membershipType === 'MEMBER' ? '#EFF6FF' : '#FFFFFF',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: formData.membershipType === 'MEMBER' ? 'var(--primary-blue)' : '#0F172A' }}>
                                ○ Regular Member
                              </span>
                              {formData.membershipType === 'MEMBER' && <CheckCircle2 size={16} color="var(--primary-blue)" />}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              Participate in chapter events, community projects, and workshops.
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormData(f => ({ ...f, membershipType: 'LEADERSHIP' }))}
                            style={{
                              padding: '0.875rem 1rem',
                              borderRadius: '0.5rem',
                              border: `1.5px solid ${formData.membershipType === 'LEADERSHIP' ? 'var(--primary-pink)' : '#CBD5E1'}`,
                              backgroundColor: formData.membershipType === 'LEADERSHIP' ? '#FFF1F2' : '#FFFFFF',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: formData.membershipType === 'LEADERSHIP' ? 'var(--primary-pink)' : '#0F172A' }}>
                                ★ Leadership Nomination
                              </span>
                              {formData.membershipType === 'LEADERSHIP' && <Crown size={16} color="var(--primary-pink)" />}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              Nominate for consideration in the chapter executive committee.
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Leadership Nomination Details & Advisory (If Leadership chosen) */}
                      {formData.membershipType === 'LEADERSHIP' && (
                        <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '0.5rem', padding: '1rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', boxSizing: 'border-box' }}>
                          <div>
                            <label className="join-label" style={{ color: '#9A3412' }}>Preferred Leadership Role *</label>
                            <select
                              name="preferredLeadershipRole"
                              value={formData.preferredLeadershipRole}
                              onChange={handleChange}
                              className="join-input"
                              style={{ backgroundColor: '#FFFFFF', marginTop: '0.25rem' }}
                              required
                            >
                              {leadershipRoles.map((r, idx) => (
                                <option key={idx} value={r}>{idx + 1}. {r}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', background: '#FFFFFF', padding: '0.625rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #FED7AA', fontSize: '0.78125rem', color: '#9A3412', lineHeight: 1.5 }}>
                            <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#EA580C' }} />
                            <div>
                              <strong>Nomination Notice:</strong> Selecting a leadership role indicates your nomination for the chapter election &amp; selection process. It is not an automatic appointment. Final roles are designated by the administration following evaluation. If not assigned a leadership post, your application remains active for regular membership.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Contact Fields */}
                      <div style={{ marginTop: '1.25rem' }}>
                        <div className="join-field-group">
                          <label className="join-label">Full Name *</label>
                          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Ananya Rao" className="join-input" required />
                        </div>
                        <div className="join-two-col-grid" style={{ marginBottom: '1.125rem' }}>
                          <div className="join-field-group" style={{ marginBottom: 0 }}>
                            <label className="join-label">Email Address *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" className="join-input" required />
                          </div>
                          <div className="join-field-group" style={{ marginBottom: 0 }}>
                            <label className="join-label">Phone Number *</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="join-input" required />
                          </div>
                        </div>
                        <div className="join-two-col-grid">
                          <div className="join-field-group" style={{ marginBottom: 0 }}>
                            <label className="join-label">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="join-input">
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="join-field-group" style={{ marginBottom: 0 }}>
                            <label className="join-label">Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="join-input" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 2: Academic Details ── */}
                  {currentStep === 2 && (
                    <div>
                      <h3 className="join-form-step-title">Step 2: Academic Details</h3>
                      <div className="join-field-group">
                        <label className="join-label">College / Educational Institution *</label>
                        <input type="text" name="college" value={formData.college} onChange={handleChange} placeholder="e.g. Loyola College" className="join-input" required />
                      </div>
                      <div className="join-field-group">
                        <label className="join-label">Department / Course of Study *</label>
                        <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science and Engineering" className="join-input" required />
                      </div>
                      <div className="join-two-col-grid">
                        <div className="join-field-group" style={{ marginBottom: 0 }}>
                          <label className="join-label">Year of Study</label>
                          <select name="year" value={formData.year} onChange={handleChange} className="join-input">
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Postgraduate">Postgraduate</option>
                          </select>
                        </div>
                        <div className="join-field-group" style={{ marginBottom: 0 }}>
                          <label className="join-label">City / Location *</label>
                          <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Vijayawada" className="join-input" required />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 3: Skills ── */}
                  {currentStep === 3 && (
                    <div>
                      <h3 className="join-form-step-title">Step 3: Skills &amp; Capabilities</h3>
                      <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '-0.75rem', marginBottom: '1rem' }}>
                        Select the skills you can contribute to chapter activities *
                      </p>
                      <div className="join-chips-grid">
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
                    </div>
                  )}

                  {/* ── STEP 4: Interests ── */}
                  {currentStep === 4 && (
                    <div>
                      <h3 className="join-form-step-title">Step 4: Areas of Interest</h3>
                      <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '-0.75rem', marginBottom: '1rem' }}>
                        Select the initiative categories you are interested in participating in
                      </p>
                      <div className="join-chips-grid">
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
                    </div>
                  )}

                  {/* ── STEP 5: Motivation Statement ── */}
                  {currentStep === 5 && (
                    <div>
                      <h3 className="join-form-step-title">Step 5: Motivation Statement</h3>
                      <div className="join-field-group">
                        <label className="join-label">Why do you want to join MAGIC Youth? *</label>
                        <textarea
                          name="reason"
                          value={formData.reason}
                          onChange={handleChange}
                          rows="4"
                          placeholder="State what motivates you to participate in our youth movement..."
                          className="join-input"
                          style={{ resize: 'vertical' }}
                          required
                        />
                      </div>
                      <div className="join-field-group">
                        <label className="join-label">Previous Volunteering / Leadership Experience (Optional)</label>
                        <textarea
                          name="previousExperience"
                          value={formData.previousExperience}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Mention any past campus clubs, NGO projects, or organizing experience..."
                          className="join-input"
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* ── STEP 6: Document Uploads ── */}
                  {currentStep === 6 && (
                    <div>
                      <h3 className="join-form-step-title">Step 6: Document Uploads</h3>
                      <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '-0.75rem', marginBottom: '1.25rem' }}>
                        Upload your profile photo and optional resume for coordinator review. Max file size: 10 MB per file.
                      </p>

                      <div className="join-upload-grid">
                        <div className="join-upload-box">
                          <ImageIcon size={28} color="var(--primary-blue)" style={{ margin: '0 auto 0.5rem' }} />
                          <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#0F172A' }}>Profile Photo</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.2rem 0 0.75rem' }}>JPG, PNG, or WebP (Max 10 MB)</div>
                          <label style={{ display: 'inline-block', padding: '0.4rem 0.875rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                            Choose File
                            <input type="file" name="profileImage" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
                          </label>
                          {files.profileImage && (
                            <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                              <span>✓ {files.profileImage.name} ({(files.profileImage.size / (1024 * 1024)).toFixed(1)} MB)</span>
                              <button
                                type="button"
                                onClick={() => setFiles(f => ({ ...f, profileImage: null }))}
                                style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="join-upload-box">
                          <FileUp size={28} color="var(--primary-blue)" style={{ margin: '0 auto 0.5rem' }} />
                          <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#0F172A' }}>Resume / CV (Optional)</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.2rem 0 0.75rem' }}>PDF format only (Max 10 MB)</div>
                          <label style={{ display: 'inline-block', padding: '0.4rem 0.875rem', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                            Choose File
                            <input type="file" name="resume" accept="application/pdf,.pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                          </label>
                          {files.resume && (
                            <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                              <span>✓ {files.resume.name} ({(files.resume.size / (1024 * 1024)).toFixed(1)} MB)</span>
                              <button
                                type="button"
                                onClick={() => setFiles(f => ({ ...f, resume: null }))}
                                style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── STEP 7: Review & Verification ── */}
                  {currentStep === 7 && (
                    <div>
                      <h3 className="join-form-step-title">Step 7: Review &amp; Submit</h3>
                      <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '-0.75rem', marginBottom: '1rem' }}>
                        Please verify your details before submitting your application.
                      </p>

                      <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.5rem', padding: '1rem 1.25rem', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                          <span style={{ color: '#64748B' }}>Target Chapter:</span>
                          <strong style={{ color: '#0F172A' }}>
                            {selectedUnitObj ? `${selectedUnitObj.name}${selectedUnitObj.institution ? ` (${selectedUnitObj.institution})` : ''}` : 'Not selected'}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                          <span style={{ color: '#64748B' }}>Membership Category:</span>
                          <strong style={{ color: formData.membershipType === 'LEADERSHIP' ? 'var(--primary-pink)' : 'var(--primary-blue)' }}>
                            {formData.membershipType === 'LEADERSHIP' ? '★ Leadership Nomination' : '● Regular Member'}
                          </strong>
                        </div>
                        {formData.membershipType === 'LEADERSHIP' && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                            <span style={{ color: '#64748B' }}>Preferred Role:</span>
                            <strong style={{ color: '#C2410C' }}>{formData.preferredLeadershipRole} (Nomination)</strong>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                          <span style={{ color: '#64748B' }}>Applicant Name:</span>
                          <strong style={{ color: '#0F172A' }}>{formData.name} ({formData.gender})</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                          <span style={{ color: '#64748B' }}>Email &amp; Phone:</span>
                          <span style={{ color: '#0F172A' }}>{formData.email} &bull; {formData.phone}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                          <span style={{ color: '#64748B' }}>Institution:</span>
                          <span style={{ color: '#0F172A' }}>{formData.college}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                          <span style={{ color: '#64748B' }}>Dept &amp; Year:</span>
                          <span style={{ color: '#0F172A' }}>{formData.department} ({formData.year})</span>
                        </div>
                        <div>
                          <span style={{ color: '#64748B', display: 'block', marginBottom: '0.2rem' }}>Motivation:</span>
                          <span style={{ color: '#334155', fontStyle: 'italic' }}>"{formData.reason}"</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Action Buttons */}
                  <div className="join-form-actions">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="btn-secondary"
                        style={{ padding: '0.55rem 1.125rem', fontSize: '0.8125rem', cursor: 'pointer', borderRadius: '0.375rem' }}
                      >
                        ← Previous
                      </button>
                    ) : <div />}

                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="btn-primary"
                        style={{ padding: '0.55rem 1.375rem', fontSize: '0.8125rem', cursor: 'pointer', borderRadius: '0.375rem', backgroundColor: 'var(--primary-blue)', color: '#FFFFFF', border: 'none', fontWeight: 700 }}
                      >
                        Next Step →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{
                          padding: '0.625rem 1.75rem',
                          fontSize: '0.875rem',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          opacity: isSubmitting ? 0.7 : 1,
                          borderRadius: '0.375rem',
                          backgroundColor: 'var(--primary-blue)',
                          color: '#FFFFFF',
                          border: 'none',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        {isSubmitting ? 'Submitting Application...' : formData.membershipType === 'LEADERSHIP' ? 'Submit Leadership Nomination' : 'Submit Membership Application'}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}

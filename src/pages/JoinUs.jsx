import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartHandshake, CheckCircle2, ArrowRight, ArrowLeft,
  User, GraduationCap, Wrench, MessageSquare, AlertCircle,
  FileUp, Image as ImageIcon, ClipboardList, Loader2, Sparkles,
  Building2
} from 'lucide-react';
import '../styles/about.css';
import '../styles/join.css';

const fadeUp = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function JoinUs() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetch('/api/units').then(r => r.json()).then(d => { if (d.success) setUnits(d.data || []); }).catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    college: 'Andhra Loyola Institute of Engineering and Technology',
    department: 'Computer Science and Engineering',
    year: '3rd Year',
    city: 'Vijayawada',
    unitId: '',
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
    setFormData(prev => ({ ...prev, [name]: value }));
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
        setErrorMsg('Please fill in all required fields (Name, Email, Phone).');
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
    { num: 1, label: 'Personal', icon: User },
    { num: 2, label: 'Academic', icon: GraduationCap },
    { num: 3, label: 'Skills', icon: Wrench },
    { num: 4, label: 'Interests', icon: Sparkles },
    { num: 5, label: 'Motivation', icon: MessageSquare },
    { num: 6, label: 'Uploads', icon: FileUp },
    { num: 7, label: 'Review', icon: ClipboardList }
  ];

  return (
    <div>
      {/* ── JOIN HERO ───────────────────────────────────────────── */}
      <section className="join-hero">
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <span className="about-badge">Membership Application</span>
          <h1 className="about-title">Join <span className="highlight">MAGIC Youth</span></h1>
          <p className="about-lead">
            Apply to become an active student volunteer, coordinator, and community leader.
          </p>
        </div>
      </section>

      {/* ── FORM CONTAINER ──────────────────────────────────────── */}
      <section className="join-section">
        <div className="join-container">
          {isSubmitted ? (
            <div className="join-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#5B21B6' }}>
                <CheckCircle2 style={{ width: 36, height: 36 }} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1F2937' }}>Application Received!</h2>
              <p style={{ fontSize: '0.9375rem', color: '#4B5563', maxWidth: '28rem', margin: '0.75rem auto 2rem', lineHeight: 1.6 }}>
                Thank you, <strong>{formData.name}</strong>! Your application has been submitted successfully. Our student coordinators will contact you shortly.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStep(1);
                  setFormData({
                    name: '', email: '', phone: '', gender: 'Male', dob: '',
                    college: 'Andhra Loyola Institute of Engineering and Technology',
                    department: 'Computer Science and Engineering', year: '3rd Year', city: 'Vijayawada',
                    unitId: '', skills: [], interests: [], previousExperience: '', reason: ''
                  });
                  setFiles({ resume: null, profileImage: null });
                }}
                className="btn-primary-purple"
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
                        <span style={{ fontSize: '0.75rem', fontWeight: currentStep === s.num ? 700 : 500, color: currentStep === s.num ? '#5B21B6' : '#6B7280' }}>
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
                  {/* STEP 1: Personal */}
                  {currentStep === 1 && (
                    <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem' }}>Step 1: Personal Details</h3>
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
                    </motion.div>
                  )}

                  {/* STEP 2: Academic */}
                  {currentStep === 2 && (
                    <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem' }}>Step 2: Academic Details</h3>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>College / Institution *</label>
                        <input type="text" name="college" value={formData.college} onChange={handleChange} className="join-input" required />
                      </div>
                      {units.length > 0 && (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Target Unit (Select preferred unit)</label>
                          <select name="unitId" value={formData.unitId} onChange={handleChange} className="join-input">
                            <option value="">Any / General Membership</option>
                            {units.map(u => (
                              <option key={u._id} value={u._id}>{u.name} {u.institution ? `— ${u.institution}` : ''}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Department *</label>
                        <input type="text" name="department" value={formData.department} onChange={handleChange} className="join-input" required />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Year of Study</label>
                          <select name="year" value={formData.year} onChange={handleChange} className="join-input">
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>City *</label>
                          <input type="text" name="city" value={formData.city} onChange={handleChange} className="join-input" required />
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
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Why do you want to join MAGIC Youth? *</label>
                        <textarea
                          name="reason"
                          value={formData.reason}
                          onChange={handleChange}
                          rows="4"
                          placeholder="Tell us what drives you to join our movement..."
                          className="join-input"
                          style={{ resize: 'none' }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '0.375rem' }}>Previous Volunteering / Leadership Experience</label>
                        <textarea
                          name="previousExperience"
                          value={formData.previousExperience}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Past NGO work, campus events, or team projects..."
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
                          <ImageIcon style={{ width: 32, height: 32, color: '#5B21B6', margin: '0 auto 0.5rem' }} />
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1F2937' }}>Profile Photo</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.25rem 0 1rem' }}>JPG or PNG format</div>
                          <label className="btn-secondary-outline" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                            Choose File
                            <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                          </label>
                          {files.profileImage && (
                            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, marginTop: '0.5rem' }}>✓ {files.profileImage.name}</div>
                          )}
                        </div>

                        <div style={{ border: '1px dashed #D1D5DB', borderRadius: '1rem', padding: '1.5rem', textAlign: 'center', backgroundColor: '#F8F7FC' }}>
                          <FileUp style={{ width: 32, height: 32, color: '#5B21B6', margin: '0 auto 0.5rem' }} />
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1F2937' }}>Resume / CV</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', margin: '0.25rem 0 1rem' }}>PDF format only</div>
                          <label className="btn-secondary-outline" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
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
                        <div><strong>Name:</strong> {formData.name}</div>
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
                    <button type="button" onClick={prevStep} className="btn-secondary-outline" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem' }}>
                      ← Back
                    </button>
                  ) : <div />}

                  {currentStep < 7 ? (
                    <button type="button" onClick={nextStep} className="btn-primary-purple" style={{ padding: '0.625rem 1.5rem', fontSize: '0.8125rem' }}>
                      Next Step →
                    </button>
                  ) : (
                    <button type="submit" disabled={isSubmitting} className="btn-primary-purple" style={{ padding: '0.75rem 2rem', fontSize: '0.875rem' }}>
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

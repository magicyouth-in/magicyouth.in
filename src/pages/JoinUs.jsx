import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartHandshake, CheckCircle2, ArrowRight, ArrowLeft,
  User, GraduationCap, Wrench, MessageSquare, AlertCircle,
  FileUp, Image as ImageIcon, ClipboardList, Loader2, Sparkles
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function JoinUs() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    } catch (err) {
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
      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="page-header px-4">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3.5 py-1 rounded-full border border-purple-500/25 mb-4">
            Join Our Ranks
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            MAGIC Youth <span className="gradient-text-purple">Application</span>
          </h1>
          <p className="mt-4 text-purple-200/65 text-sm max-w-xl mx-auto leading-relaxed">
            Apply to become an active volunteer coordinator and lead community initiatives, campaigns, and events.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="dark-glass-card p-10 text-center border-purple-500/40"
          >
            <div className="w-16 h-16 rounded-full bg-purple-900/60 border border-purple-400/40 text-purple-300 flex items-center justify-center mx-auto mb-6 shadow-purple-glow">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white">Application Received!</h2>
            <p className="mt-3 text-purple-200/70 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-white">{formData.name}</span>! Your volunteer request has been received. Our leadership coordinators will review your details and reach out within 5-7 days.
            </p>
            <div className="mt-8">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStep(1);
                  setFormData({
                    name: '', email: '', phone: '', gender: 'Male', dob: '',
                    college: 'Andhra Loyola Institute of Engineering and Technology',
                    department: 'Computer Science and Engineering', year: '3rd Year', city: 'Vijayawada',
                    skills: [], interests: [], previousExperience: '', reason: ''
                  });
                  setFiles({ resume: null, profileImage: null });
                }}
                className="btn-purple-glow font-bold px-6 py-2.5 rounded-full text-xs"
              >
                Submit New Application
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="dark-glass-card overflow-hidden border-purple-500/20">
            {/* Stepper Steps Tracker */}
            <div className="bg-slate-950/80 border-b border-purple-900/30 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3 max-w-2xl mx-auto">
                {steps.map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.num} className="flex items-center gap-1.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] transition ${
                        currentStep === s.num
                          ? 'bg-purple-600 text-white shadow-purple-glow border border-purple-400'
                          : currentStep > s.num
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-900/60 text-slate-500 border border-slate-800'
                      }`}>
                        {currentStep > s.num ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                      </div>
                      <span className={`hidden md:inline text-[10px] font-semibold ${
                        currentStep === s.num ? 'text-purple-300' : 'text-slate-500'
                      }`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-10">
              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* STEP 1: Personal Details */}
                {currentStep === 1 && (
                  <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="space-y-4">
                    <h3 className="text-base font-bold text-white border-b border-purple-900/30 pb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-400" /> Step 1: Personal Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-300 mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Ananya Rao"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-300 mb-1">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@example.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-300 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 9876543210"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-300 mb-1">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-300 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Academic Details */}
                {currentStep === 2 && (
                  <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="space-y-4">
                    <h3 className="text-base font-bold text-white border-b border-purple-900/30 pb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-purple-400" /> Step 2: Academic Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-300 mb-1">College / Institution *</label>
                        <input
                          type="text"
                          name="college"
                          value={formData.college}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-purple-300 mb-1">Department *</label>
                          <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-purple-300 mb-1">Year of Study *</label>
                          <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-purple-300 mb-1">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Skills */}
                {currentStep === 3 && (
                  <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="space-y-4">
                    <h3 className="text-base font-bold text-white border-b border-purple-900/30 pb-2 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-purple-400" /> Step 3: Select Your Skills
                    </h3>
                    <p className="text-xs text-purple-200/50 mb-4">Choose one or more areas where you excel or wish to contribute *</p>
                    <div className="flex flex-wrap gap-2.5">
                      {skillOptions.map(skill => {
                        const selected = formData.skills.includes(skill);
                        return (
                          <button
                            type="button"
                            key={skill}
                            onClick={() => toggleOption('skills', skill)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                              selected
                                ? 'btn-purple-glow text-white border-purple-400'
                                : 'bg-purple-950/40 text-purple-300/80 border border-purple-500/15 hover:bg-purple-900/30'
                            }`}
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
                  <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="space-y-4">
                    <h3 className="text-base font-bold text-white border-b border-purple-900/30 pb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" /> Step 4: Areas of Interest
                    </h3>
                    <p className="text-xs text-purple-200/50 mb-4">Select projects and events you want to be involved in</p>
                    <div className="flex flex-wrap gap-2.5">
                      {interestOptions.map(interest => {
                        const selected = formData.interests.includes(interest);
                        return (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => toggleOption('interests', interest)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                              selected
                                ? 'bg-purple-800 text-white border border-purple-500/40 shadow-purple-glow'
                                : 'bg-purple-950/40 text-purple-300/80 border border-purple-500/15 hover:bg-purple-900/30'
                            }`}
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
                  <motion.div key="step5" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="space-y-4">
                    <h3 className="text-base font-bold text-white border-b border-purple-900/30 pb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-400" /> Step 5: Motivation
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-300 mb-1">Why do you want to join MAGIC Youth? *</label>
                        <textarea
                          name="reason"
                          value={formData.reason}
                          onChange={handleChange}
                          rows="4"
                          placeholder="Describe your motivation and what you hope to achieve..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none resize-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-purple-300 mb-1">Previous Volunteering Experience</label>
                        <textarea
                          name="previousExperience"
                          value={formData.previousExperience}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Detail any past social work, school club coordination, or NGO projects..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-purple-500/25 text-white text-xs outline-none resize-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 6: Uploads */}
                {currentStep === 6 && (
                  <motion.div key="step6" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="space-y-6">
                    <h3 className="text-base font-bold text-white border-b border-purple-900/30 pb-2 flex items-center gap-2">
                      <FileUp className="w-4 h-4 text-purple-400" /> Step 6: Document Uploads
                    </h3>
                    <p className="text-xs text-purple-200/50">Upload your documents for verification. Max size 10MB.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-6 rounded-2xl bg-slate-950/60 border border-purple-500/15 flex flex-col items-center justify-center text-center">
                        <ImageIcon className="w-8 h-8 text-purple-400 mb-2" />
                        <span className="text-[11px] font-bold text-white mb-1">Profile Photo</span>
                        <span className="text-[10px] text-purple-300/55 mb-4">JPEG / PNG format</span>
                        <label className="cursor-pointer btn-ghost px-4 py-2 rounded-full text-[10px] font-bold">
                          Choose File
                          <input type="file" name="profileImage" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                        {files.profileImage && (
                          <span className="text-[10px] text-emerald-400 font-semibold mt-2.5 truncate max-w-xs">
                            ✓ {files.profileImage.name}
                          </span>
                        )}
                      </div>

                      <div className="p-6 rounded-2xl bg-slate-950/60 border border-purple-500/15 flex flex-col items-center justify-center text-center">
                        <FileUp className="w-8 h-8 text-purple-400 mb-2" />
                        <span className="text-[11px] font-bold text-white mb-1">Resume / CV</span>
                        <span className="text-[10px] text-purple-300/55 mb-4">PDF format</span>
                        <label className="cursor-pointer btn-ghost px-4 py-2 rounded-full text-[10px] font-bold">
                          Choose File
                          <input type="file" name="resume" accept=".pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                        {files.resume && (
                          <span className="text-[10px] text-emerald-400 font-semibold mt-2.5 truncate max-w-xs">
                            ✓ {files.resume.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 7: Review Details */}
                {currentStep === 7 && (
                  <motion.div key="step7" variants={fadeUp} initial="hidden" animate="visible" exit="hidden" className="space-y-4">
                    <h3 className="text-base font-bold text-white border-b border-purple-900/30 pb-2 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-purple-400" /> Step 7: Review Application
                    </h3>
                    <p className="text-xs text-purple-200/50 mb-4">Please verify all input values before final submission.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/15 space-y-1.5">
                        <p className="font-bold text-purple-300 uppercase text-[9px] tracking-wider">Personal Info</p>
                        <p><strong className="text-white/60">Name:</strong> {formData.name}</p>
                        <p><strong className="text-white/60">Email:</strong> {formData.email}</p>
                        <p><strong className="text-white/60">Phone:</strong> {formData.phone}</p>
                        <p><strong className="text-white/60">Gender:</strong> {formData.gender}</p>
                        {formData.dob && <p><strong className="text-white/60">DOB:</strong> {formData.dob}</p>}
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/15 space-y-1.5">
                        <p className="font-bold text-purple-300 uppercase text-[9px] tracking-wider">Academic details</p>
                        <p><strong className="text-white/60">College:</strong> {formData.college}</p>
                        <p><strong className="text-white/60">Department:</strong> {formData.department} ({formData.year})</p>
                        <p><strong className="text-white/60">City:</strong> {formData.city}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/15 space-y-1.5 sm:col-span-2">
                        <p className="font-bold text-purple-300 uppercase text-[9px] tracking-wider">Skills & Interests</p>
                        <p><strong className="text-white/60">Skills:</strong> {formData.skills.join(', ') || 'None selected'}</p>
                        <p><strong className="text-white/60">Interests:</strong> {formData.interests.join(', ') || 'None selected'}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/15 space-y-1.5 sm:col-span-2">
                        <p className="font-bold text-purple-300 uppercase text-[9px] tracking-wider">Motivation Statement</p>
                        <p className="text-[11px] text-purple-200/80 leading-relaxed italic">"{formData.reason}"</p>
                        {formData.previousExperience && (
                          <div className="mt-2 pt-2 border-t border-purple-900/30">
                            <p><strong className="text-white/60">Experience:</strong> {formData.previousExperience}</p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/15 space-y-1.5 sm:col-span-2">
                        <p className="font-bold text-purple-300 uppercase text-[9px] tracking-wider">Uploaded Documents</p>
                        <p><strong className="text-white/60">Profile Photo:</strong> {files.profileImage ? files.profileImage.name : 'Not provided'}</p>
                        <p><strong className="text-white/60">Resume / CV:</strong> {files.resume ? files.resume.name : 'Not provided'}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="mt-8 pt-6 border-t border-purple-900/30 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-5 py-2 rounded-full border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-900/30 transition flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                ) : <div />}

                {currentStep < 7 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-purple-glow font-bold px-7 py-2.5 rounded-full text-xs flex items-center gap-1"
                  >
                    Next Step <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-purple-glow font-bold px-8 py-3 rounded-full text-xs flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

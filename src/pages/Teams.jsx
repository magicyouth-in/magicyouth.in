import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Loader2, Sparkles, X, ChevronRight, MapPin, Award, User, BookOpen } from 'lucide-react';
import FormattedText from '../components/common/FormattedText';
import '../styles/home.css';
import '../styles/teams.css';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [units, setUnits] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMember, setSelectedMember] = useState(null);

  const getCleanName = (name) => {
    if (!name) return '';
    return name.replace(/^(mr\.|mrs\.|ms\.|sir|mam|dr\.)\s+/i, '').trim();
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/teams').then(res => res.json()),
      fetch('/api/units').then(res => res.json()),
      fetch('/api/academic-years').then(res => res.json())
    ])
    .then(async ([teamsData, unitsData, yearsData]) => {
      let fetchedUnits = [];
      let fetchedYears = [];

      if (unitsData.success) {
        fetchedUnits = unitsData.data || [];
        setUnits(fetchedUnits);
        
        // Preselect default unit dynamically
        const defaultUnit = fetchedUnits.find(u => u.isDefault || u.is_default) || fetchedUnits[0];
        if (defaultUnit) {
          setSelectedUnit(defaultUnit._id || defaultUnit.id);
        }
      }

      if (yearsData.success) {
        fetchedYears = yearsData.data || [];
        setAcademicYears(fetchedYears);

        // Preselect current academic year if present
        const currentYearObj = fetchedYears.find(y => y.isCurrent) || fetchedYears[0];
        if (currentYearObj && currentYearObj.year) {
          setSelectedYear(currentYearObj.year);
        }
      }

      if (teamsData.success) {
        const teamsWithMembers = await Promise.all((teamsData.data || []).map(async (t) => {
          try {
            const mRes = await fetch(`/api/teams/${t._id}/members`);
            const mData = await mRes.json();
            return { ...t, members: mData.success ? mData.data : [] };
          } catch (e) {
            return { ...t, members: [] };
          }
        }));
        
        setTeams(teamsWithMembers);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  // Handle ESC key and scroll-lock for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedMember(null);
      }
    };
    if (selectedMember) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedMember]);

  const uniqueYears = Array.from(
    new Set(academicYears.map(y => y.year).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  const filteredTeams = teams.filter(t => {
    const unitMatch = selectedUnit === 'All' || (t.unitId && (t.unitId._id === selectedUnit || t.unitId.id === selectedUnit));
    const yearMatch = selectedYear === 'All' || (t.academicYearId && t.academicYearId.year === selectedYear);
    return unitMatch && yearMatch;
  });

  const getTeamDisplayName = (team) => {
    const rawUnit = team.unitId?.shortName || team.unitId?.name || 'CAMPUS';
    const cleanCampus = rawUnit.replace(/\s*MAGIC(\s*YOUTH)?\s*$/i, '').trim();
    return cleanCampus ? `${cleanCampus} MAGIC YOUTH` : 'MAGIC YOUTH';
  };

  const getTeamStatusInfo = (team) => {
    if (team.status) {
      if (/current|active/i.test(team.status)) {
        return { label: 'CURRENT TEAM', isCurrent: true, color: '#15803D', bg: '#DCFCE7', border: '#BBF7D0' };
      }
      if (/upcoming/i.test(team.status)) {
        return { label: 'UPCOMING TEAM', isCurrent: false, color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD' };
      }
      if (/past|archive|historical/i.test(team.status)) {
        return { label: 'PAST TEAM', isCurrent: false, color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0' };
      }
    }
    if (team.academicYearId?.isCurrent) {
      return { label: 'CURRENT TEAM', isCurrent: true, color: '#15803D', bg: '#DCFCE7', border: '#BBF7D0' };
    }
    return { label: 'PAST TEAM', isCurrent: false, color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0' };
  };

  const openMemberProfile = (member, team) => {
    setSelectedMember({
      ...member,
      teamName: team.name,
      unitName: getTeamDisplayName(team),
      academicYear: team.academicYearId?.year,
    });
  };

  const getInitials = (name) => {
    if (!name) return 'MY';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getCleanRole = (pos) => {
    if (!pos) return 'TEAM MEMBER';
    if (/^main\s+animator$/i.test(pos.trim())) return 'ANIMATOR';
    return pos;
  };

  return (
    <main className="home-wrapper" style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <style>{`
        .teams-content-wrapper {
          max-width: 1240px;
          width: calc(100% - 48px);
          margin: 0 auto;
        }
        .animator-leadership-banner {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          background: #FFFFFF;
          border: 1.5px solid rgba(2, 132, 199, 0.25);
          border-radius: 1.25rem;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(2, 132, 199, 0.05);
          max-width: 860px;
          margin: 0 auto;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .animator-leadership-banner:hover {
          transform: translateY(-3px);
          border-color: rgba(2, 132, 199, 0.6);
          box-shadow: 0 14px 34px rgba(2, 132, 199, 0.12);
        }
        .animator-banner-image-col {
          flex: 0 0 34%;
          min-height: 240px;
          background-color: #0F172A;
          position: relative;
          overflow: hidden;
        }
        .animator-banner-image-col img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .animator-banner-info-col {
          flex: 0 0 66%;
          padding: 2rem 2.25rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: left;
        }
        @media (max-width: 720px) {
          .animator-leadership-banner {
            flex-direction: column !important;
          }
          .animator-banner-image-col {
            flex: none;
            width: 100%;
            height: 240px;
          }
          .animator-banner-info-col {
            flex: none;
            width: 100%;
            padding: 1.5rem;
            text-align: center;
          }
        }
      `}</style>

      {/* Hero Header */}
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.25rem 1.5rem 2rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <div className="teams-content-wrapper">
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Institutional Leadership &amp; Formation
          </div>
          <h1 className="page-header-title" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.625rem' }}>
            Our Teams
          </h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.025rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto', marginBottom: '1.75rem' }}>
            The dedicated animators, coordinators, and student leaders driving youth empowerment and campus initiatives.
          </p>

          {/* Unit & Academic Year Filter Toolbar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.45rem 0.95rem', borderRadius: '999px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <Filter size={14} style={{ color: 'var(--primary-blue)' }} />
              <select 
                value={selectedUnit} 
                onChange={(e) => setSelectedUnit(e.target.value)} 
                style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                aria-label="Filter by Campus Unit"
              >
                <option value="All">All Chapters</option>
                {units.map(u => {
                  const cleanName = u.name.replace(/\s*MAGIC(\s*YOUTH)?\s*$/i, '').trim();
                  return (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {cleanName ? `${cleanName} MAGIC YOUTH` : u.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.45rem 0.95rem', borderRadius: '999px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <span style={{ color: 'var(--primary-pink)', fontSize: '0.75rem', fontWeight: 900 }}>●</span>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)} 
                style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                aria-label="Filter by Academic Year"
              >
                <option value="All">All Academic Years</option>
                {uniqueYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Teams Roster Section */}
      <section style={{ backgroundColor: 'white', padding: '2.5rem 0 5rem' }}>
        <div className="teams-content-wrapper">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader2 size={36} className="animate-spin" color="var(--primary-blue)" />
            </div>
          ) : filteredTeams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 2rem', backgroundColor: '#F8FAFC', borderRadius: '1rem', border: '1px dashed var(--border-color)', maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
              <User size={44} color="var(--primary-blue)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>No Team Roster Available</h3>
              <p style={{ margin: 0, fontSize: '0.925rem' }}>There are no team records published for this chapter and academic year selection.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
              {filteredTeams.map((team) => {
                const allMembers = (team.members || []).slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
                const animators = allMembers.filter(m => m.section === 'Animator' || m.section === 'Main Animator' || /^(main\s+)?animator|faculty\s+advisor|mentor/i.test(m.position));
                const nonAnimators = allMembers.filter(m => !animators.includes(m));
                const leads = nonAnimators.filter(m => m.section === 'Lead' || m.section === 'Coordinator' || /lead|secretary|coordinator|procurator|president|officer|head/i.test(m.position));
                const generalMembers = nonAnimators.filter(m => !leads.includes(m));

                const showSeparateSections = leads.length > 0 && generalMembers.length > 0;
                const primaryGroupMembers = showSeparateSections ? leads : nonAnimators;
                const primaryGroupTitle = (leads.length > 0 || !showSeparateSections) ? 'LEADERSHIP & COORDINATION' : 'TEAM MEMBERS';
                const primaryGroupEyebrow = (leads.length > 0 || !showSeparateSections) ? 'Student Leadership & Coordinators' : 'Active Chapter Members';

                const statusInfo = getTeamStatusInfo(team);

                return (
                  <article key={team._id || team.id} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Team Identity Banner */}
                    <div style={{ textAlign: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '1.5rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', fontWeight: 800, color: statusInfo.color, backgroundColor: statusInfo.bg, border: `1px solid ${statusInfo.border}`, padding: '0.2rem 0.65rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                        <span>●</span> {statusInfo.label}
                      </div>
                      <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.15rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.35rem', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                        {getTeamDisplayName(team)} TEAM
                      </h2>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                        {team.academicYearId?.year ? `${team.academicYearId.year} • ` : ''}{team.name || 'Executive Body'}
                      </div>
                    </div>

                    {allMembers.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        
                        {/* 1. ANIMATOR SECTION (Horizontal Leadership Layout) */}
                        {animators.length > 0 && (
                          <div>
                            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Chapter Guidance &amp; Mentorship
                              </div>
                              <h3 style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.45rem)', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0 }}>
                                ANIMATOR
                              </h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                              {animators.map((animator) => {
                                const memberId = animator._id || animator.id;
                                const cleanName = getCleanName(animator.name);
                                const bioSnippet = animator.experience || animator.bio 
                                  ? (animator.experience || animator.bio).slice(0, 180) + '...'
                                  : 'Guiding student leadership formation, ethical discernment, and institutional community engagement.';

                                return (
                                  <div 
                                    key={memberId}
                                    onClick={() => openMemberProfile(animator, team)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMemberProfile(animator, team); } }}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`View full profile for ${cleanName}`}
                                    className="animator-leadership-banner"
                                  >
                                    <div className="animator-banner-image-col">
                                      {animator.photo ? (
                                        <img src={animator.photo} alt={cleanName} loading="lazy" />
                                      ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0284C7', color: 'white', fontSize: '2.5rem', fontWeight: 800 }}>
                                          {getInitials(cleanName)}
                                        </div>
                                      )}
                                    </div>

                                    <div className="animator-banner-info-col">
                                      <div style={{ fontSize: '0.725rem', fontWeight: 900, color: 'var(--primary-blue)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                        ANIMATOR PROFILE
                                      </div>
                                      <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.35rem', lineHeight: 1.25 }}>
                                        {cleanName}
                                      </h4>
                                      <div style={{ color: 'var(--primary-pink)', fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                                        {getCleanRole(animator.position)}
                                      </div>
                                      {(animator.department || animator.organization) && (
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.625rem' }}>
                                          {animator.department || animator.organization}
                                        </div>
                                      )}
                                      <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.55, margin: '0 0 1rem' }}>
                                        {bioSnippet}
                                      </p>
                                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
                                        <Sparkles size={13} /> View Full Profile <ChevronRight size={13} />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 2. PRIMARY LEADERSHIP / COORDINATORS SECTION (5 Columns) */}
                        {primaryGroupMembers.length > 0 && (
                          <div>
                            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> {primaryGroupEyebrow}
                              </div>
                              <h3 style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.45rem)', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0 }}>
                                {primaryGroupTitle}
                              </h3>
                            </div>

                            <div className="team-members-5col-grid">
                              {primaryGroupMembers.map((member) => {
                                const memberId = member._id || member.id;
                                const cleanName = getCleanName(member.name);

                                return (
                                  <div 
                                    key={memberId}
                                    onClick={() => openMemberProfile(member, team)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMemberProfile(member, team); } }}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`View full profile for ${cleanName}`}
                                    className="team-member-card-5col"
                                  >
                                    <div className="member-avatar-box">
                                      {member.photo ? (
                                        <img src={member.photo} alt={cleanName} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        <div className="member-avatar-initials">
                                          {getInitials(cleanName)}
                                        </div>
                                      )}
                                    </div>

                                    <h4 className="member-name-heading">
                                      {cleanName}
                                    </h4>

                                    <div className="member-role-badge">
                                      {getCleanRole(member.position)}
                                    </div>

                                    {(member.department || member.organization) && (
                                      <p className="member-dept-text">
                                        {member.department || member.organization}
                                      </p>
                                    )}

                                    <span className="member-view-prompt">
                                      <Sparkles size={10} /> View Profile <ChevronRight size={10} />
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 3. GENERAL TEAM MEMBERS SECTION (5 Columns) */}
                        {showSeparateSections && generalMembers.length > 0 && (
                          <div>
                            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Active Chapter Members
                              </div>
                              <h3 style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.45rem)', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0 }}>
                                TEAM MEMBERS
                              </h3>
                            </div>

                            <div className="team-members-5col-grid">
                              {generalMembers.map((member) => {
                                const memberId = member._id || member.id;
                                const cleanName = getCleanName(member.name);

                                return (
                                  <div 
                                    key={memberId}
                                    onClick={() => openMemberProfile(member, team)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMemberProfile(member, team); } }}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`View full profile for ${cleanName}`}
                                    className="team-member-card-5col"
                                  >
                                    <div className="member-avatar-box">
                                      {member.photo ? (
                                        <img src={member.photo} alt={cleanName} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        <div className="member-avatar-initials">
                                          {getInitials(cleanName)}
                                        </div>
                                      )}
                                    </div>

                                    <h4 className="member-name-heading">
                                      {cleanName}
                                    </h4>

                                    <div className="member-role-badge">
                                      {getCleanRole(member.position)}
                                    </div>

                                    {(member.department || member.organization) && (
                                      <p className="member-dept-text">
                                        {member.department || member.organization}
                                      </p>
                                    )}

                                    <span className="member-view-prompt">
                                      <Sparkles size={10} /> View Profile <ChevronRight size={10} />
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px dashed var(--border-color)', maxWidth: '600px', margin: '0 auto' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>No members are currently listed for this team roster.</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* FULL-SCREEN PROFILE OVERLAY / LIGHTBOX MODAL */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedMember && (
          <div 
            className="profile-modal-backdrop" 
            onClick={() => setSelectedMember(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-name"
          >
            <motion.div 
              className="profile-modal-card" 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className="profile-modal-header">
                <div className="profile-modal-badge">
                  <span style={{ color: 'var(--primary-pink)', marginRight: '4px' }}>●</span>
                  {selectedMember.unitName || 'MAGIC YOUTH PROFILE'}
                </div>
                <button 
                  onClick={() => setSelectedMember(null)} 
                  className="profile-modal-close-btn"
                  aria-label="Close Profile"
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="profile-modal-body">
                <div className="profile-modal-avatar-box">
                  {selectedMember.photo ? (
                    <img 
                      src={selectedMember.photo} 
                      alt={getCleanName(selectedMember.name)} 
                      className="profile-modal-avatar-img"
                    />
                  ) : (
                    <div className="profile-modal-avatar-initials">
                      {getInitials(getCleanName(selectedMember.name))}
                    </div>
                  )}
                </div>

                <h3 id="profile-modal-name" className="profile-modal-name">
                  {getCleanName(selectedMember.name)}
                </h3>
                
                <div className="profile-modal-role">
                  {getCleanRole(selectedMember.position)}
                </div>

                {(selectedMember.department || selectedMember.organization) && (
                  <p className="profile-modal-dept">
                    {selectedMember.department || selectedMember.organization}
                  </p>
                )}

                {selectedMember.academicYear && (
                  <div className="profile-modal-unit">
                    <MapPin size={13} style={{ marginRight: '2px' }} />
                    {selectedMember.unitName} &bull; {selectedMember.academicYear}
                  </div>
                )}

                {(selectedMember.bio || selectedMember.experience || selectedMember.responsibilities) && (
                  <div className="profile-modal-divider" />
                )}

                {selectedMember.bio && (
                  <div className="profile-modal-section">
                    <div className="profile-modal-section-title">
                      <Sparkles size={13} /> Personal Narrative &amp; Focus
                    </div>
                    <p className="profile-modal-text">
                      <FormattedText text={selectedMember.bio} />
                    </p>
                  </div>
                )}

                {selectedMember.experience && (
                  <div className="profile-modal-section" style={{ marginTop: selectedMember.bio ? '1rem' : 0 }}>
                    <div className="profile-modal-section-title">
                      <Award size={13} /> Leadership &amp; Background
                    </div>
                    <p className="profile-modal-text">
                      <FormattedText text={selectedMember.experience} />
                    </p>
                  </div>
                )}

                {selectedMember.responsibilities && (
                  <div className="profile-modal-section" style={{ marginTop: '1rem' }}>
                    <div className="profile-modal-section-title">
                      <BookOpen size={13} /> Key Responsibilities
                    </div>
                    <p className="profile-modal-text">
                      <FormattedText text={selectedMember.responsibilities} />
                    </p>
                  </div>
                )}
              </div>

              <div className="profile-modal-footer">
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="profile-modal-close-action"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Loader2 } from 'lucide-react';
import '../styles/home.css';
import '../styles/teams.css';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [units, setUnits] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUnit, setSelectedUnit] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

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
        
        // Preselect ALIET MAGIC YOUTH by default
        const alietMatch = fetchedUnits.find(u => 
          /ALIET/i.test(u.code || u.shortName || u.name || '') || 
          /Andhra Loyola Institute/i.test(u.institution || u.name || '')
        );
        if (alietMatch) {
          setSelectedUnit(alietMatch._id || alietMatch.id);
        } else if (fetchedUnits.length > 0) {
          setSelectedUnit(fetchedUnits[0]._id || fetchedUnits[0].id);
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
    // Remove duplicate occurrences of "MAGIC YOUTH" or "MAGIC" at the end of unit name
    const cleanCampus = rawUnit.replace(/\s*MAGIC(\s*YOUTH)?\s*$/i, '').trim();
    return cleanCampus ? `${cleanCampus} MAGIC YOUTH TEAM` : 'MAGIC YOUTH TEAM';
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const getInitials = (name) => {
    if (!name) return 'MY';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <main className="home-wrapper">
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '3.5rem 1.5rem 2.25rem', borderBottom: '1px solid var(--border-color)' }}>
        <div className="page-header-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)', fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Leadership &amp; Community
          </div>
          <h1 className="page-header-title" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2.25rem, 4vw, 3rem)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Our Teams</h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            The dedicated animators, coordinators, and student leaders driving youth empowerment across our chapters.
          </p>
        </div>
      </section>

      <section className="inner-section" style={{ backgroundColor: 'white', padding: '3rem 1.5rem 5rem' }}>
        {/* FILTERS */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.6rem 1.25rem', borderRadius: '999px', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <Filter size={15} style={{ color: 'var(--primary-blue)' }} />
            <select 
              value={selectedUnit} 
              onChange={(e) => setSelectedUnit(e.target.value)} 
              style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <option value="All">All Campuses</option>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.6rem 1.25rem', borderRadius: '999px', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <span style={{ color: 'var(--primary-pink)', fontSize: '0.75rem', fontWeight: 900 }}>●</span>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)} 
              style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <option value="All">All Academic Years</option>
              {uniqueYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={48} className="animate-spin" color="var(--primary-blue)" />
          </div>
        ) : filteredTeams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px dashed var(--border-color)', maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>No team records available for this selection.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', maxWidth: '1280px', margin: '0 auto' }}>
            {filteredTeams.map((team, i) => {
              const allMembers = (team.members || []).slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
              const animators = allMembers.filter(m => m.section === 'Main Animator' || /^(main\s+)?animator|faculty\s+advisor|mentor/i.test(m.position));
              const teamMembers = allMembers.filter(m => !(m.section === 'Main Animator' || /^(main\s+)?animator|faculty\s+advisor|mentor/i.test(m.position)));

              return (
                <article key={team._id || team.id} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: team.academicYearId?.isCurrent ? 'var(--primary-blue)' : '#64748B', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> {team.academicYearId?.isCurrent ? 'CURRENT TEAM' : 'PAST TEAM'}
                    </div>
                    <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 2.25rem)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em', textTransform: 'uppercase', padding: '0 0.5rem', lineHeight: 1.2 }}>
                      {getTeamDisplayName(team)}
                    </h2>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 600 }}>
                      {team.academicYearId?.year ? `${team.academicYearId.year} • ` : ''}{team.name || 'Executive Body'}
                    </div>
                  </div>

                  {allMembers.length > 0 ? (
                    <div>
                      {/* 1. MAIN ANIMATOR SECTION */}
                      {animators.length > 0 && (
                        <div style={{ marginBottom: '4rem' }}>
                          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Chapter Guidance &amp; Mentorship
                            </div>
                            <h3 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                              MAIN ANIMATOR
                            </h3>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
                            {animators.map((animator) => (
                              <div 
                                key={animator._id || animator.id}
                                style={{
                                  backgroundColor: 'var(--bg-secondary)',
                                  border: '2px solid rgba(2, 132, 199, 0.25)',
                                  borderRadius: '1rem',
                                  padding: '2.5rem 2rem',
                                  maxWidth: '360px',
                                  width: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  textAlign: 'center',
                                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                }}
                              >
                                <div style={{ width: '130px', height: '130px', borderRadius: '50%', marginBottom: '1.25rem', overflow: 'hidden', border: '4px solid #FFFFFF', boxShadow: '0 6px 18px rgba(2, 132, 199, 0.15)' }}>
                                  {animator.photo ? (
                                    <img src={animator.photo} alt={animator.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F9FF', color: 'var(--primary-blue)', fontWeight: 800, fontSize: '1.75rem' }}>
                                      {getInitials(animator.name)}
                                    </div>
                                  )}
                                </div>

                                <h4 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                                  {animator.name}
                                </h4>

                                <div style={{ color: 'var(--primary-pink)', fontWeight: 800, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                                  {animator.position || 'MAIN ANIMATOR'}
                                </div>

                                {(animator.department || animator.organization) && (
                                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                                    {animator.department || animator.organization}
                                  </p>
                                )}

                                {animator.biography && (
                                  <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, marginTop: '0.75rem', marginBottom: 0 }}>
                                    {animator.biography}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. TEAM MEMBERS SECTION (5 PER ROW ON DESKTOP) */}
                      {teamMembers.length > 0 && (
                        <div>
                          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-blue)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                              <span style={{ color: 'var(--primary-pink)', marginRight: '6px' }}>●</span> Student Leadership &amp; Coordinators
                            </div>
                            <h3 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                              TEAM MEMBERS
                            </h3>
                          </div>

                          <div className="team-members-5col-grid">
                            {teamMembers.map((member) => (
                              <div 
                                key={member._id || member.id}
                                className="team-member-card-5col"
                              >
                                <div className="member-avatar-box">
                                  {member.photo ? (
                                    <img src={member.photo} alt={member.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <div className="member-avatar-initials">
                                      {getInitials(member.name)}
                                    </div>
                                  )}
                                </div>

                                <h4 className="member-name-heading">
                                  {member.name}
                                </h4>

                                <div className="member-role-badge">
                                  {member.position}
                                </div>

                                {(member.department || member.organization) && (
                                  <p className="member-dept-text">
                                    {member.department || member.organization}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px dashed var(--border-color)', maxWidth: '600px', margin: '0 auto' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>No members are currently listed for this team roster.</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

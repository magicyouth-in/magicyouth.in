import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Loader2 } from 'lucide-react';
import '../styles/home.css';

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
        fetchedUnits = unitsData.data;
        setUnits(fetchedUnits);
      }
      if (yearsData.success) {
        fetchedYears = yearsData.data;
        setAcademicYears(fetchedYears);
      }

      if (teamsData.success) {
        const teamsWithMembers = await Promise.all(teamsData.data.map(async (t) => {
          try {
            const mRes = await fetch(`/api/teams/${t._id}/members`);
            const mData = await mRes.json();
            return { ...t, members: mData.success ? mData.data : [] };
          } catch (e) {
            return { ...t, members: [] };
          }
        }));
        
        setTeams(teamsWithMembers);

        // ALWAYS default to ALIET if exists
        const alietUnit = fetchedUnits.find(u => u.name.toUpperCase().includes('ALIET') || u.shortName === 'ALIET');
        if (alietUnit) {
          setSelectedUnit(alietUnit._id);
        }

        const currentYear = fetchedYears.find(y => y.isCurrent);
        if (currentYear) {
          setSelectedYear(currentYear._id);
        }
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filteredTeams = teams.filter(t => {
    const unitMatch = selectedUnit === 'All' || (t.unitId && t.unitId._id === selectedUnit);
    const yearMatch = selectedYear === 'All' || (t.academicYearId && t.academicYearId._id === selectedYear);
    return unitMatch && yearMatch;
  });

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
      <section className="page-header-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '6rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div className="page-header-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ color: 'var(--primary-blue)' }}>Leadership & Community</div>
          <h1 className="page-header-title" style={{ color: 'var(--text-primary)', fontSize: '3rem' }}>Our Teams</h1>
          <p className="page-header-subtitle" style={{ color: 'var(--text-secondary)' }}>
            The dedicated students and coordinators driving change across our chapters.
          </p>
        </div>
      </section>

      <section className="inner-section" style={{ backgroundColor: 'white' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <Filter size={16} color="var(--primary-blue)" />
            <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)' }}>
              <option value="All">All Campuses</option>
              {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
            <Filter size={16} color="var(--primary-blue)" />
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)' }}>
              <option value="All">All Years</option>
              {academicYears.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={48} className="animate-spin" color="var(--primary-blue)" />
          </div>
        ) : filteredTeams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            No leadership teams found for the selected campus and year.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', maxWidth: '1200px', margin: '0 auto' }}>
            {filteredTeams.map((team, i) => (
              <motion.article key={team._id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {team.academicYearId?.isCurrent ? 'Current Team' : 'Past Team'}
                  </div>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                    {team.unitId?.shortName || team.unitId?.name} MAGIC YOUTH TEAM
                  </h2>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
                    {team.academicYearId?.year} • {team.name}
                  </div>
                </div>

                {team.members && team.members.length > 0 ? (
                  (() => {
                    const core = team.members.filter(m => /president|secretary|treasurer|lead/i.test(m.position));
                    const coords = team.members.filter(m => /coordinator/i.test(m.position) && !/president|secretary|treasurer|lead/i.test(m.position));
                    const others = team.members.filter(m => !/president|secretary|treasurer|lead|coordinator/i.test(m.position));

                    const renderGroup = (group, title) => {
                      if (group.length === 0) return null;
                      return (
                        <div style={{ marginBottom: '4rem' }}>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '2rem', textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>{title}</h3>
                          <div className="programs-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
                            {group.map((member) => (
                              <div key={member._id} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '1.5rem', overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                  {member.photo ? (
                                    <img src={member.photo} alt={member.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E2E8F0', color: 'var(--primary-blue)', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '0.05em' }}>
                                      {getInitials(member.name)}
                                    </div>
                                  )}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{member.name}</h3>
                                <p style={{ color: 'var(--primary-blue)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{member.position}</p>
                                {member.course && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{member.course}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div>
                        {renderGroup(core, 'Core Leadership')}
                        {renderGroup(coords, 'Coordinators')}
                        {renderGroup(others, 'Team Members')}
                      </div>
                    );
                  })()
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No members found in this team.</p>
                )}
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

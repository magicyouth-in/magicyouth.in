import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Loader2, MapPin } from 'lucide-react';
import '../styles/home.css';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [units, setUnits] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
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
        // Fetch members for all teams
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

        // Pre-select ALIET if it exists, otherwise leave as 'All'
        const alietUnit = fetchedUnits.find(u => u.name.toUpperCase().includes('ALIET') || u.shortName === 'ALIET');
        if (alietUnit) {
          setSelectedUnit(alietUnit._id);
        }

        // Pre-select Current Year if it exists
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <main className="home-wrapper">
      <section className="page-header-section">
        <div className="page-bg-glow"></div>
        <div className="page-header-content">
          <div className="section-eyebrow">Our People</div>
          <h1 className="page-header-title">Leadership Teams</h1>
          <p className="page-header-subtitle">
            Meet the dedicated students and coordinators driving change across our chapters.
          </p>
        </div>
      </section>

      <section className="inner-section bg-light">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-primary)', padding: '0.5rem 1rem', borderRadius: '9999px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <Filter size={16} color="var(--primary-blue)" />
            <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontWeight: 600, color: 'var(--text-primary)' }}>
              <option value="All">All Campuses</option>
              {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-primary)', padding: '0.5rem 1rem', borderRadius: '9999px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {filteredTeams.map((team, i) => (
              <motion.div key={team._id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                    {team.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    {team.unitId?.name} • {team.academicYearId?.year}
                  </div>
                </div>

                {team.members && team.members.length > 0 ? (
                  <div className="programs-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    {team.members.map((member, mIdx) => (
                      <div key={member._id} className="program-card" style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 120, height: 120, borderRadius: '50%', marginBottom: '1.5rem', overflow: 'hidden', border: '4px solid var(--bg-secondary)' }}>
                          {member.photo ? (
                            <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', color: 'var(--primary-blue)', fontSize: '2.5rem', fontWeight: 800 }}>
                              {member.name[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{member.name}</h3>
                        <p style={{ color: 'var(--primary-pink)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>{member.position}</p>
                        
                        {member.course && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{member.course}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No members found in this team.</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Users, ChevronDown, Linkedin, Instagram, Mail, Loader2, Building2, CalendarDays } from 'lucide-react';
import '../styles/about.css';
import '../styles/teams.css';

export default function Teams() {
  const [units, setUnits]                 = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [teams, setTeams]                 = useState([]);
  const [members, setMembers]             = useState([]);
  const [selectedUnit, setSelectedUnit]   = useState('');
  const [selectedYear, setSelectedYear]   = useState('');
  const [selectedTeam, setSelectedTeam]   = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  // Load all active units on mount
  useEffect(() => {
    fetch('/api/units?includeInactive=false')
      .then(r => r.json())
      .then(d => { if (d.success) setUnits(d.data); })
      .catch(() => setError('Could not load units.'));
  }, []);

  // Load academic years when unit selected
  useEffect(() => {
    if (!selectedUnit) { setAcademicYears([]); setSelectedYear(''); return; }
    fetch(`/api/academic-years?unitId=${selectedUnit}&status=Active`)
      .then(r => r.json())
      .then(d => { if (d.success) setAcademicYears(d.data); setSelectedYear(''); });
  }, [selectedUnit]);

  // Load teams when year selected
  useEffect(() => {
    if (!selectedUnit || !selectedYear) { setTeams([]); setSelectedTeam(''); return; }
    fetch(`/api/teams?unitId=${selectedUnit}&academicYearId=${selectedYear}`)
      .then(r => r.json())
      .then(d => { if (d.success) setTeams(d.data); setSelectedTeam(''); });
  }, [selectedUnit, selectedYear]);

  // Load team members when team selected
  const loadMembers = useCallback((teamId) => {
    if (!teamId) { setMembers([]); return; }
    setLoading(true);
    fetch(`/api/teams/${teamId}/members`)
      .then(r => r.json())
      .then(d => { if (d.success) setMembers(d.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  useEffect(() => { loadMembers(selectedTeam); }, [selectedTeam, loadMembers]);

  const selectedUnitData = units.find(u => u._id === selectedUnit);
  const selectedYearData = academicYears.find(y => y._id === selectedYear);
  const selectedTeamData = teams.find(t => t._id === selectedTeam);

  return (
    <div>
      {/* ── TEAMS HERO ───────────────────────────────────────────── */}
      <section className="teams-hero">
        <div className="teams-hero-content">
          <span className="about-badge">Leadership Directory</span>
          <h1 className="about-title">Meet the <span className="highlight">MAGIC Youth</span> Teams</h1>
          <p className="about-lead">
            Explore the dedicated student leaders across our units and academic years. Historical records and active team structures are archived below.
          </p>
        </div>
      </section>

      {/* ── SELECTOR SECTION ─────────────────────────────────────── */}
      <section className="teams-section">
        <div className="teams-container">
          <div className="teams-filter-box">
            {/* Unit selector */}
            <div className="teams-filter-group">
              <label className="teams-filter-label">Select Unit</label>
              <div style={{ position: 'relative' }}>
                <Building2 style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
                <select
                  value={selectedUnit}
                  onChange={e => setSelectedUnit(e.target.value)}
                  className="teams-filter-select"
                >
                  <option value="">Choose a Unit…</option>
                  {units.map(u => (
                    <option key={u._id} value={u._id}>{u.name} {u.institution ? `— ${u.institution}` : ''}</option>
                  ))}
                </select>
                <ChevronDown style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Year selector */}
            <div className="teams-filter-group">
              <label className="teams-filter-label">Academic Year</label>
              <div style={{ position: 'relative' }}>
                <CalendarDays style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  disabled={!selectedUnit}
                  className="teams-filter-select"
                >
                  <option value="">Choose a Year…</option>
                  {academicYears.map(y => (
                    <option key={y._id} value={y._id}>{y.year}</option>
                  ))}
                </select>
                <ChevronDown style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Team selector */}
            <div className="teams-filter-group">
              <label className="teams-filter-label">Team</label>
              <div style={{ position: 'relative' }}>
                <Users style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
                <select
                  value={selectedTeam}
                  onChange={e => setSelectedTeam(e.target.value)}
                  disabled={!selectedYear}
                  className="teams-filter-select"
                >
                  <option value="">Choose a Team…</option>
                  {teams.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#5B21B6', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>

          {/* Breadcrumb Context */}
          {selectedUnitData && (
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#5B21B6', marginBottom: '1.5rem' }}>
              {selectedUnitData.name}
              {selectedYearData && <> &rsaquo; {selectedYearData.year}</>}
              {selectedTeamData && <> &rsaquo; {selectedTeamData.name}</>}
            </div>
          )}

          {/* Empty state — no selection */}
          {!selectedTeam && !loading && (
            <div className="teams-empty">
              <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Users style={{ width: 28, height: 28, color: '#5B21B6' }} />
              </div>
              <h3>Select a unit, year, and team above</h3>
              <p>The leadership team structure for your selection will appear here.</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <Loader2 style={{ width: 36, height: 36, color: '#5B21B6' }} className="animate-spin" />
            </div>
          )}

          {/* Empty Team */}
          {!loading && selectedTeam && members.length === 0 && (
            <div className="teams-empty">
              <p>No team members found for this team selection yet.</p>
            </div>
          )}

          {/* Members Grid */}
          {!loading && members.length > 0 && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1F2937' }}>
                  {selectedTeamData?.name}
                  {selectedUnitData && <span style={{ fontWeight: 500, fontSize: '1.125rem', color: '#6B7280', marginLeft: '0.75rem' }}>— {selectedUnitData.name}</span>}
                </h2>
                {selectedYearData && (
                  <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
                    {selectedYearData.year} Academic Year · {members.length} member{members.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="teams-grid">
                {members.map(member => (
                  <MemberCard key={member._id} member={member} />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#EF4444' }}>{error}</div>
          )}
        </div>
      </section>
    </div>
  );
}

function MemberCard({ member }) {
  return (
    <div className="member-card">
      <div className="member-photo-box">
        {member.photo ? (
          <img
            src={`/api/gallery/file/${member.photo}`}
            alt={member.name}
            className="member-photo"
            loading="lazy"
          />
        ) : (
          <div className="member-placeholder">
            {member.name ? member.name[0] : 'U'}
          </div>
        )}
      </div>

      <div className="member-info">
        <h3 className="member-name">{member.name}</h3>
        <div className="member-role">{member.position}</div>
        {member.department && (
          <div className="member-dept">{member.department}{member.batchYear ? ` · ${member.batchYear}` : ''}</div>
        )}
        {member.biography && (
          <p className="member-bio">{member.biography}</p>
        )}

        {(member.socialLinks?.instagram || member.socialLinks?.linkedin || member.socialLinks?.email) && (
          <div className="member-socials">
            {member.socialLinks.instagram && (
              <a href={member.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="member-social-link" aria-label="Instagram">
                <Instagram style={{ width: 16, height: 16 }} />
              </a>
            )}
            {member.socialLinks.linkedin && (
              <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="member-social-link" aria-label="LinkedIn">
                <Linkedin style={{ width: 16, height: 16 }} />
              </a>
            )}
            {member.socialLinks.email && (
              <a href={`mailto:${member.socialLinks.email}`} className="member-social-link" aria-label="Email">
                <Mail style={{ width: 16, height: 16 }} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

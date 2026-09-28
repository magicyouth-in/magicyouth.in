/**
 * src/pages/member/MemberProfile.jsx
 * Member's own profile view and edit (permitted fields only).
 */
import React, { useState, useEffect } from 'react';
import { User, Edit2, Save, X, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function MemberProfile({ member, onRefresh }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState(null);
  const [form, setForm]       = useState({ bio: '', address: '', interests: '', skills: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  async function loadProfile() {
    setLoading(true);
    try {
      const res  = await fetch('/api/members/me', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setForm({
          bio:       data.data.bio || '',
          address:   data.data.address || '',
          interests: (data.data.interests || []).join(', '),
          skills:    (data.data.skills || []).join(', '),
        });
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadProfile(); }, []);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const formData = new FormData();
      formData.append('bio', form.bio);
      formData.append('address', form.address);
      formData.append('interests', JSON.stringify(form.interests.split(',').map(s => s.trim()).filter(Boolean)));
      formData.append('skills',    JSON.stringify(form.skills.split(',').map(s => s.trim()).filter(Boolean)));
      if (photoFile) formData.append('profilePhoto', photoFile);

      const res  = await fetch('/api/members/me', { method: 'PATCH', credentials: 'include', body: formData });
      const data = await res.json();

      if (data.success) {
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        setProfile(data.data);
        setEditing(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        if (onRefresh) onRefresh();
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error. Please try again.' });
    }
    setSaving(false);
  }

  function cancelEdit() {
    setEditing(false);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (profile) {
      setForm({
        bio:       profile.bio || '',
        address:   profile.address || '',
        interests: (profile.interests || []).join(', '),
        skills:    (profile.skills || []).join(', '),
      });
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 size={36} className="animate-spin" color="#0284C7" /></div>;

  const p = profile || member;

  const ROW = ({ label, value, muted }) => (
    <div style={{ padding: '0.75rem 0', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ minWidth: '140px', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '0.9rem', color: muted ? '#94A3B8' : '#0F172A', flex: 1 }}>{value || '—'}</div>
    </div>
  );

  const FIELD = ({ label, value, name, textarea, placeholder, hint }) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
        {label} {hint && <span style={{ color: '#94A3B8', fontWeight: 400 }}>({hint})</span>}
      </label>
      {textarea ? (
        <textarea
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          placeholder={placeholder}
          rows={3}
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid #E2E8F0', borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />
      ) : (
        <input
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          placeholder={placeholder}
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid #E2E8F0', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
        />
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>My Profile</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>Your membership information.</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <Edit2 size={15} /> Edit Profile
          </button>
        )}
      </div>

      {msg && (
        <div style={{ background: msg.type === 'success' ? '#F0FDF4' : '#FFF1F2', border: `1px solid ${msg.type === 'success' ? '#86EFAC' : '#FECDD3'}`, borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: msg.type === 'success' ? '#166534' : '#BE123C', fontSize: '0.875rem' }}>
          {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

        {/* Photo & ID card */}
        <div style={{ background: '#FFFFFF', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
            {(photoPreview || p?.profilePhoto) ? (
              <img
                src={photoPreview || p.profilePhoto}
                alt={p?.name}
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #E0F2FE' }}
              />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg,#0284C7,#E11D48)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2.5rem', fontWeight: 900 }}>
                {p?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            {editing && (
              <label style={{ position: 'absolute', bottom: '4px', right: '4px', background: '#0284C7', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                <Camera size={14} color="#FFF" />
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem' }}>{p?.name}</h3>
          <div style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 700, fontFamily: 'monospace', marginBottom: '0.5rem' }}>{p?.memberId}</div>
          <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '999px' }}>
            {p?.status || 'Active'}
          </span>
        </div>

        {/* Membership info (read-only) */}
        <div style={{ background: '#FFFFFF', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>Membership Details</h3>
          <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <AlertCircle size={13} /> Locked fields can only be changed by your Unit Admin.
          </p>
          <ROW label="Member ID"   value={p?.memberId}  />
          <ROW label="Unit"        value={p?.unitName}  />
          <ROW label="Status"      value={p?.status}    />
          <ROW label="Role"        value={p?.roleLabel} />
          <ROW label="Joined"      value={p?.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : '—'} />
          {p?.validUntil && <ROW label="Valid Until" value={new Date(p.validUntil).toLocaleDateString()} />}
        </div>

        {/* Personal info (read-only) */}
        <div style={{ background: '#FFFFFF', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>Personal Information</h3>
          <ROW label="Name"       value={p?.name}       />
          <ROW label="Email"      value={p?.email}      />
          <ROW label="Phone"      value={p?.phone}      />
          <ROW label="Gender"     value={p?.gender}     />
          <ROW label="College"    value={p?.college}    />
          <ROW label="Department" value={p?.department} />
          <ROW label="Year"       value={p?.year}       />
        </div>

        {/* Editable fields */}
        <div style={{ background: '#FFFFFF', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>About Me</h3>
          {editing ? (
            <>
              <FIELD label="Bio"             name="bio"       textarea placeholder="Tell us about yourself…" />
              <FIELD label="Interests"       name="interests" placeholder="e.g. Leadership, Environment, Tech" hint="comma-separated" />
              <FIELD label="Skills"          name="skills"    placeholder="e.g. Public Speaking, Graphic Design" hint="comma-separated" />
              <FIELD label="Address / City"  name="address"   placeholder="Your city or locality" />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#0284C7', color: '#FFF', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                </button>
                <button onClick={cancelEdit} style={{ padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#475569', fontWeight: 600 }}>
                  <X size={16} /> Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <ROW label="Bio"       value={p?.bio}       muted={!p?.bio}       />
              <ROW label="Interests" value={(p?.interests || []).join(', ')} muted={!(p?.interests?.length)} />
              <ROW label="Skills"    value={(p?.skills || []).join(', ')}    muted={!(p?.skills?.length)}    />
              <ROW label="Address"   value={p?.address}   muted={!p?.address}   />
            </>
          )}
        </div>

      </div>
    </div>
  );
}

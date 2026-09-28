/**
 * src/pages/member/MemberCertificates.jsx
 * Member's digital certificates — view and download.
 */
import React, { useState, useEffect } from 'react';
import { Award, Download, ExternalLink, Loader2, RefreshCw, Calendar } from 'lucide-react';

export default function MemberCertificates({ member }) {
  const [certs, setCerts]     = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch('/api/member/certificates/my', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setCerts(data.data || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>My Certificates</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Certificates issued for your participation.
          </p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.5rem', color: '#475569', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={36} className="animate-spin" color="#0284C7" />
        </div>
      ) : certs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#FFFFFF', borderRadius: '1rem', border: '1px dashed #E2E8F0' }}>
          <Award size={48} color="#CBD5E1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>No certificates yet</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Certificates will appear here after your admin issues them for events or programs you've participated in.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {certs.map(cert => (
            <div key={cert.id} style={{ background: '#FFFFFF', borderRadius: '1rem', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '0.625rem', background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Award size={22} color="#D97706" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F172A', margin: 0, lineHeight: 1.3 }}>{cert.title}</h3>
                  {cert.eventTitle && (
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>For: {cert.eventTitle}</div>
                  )}
                </div>
              </div>

              {cert.description && (
                <p style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '0.875rem', lineHeight: 1.5, margin: '0 0 0.875rem' }}>
                  {cert.description}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem', fontSize: '0.8rem', color: '#64748B' }}>
                <Calendar size={13} color="#0284C7" />
                Issued {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>

              {cert.fileUrl ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href={cert.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.625rem', background: '#EFF6FF', color: '#1D4ED8', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem', border: '1px solid #BAE6FD' }}
                  >
                    <ExternalLink size={14} /> View
                  </a>
                  <a
                    href={cert.fileUrl}
                    download
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.625rem', background: 'linear-gradient(135deg,#0284C7,#0369A1)', color: '#FFFFFF', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem' }}
                  >
                    <Download size={14} /> Download
                  </a>
                </div>
              ) : (
                <div style={{ padding: '0.625rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center' }}>
                  No file attached
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

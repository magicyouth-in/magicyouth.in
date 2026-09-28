/**
 * src/pages/MemberVerify.jsx
 * Public membership verification page — /verify-member/:memberId
 * Shows only safe, public information. Never exposes private data.
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldX, Loader2, CheckCircle, XCircle, Calendar, Building2, User, CreditCard } from 'lucide-react';

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function MemberVerify() {
  const { memberId }     = useParams();
  const [data, setData]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [found, setFound]     = useState(false);

  useEffect(() => {
    fetch(`/api/members/verify/${memberId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) { setData(d.data); setFound(true); }
        else setFound(false);
      })
      .catch(() => setFound(false))
      .finally(() => setLoading(false));
  }, [memberId]);

  const isActive = data?.status === 'Active';

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Brand header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img src="/assets/magic-logo.png" alt="MAGIC Youth" style={{ width: '56px', height: '56px', objectFit: 'contain', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#0284C7' }}>MAGIC <span style={{ color: '#E11D48' }}>Youth</span></div>
          <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>MEMBERSHIP VERIFICATION</div>
        </Link>
      </div>

      {loading ? (
        <div style={{ background: '#FFFFFF', borderRadius: '1.25rem', padding: '3rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Loader2 size={40} className="animate-spin" color="#0284C7" />
          <p style={{ color: '#64748B', marginTop: '1rem' }}>Verifying membership…</p>
        </div>
      ) : !found ? (
        <div style={{ background: '#FFFFFF', borderRadius: '1.25rem', padding: '3rem 2rem', textAlign: 'center', maxWidth: '420px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #FECDD3' }}>
          <ShieldX size={56} color="#DC2626" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>Member Not Found</h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            The Member ID <strong style={{ fontFamily: 'monospace' }}>{memberId}</strong> was not found in the MAGIC Youth database. This QR code may be invalid or the membership may have been revoked.
          </p>
          <Link to="/" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>← Back to website</Link>
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', borderRadius: '1.25rem', overflow: 'hidden', maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: `2px solid ${isActive ? '#86EFAC' : '#FECDD3'}` }}>

          {/* Status banner */}
          <div style={{ background: isActive ? 'linear-gradient(135deg,#166534,#15803D)' : '#DC2626', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isActive ? <ShieldCheck size={28} color="#FFFFFF" /> : <ShieldX size={28} color="#FFFFFF" />}
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>
                {isActive ? 'Membership Verified' : 'Membership Invalid'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
                {isActive ? 'This is a valid MAGIC Youth member.' : `Status: ${data.status}`}
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={18} color="#0284C7" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>FULL NAME</div>
                  <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0F172A' }}>{data.name}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CreditCard size={18} color="#0284C7" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>MEMBER ID</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{data.memberId}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={18} color="#0284C7" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>UNIT / CHAPTER</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0F172A' }}>{data.unitName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={18} color="#0284C7" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>MEMBERSHIP STATUS</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: isActive ? '#DCFCE7' : '#FFF1F2', color: isActive ? '#166534' : '#BE123C', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8125rem', fontWeight: 700, marginTop: '0.2rem' }}>
                    {isActive ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    {data.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={18} color="#0284C7" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>OFFICIAL DESIGNATION</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{data.roleLabel || 'Member'}</span>
                    {data.membershipType === 'LEADERSHIP' && (
                      <span style={{ fontSize: '0.65rem', background: '#E11D48', color: '#FFFFFF', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                        LEADERSHIP
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {data.joinedAt && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={18} color="#0284C7" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>MEMBER SINCE</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0F172A' }}>{formatDate(data.joinedAt)}</div>
                  </div>
                </div>
              )}

              {data.validUntil && (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={18} color="#0284C7" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>VALID UNTIL</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0F172A' }}>{formatDate(data.validUntil)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy note */}
            <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '0.625rem', fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center', lineHeight: 1.5 }}>
              This verification page displays only safe public information. Contact and personal details are not shown.
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
            <Link to="/" style={{ fontSize: '0.8125rem', color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>
              ← MAGIC Youth Official Website
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * src/pages/member/MemberECard.jsx
 * Digital Membership E-Card with QR code, download, and print.
 */
import React, { useRef, useState, useEffect } from 'react';
import { Download, Printer, QrCode, Share2, Loader2, CheckCircle } from 'lucide-react';

// Inline QR code using a public API (no npm dependency needed)
function QRCodeImg({ value, size = 120 }) {
  const encoded = encodeURIComponent(value);
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=0284C7&bgcolor=FFFFFF&margin=4`}
      alt="QR Code"
      width={size}
      height={size}
      style={{ borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}
    />
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MemberECard({ member }) {
  const cardRef           = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    fetch('/api/members/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setProfile(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const data = profile || member;
  const verifyUrl = `${window.location.origin}/verify-member/${data?.memberId}`;

  function handlePrint() {
    const cardEl = cardRef.current;
    if (!cardEl) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>MAGIC Youth E-Card — ${data?.name}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        body { margin: 0; padding: 24px; font-family: Inter, sans-serif; background: #f8fafc; display: flex; justify-content: center; }
        @media print { body { padding: 0; background: white; } }
      </style>
      </head><body>${cardEl.outerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 size={36} className="animate-spin" color="#0284C7" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>My E-Card</h2>
        <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
          Your official MAGIC Youth digital membership card.
        </p>
      </div>

      {/* E-Card */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div
          ref={cardRef}
          style={{
            width: '100%', maxWidth: '420px',
            background: 'linear-gradient(145deg, #0F172A 0%, #1E3A5F 60%, #0F172A 100%)',
            borderRadius: '1.25rem',
            padding: '1.75rem',
            color: '#FFFFFF',
            boxShadow: '0 20px 60px rgba(2, 132, 199, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Background decorations */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(2, 132, 199, 0.15)' }} />
          <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(225, 29, 72, 0.1)' }} />

          {/* Card Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src="/assets/magic-logo.png"
                alt="MAGIC Youth"
                style={{ width: '44px', height: '44px', objectFit: 'contain', filter: 'brightness(1.1)' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.05em', color: '#FFFFFF' }}>
                  MAGIC <span style={{ color: '#FB7185' }}>YOUTH</span>
                </div>
                <div style={{ fontSize: '0.6rem', color: '#93C5FD', fontWeight: 600, letterSpacing: '0.12em' }}>A YES-J YOUTH WING</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6rem', color: '#93C5FD', letterSpacing: '0.1em', fontWeight: 600 }}>MEMBERSHIP CARD</div>
              <div style={{ fontSize: '0.7rem', color: '#BAE6FD', fontWeight: 600, marginTop: '0.2rem' }}>{data?.academicYear || new Date().getFullYear()}</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(147,197,253,0.4), transparent)', marginBottom: '1.25rem' }} />

          {/* Member info row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
            {/* Photo */}
            {data?.profilePhoto ? (
              <img
                src={data.profilePhoto}
                alt={data.name}
                style={{ width: '72px', height: '72px', borderRadius: '0.75rem', objectFit: 'cover', border: '2px solid rgba(147,197,253,0.5)', flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: '72px', height: '72px', borderRadius: '0.75rem', background: 'linear-gradient(135deg,#0284C7,#E11D48)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '1.75rem', fontWeight: 900, border: '2px solid rgba(147,197,253,0.3)', flexShrink: 0 }}>
                {data?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Details */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: '0.25rem' }}>
                {data?.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 700, letterSpacing: '0.05em' }}>
                  {(data?.assignedRole || data?.roleLabel || 'MEMBER').toUpperCase()}
                </span>
                {data?.membershipType === 'LEADERSHIP' && (
                  <span style={{ fontSize: '0.65rem', background: '#E11D48', color: '#FFFFFF', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 800, letterSpacing: '0.05em' }}>
                    LEADERSHIP
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                <div>{data?.college || data?.unitName}</div>
                <div>{data?.department}</div>
                <div style={{ color: '#94A3B8', fontSize: '0.7rem' }}>Year: {data?.year}</div>
              </div>
            </div>
          </div>

          {/* Member ID + Unit */}
          <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '0.625rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.6rem', color: '#93C5FD', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '0.2rem' }}>MEMBER ID</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{data?.memberId}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: '#93C5FD', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '0.2rem' }}>UNIT</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E2E8F0' }}>{data?.unitName}</div>
              </div>
              {data?.validUntil && (
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#93C5FD', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '0.2rem' }}>VALID UNTIL</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E2E8F0' }}>{formatDate(data.validUntil)}</div>
                </div>
              )}
            </div>
          </div>

          {/* QR code + Status */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: '0.6rem', color: '#93C5FD', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.5rem' }}>SCAN TO VERIFY</div>
              <div style={{ background: '#FFFFFF', borderRadius: '0.625rem', padding: '6px', display: 'inline-block' }}>
                <QRCodeImg value={verifyUrl} size={80} />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#16A34A', borderRadius: '999px', padding: '0.3rem 0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#86EFAC', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.08em' }}>{(data?.status || 'ACTIVE').toUpperCase()}</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>
                Joined {formatDate(data?.joinedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '420px' }}>
          <button
            onClick={handlePrint}
            style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'linear-gradient(135deg, #0284C7, #0369A1)', color: '#FFFFFF', border: 'none', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            <Printer size={16} /> Download / Print
          </button>
          <button
            onClick={handleCopyLink}
            style={{ flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: copied ? '#DCFCE7' : '#F8FAFC', color: copied ? '#166534' : '#374151', border: '1.5px solid', borderColor: copied ? '#86EFAC' : '#E2E8F0', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            {copied ? <><CheckCircle size={16} /> Copied!</> : <><Share2 size={16} /> Copy Verify Link</>}
          </button>
        </div>

        {/* Info note */}
        <div style={{ maxWidth: '420px', width: '100%', background: '#EFF6FF', borderRadius: '0.625rem', padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#1D4ED8', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <QrCode size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <span>The QR code links to a public verification page at <strong>{verifyUrl.split('/').slice(-2).join('/')}</strong> — only safe information is shown there.</span>
        </div>
      </div>
    </div>
  );
}

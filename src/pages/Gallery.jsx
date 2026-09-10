import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Building2, CalendarDays, ChevronDown, Loader2, ZoomIn } from 'lucide-react';
import '../styles/about.css';
import '../styles/gallery.css';

export default function Gallery() {
  const [photos,   setPhotos]   = useState([]);
  const [units,    setUnits]    = useState([]);
  const [years,    setYears]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);

  const [filters, setFilters] = useState({ unitId: '', academicYearId: '', album: '' });

  // Load units
  useEffect(() => {
    fetch('/api/units').then(r => r.json()).then(d => { if (d.success) setUnits(d.data); });
  }, []);

  // Load years when unit changes
  useEffect(() => {
    if (!filters.unitId) { setYears([]); return; }
    fetch(`/api/academic-years?unitId=${filters.unitId}`).then(r => r.json()).then(d => { if (d.success) setYears(d.data); });
  }, [filters.unitId]);

  // Load photos
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 24 });
    if (filters.unitId)         params.set('unitId',         filters.unitId);
    if (filters.academicYearId) params.set('academicYearId', filters.academicYearId);
    if (filters.album)          params.set('album',          filters.album);

    fetch(`/api/gallery?${params}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setPhotos(d.data || []); setTotal(d.pagination?.total || 0); } setLoading(false); })
      .catch(() => setLoading(false));
  }, [filters, page]);

  const setFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1); };

  const totalPages = Math.ceil(total / 24);

  const prevPhoto = () => {
    const idx = photos.findIndex(p => p._id === lightbox._id);
    if (idx > 0) setLightbox(photos[idx - 1]);
  };
  const nextPhoto = () => {
    const idx = photos.findIndex(p => p._id === lightbox._id);
    if (idx < photos.length - 1) setLightbox(photos[idx + 1]);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!lightbox) return;
    const handler = e => {
      if (e.key === 'ArrowLeft')  prevPhoto();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'Escape')     setLightbox(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, photos]);

  return (
    <div>
      {/* ── GALLERY HERO ─────────────────────────────────────────── */}
      <section className="gallery-hero">
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <span className="hero-badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>Photo Archive</span>
          <h1 className="hero-title" style={{ color: 'white', fontSize: '3.5rem', marginBottom: '1rem' }}>
            Moments &amp; Memories
          </h1>
          <p className="hero-subtitle" style={{ color: 'rgba(255,255,255,0.8)' }}>
            A visual record of our community impact, leadership programs, and collective achievements.
          </p>
        </div>
      </section>

      {/* ── FILTERS & GALLERY GRID ───────────────────────────────── */}
      <section className="gallery-section">
        <div className="gallery-container">
          <div className="filter-grid">
            <div className="filter-group">
              <label>Unit</label>
              <div className="filter-input-wrap">
                <Building2 className="filter-icon" />
                <select value={filters.unitId} onChange={e => { setFilter('unitId', e.target.value); setFilter('academicYearId', ''); }}>
                  <option value="">All Units</option>
                  {units.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
                <ChevronDown className="filter-chevron" />
              </div>
            </div>

            <div className="filter-group">
              <label>Academic Year</label>
              <div className="filter-input-wrap">
                <CalendarDays className="filter-icon" />
                <select 
                  value={filters.academicYearId} 
                  onChange={e => setFilter('academicYearId', e.target.value)}
                  disabled={!filters.unitId}
                >
                  <option value="">All Years</option>
                  {years.map(y => <option key={y._id} value={y._id}>{y.year}</option>)}
                </select>
                <ChevronDown className="filter-chevron" />
              </div>
            </div>
          </div>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <Loader2 className="animate-spin" style={{ width: 36, height: 36, color: 'var(--primary-blue)' }} />
            </div>
          )}

          {!loading && photos.length === 0 && (
            <div className="events-empty">
              <h3>Our moments will appear here soon.</h3>
              <p>Try selecting a different unit or academic year.</p>
            </div>
          )}

          {!loading && photos.length > 0 && (
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 600 }}>
                Showing {total} moment{total !== 1 ? 's' : ''}
              </div>
              <div className="gallery-grid">
                {photos.map((photo, i) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                    key={photo._id}
                    className="gallery-item"
                    onClick={() => setLightbox(photo)}
                  >
                    <img
                      src={photo.file_path}
                      alt={photo.title || 'Gallery photo'}
                      className="gallery-img"
                      loading="lazy"
                    />
                    <div className="gallery-overlay">
                      <ZoomIn style={{ width: 28, height: 28 }} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '3rem' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 700, border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                  >
                    ← Previous
                  </button>
                  <span style={{ fontSize: '0.875rem', color: '#4B5563', fontWeight: 600 }}>Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 700, border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <div className="lightbox-backdrop" onClick={() => setLightbox(null)}>
            <button
              style={{ position: 'absolute', top: 20, right: 20, color: '#FFFFFF', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}
              onClick={() => setLightbox(null)}
            >
              <X style={{ width: 24, height: 24 }} />
            </button>

            <button
              style={{ position: 'absolute', left: 20, color: '#FFFFFF', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '0.75rem', cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); prevPhoto(); }}
            >
              <ChevronLeft style={{ width: 24, height: 24 }} />
            </button>

            <img
              src={lightbox.file_path}
              alt={lightbox.title || 'Gallery photo'}
              style={{ maxWidth: '90%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '0.75rem' }}
              onClick={e => e.stopPropagation()}
            />

            <button
              style={{ position: 'absolute', right: 20, color: '#FFFFFF', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '0.75rem', cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); nextPhoto(); }}
            >
              <ChevronRight style={{ width: 24, height: 24 }} />
            </button>

            {(lightbox.title || lightbox.album) && (
              <div style={{ position: 'absolute', bottom: 24, textAlign: 'center', color: '#FFFFFF', fontSize: '0.9375rem', fontWeight: 600 }}>
                {lightbox.title || lightbox.album}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

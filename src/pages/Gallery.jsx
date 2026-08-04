import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, ZoomIn } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.05 } })
};

export default function Gallery() {
  const [photos, setPhotos]   = useState([]);
  const [albums, setAlbums]   = useState([]);
  const [selected, setSelected] = useState('');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then(d => { if (d.success) setPhotos(d.data || []); })
      .catch(() => {});

    fetch('/api/gallery/albums')
      .then(r => r.json())
      .then(d => { if (d.success) setAlbums(d.data || []); })
      .catch(() => {});
  }, []);

  const filtered = selected
    ? photos.filter(p => p.eventName?.toLowerCase() === selected.toLowerCase())
    : photos;

  const prev = () => {
    const idx = filtered.findIndex(p => p._id === lightbox._id);
    if (idx > 0) setLightbox(filtered[idx - 1]);
  };
  const next = () => {
    const idx = filtered.findIndex(p => p._id === lightbox._id);
    if (idx < filtered.length - 1) setLightbox(filtered[idx + 1]);
  };

  return (
    <div>

      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="page-header px-4">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-950/70 px-3.5 py-1 rounded-full border border-purple-500/25 mb-4">
            Visual Memories
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            MAGIC Youth <span className="gradient-text-purple">Gallery</span>
          </h1>
          <p className="mt-4 text-purple-200/65 text-sm max-w-xl mx-auto leading-relaxed">
            Moments captured from campus drives, chess tournaments, cultural festivals,
            community service initiatives, and volunteer programs.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── ALBUM FILTER ──────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          <button
            onClick={() => setSelected('')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selected === '' ? 'btn-purple-glow text-white' : 'btn-ghost'
            }`}
          >
            All Photos ({photos.length})
          </button>
          {albums.map(a => (
            <button
              key={a.eventName}
              onClick={() => setSelected(a.eventName)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selected.toLowerCase() === a.eventName?.toLowerCase() ? 'btn-purple-glow text-white' : 'btn-ghost'
              }`}
            >
              {a.eventName} ({a.photoCount || ''})
            </button>
          ))}
        </div>

        {/* ── PHOTO GRID ────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((photo, i) => (
              <motion.div
                key={photo._id || i}
                custom={i % 8} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                onClick={() => setLightbox(photo)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-purple-500/15 hover:border-purple-400/45 transition-all break-inside-avoid"
              >
                <img
                  src={`/uploads/gallery/${photo.filename}`}
                  alt={photo.caption || photo.eventName || 'Gallery'}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-white text-left">
                    <p className="font-bold text-xs">{photo.eventName || 'MAGIC Youth'}</p>
                    {photo.caption && <p className="text-[10px] text-purple-300/80 mt-0.5 line-clamp-1">{photo.caption}</p>}
                  </div>
                  <ZoomIn className="w-5 h-5 text-white/60 absolute top-3 right-3" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-purple-300/40">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No photos found in this album.</p>
          </div>
        )}

      </div>

      {/* ── LIGHTBOX ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setLightbox(null); }}
          >
            <button onClick={() => setLightbox(null)} className="absolute top-5 right-5 text-white/60 hover:text-white">
              <X className="w-7 h-7" />
            </button>

            {/* Prev / Next */}
            <button onClick={prev} className="absolute left-4 sm:left-8 text-white/50 hover:text-white text-3xl font-bold transition-colors">‹</button>
            <button onClick={next} className="absolute right-4 sm:right-8 text-white/50 hover:text-white text-3xl font-bold transition-colors">›</button>

            <motion.div
              key={lightbox._id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl w-full text-center"
            >
              <img
                src={`/uploads/gallery/${lightbox.filename}`}
                alt={lightbox.caption}
                className="max-h-[78vh] mx-auto rounded-2xl object-contain border border-purple-500/30"
              />
              <div className="mt-4 text-white">
                {lightbox.eventName && <p className="font-bold text-sm">{lightbox.eventName}</p>}
                {lightbox.caption   && <p className="text-xs text-purple-300/70 mt-1">{lightbox.caption}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

/**
 * scripts/migrate-files-to-supabase.js
 * Migrates files from local uploads/ to Supabase Storage buckets ('gallery', 'events', 'documents').
 * Updates PostgreSQL table references with new Supabase Storage public/relative paths.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const supabase = require('../utils/supabaseClient');
const { BUCKETS, initStorageBuckets, uploadFile } = require('../utils/supabaseStorage');

async function migrateFiles() {
  console.log('=== LOCAL/NEXTCLOUD FILES TO SUPABASE STORAGE MIGRATION ===\n');

  await initStorageBuckets();

  const report = {
    Gallery: { filesFound: 0, migrated: 0, failed: 0 },
    Events: { filesFound: 0, migrated: 0, failed: 0 },
    Documents: { filesFound: 0, migrated: 0, failed: 0 },
  };

  // 1. Migrate Gallery Photos
  const { data: galleryItems } = await supabase.from('gallery').select('*');
  for (const g of (galleryItems || [])) {
    if (!g.file_path || g.file_path.startsWith('http://') || g.file_path.startsWith('https://')) continue;
    
    // Find local file path
    const relativePath = g.file_path.replace(/^\/?(uploads\/)?/, '');
    const possibleLocal = path.join(__dirname, '..', 'uploads', relativePath);

    if (fs.existsSync(possibleLocal)) {
      report.Gallery.filesFound++;
      try {
        const destination = `gallery/${path.basename(possibleLocal)}`;
        const { publicUrl } = await uploadFile(BUCKETS.GALLERY, possibleLocal, destination);
        await supabase.from('gallery').update({ file_path: publicUrl }).eq('id', g.id);
        report.Gallery.migrated++;
        console.log(`[Gallery Migrated] ${possibleLocal} -> ${publicUrl}`);
      } catch (err) {
        console.error(`[Gallery File Error] ${g.id}:`, err.message);
        report.Gallery.failed++;
      }
    }
  }

  // 2. Migrate Event Posters & Photos
  const { data: eventItems } = await supabase.from('events').select('*');
  for (const e of (eventItems || [])) {
    if (e.poster && !e.poster.startsWith('http://') && !e.poster.startsWith('https://')) {
      const relativePath = e.poster.replace(/^\/?(uploads\/)?/, '');
      const possibleLocal = path.join(__dirname, '..', 'uploads', relativePath);
      if (fs.existsSync(possibleLocal)) {
        report.Events.filesFound++;
        try {
          const destination = `events/${path.basename(possibleLocal)}`;
          const { publicUrl } = await uploadFile(BUCKETS.EVENTS, possibleLocal, destination);
          await supabase.from('events').update({ poster: publicUrl }).eq('id', e.id);
          report.Events.migrated++;
          console.log(`[Event Poster Migrated] ${possibleLocal} -> ${publicUrl}`);
        } catch (err) {
          console.error(`[Event Poster Error] ${e.id}:`, err.message);
          report.Events.failed++;
        }
      }
    }
  }

  // 3. Migrate Documents
  const { data: docItems } = await supabase.from('documents').select('*');
  for (const d of (docItems || [])) {
    if (d.file_path && !d.file_path.startsWith('http://') && !d.file_path.startsWith('https://')) {
      const relativePath = d.file_path.replace(/^\/?(uploads\/)?/, '');
      const possibleLocal = path.join(__dirname, '..', 'uploads', relativePath);
      if (fs.existsSync(possibleLocal)) {
        report.Documents.filesFound++;
        try {
          const destination = `documents/${path.basename(possibleLocal)}`;
          const { publicUrl } = await uploadFile(BUCKETS.DOCUMENTS, possibleLocal, destination);
          await supabase.from('documents').update({ file_path: publicUrl }).eq('id', d.id);
          report.Documents.migrated++;
          console.log(`[Document Migrated] ${possibleLocal} -> ${publicUrl}`);
        } catch (err) {
          console.error(`[Document Error] ${d.id}:`, err.message);
          report.Documents.failed++;
        }
      }
    }
  }

  console.log('\n=== FILE MIGRATION SUMMARY TABLE ===');
  console.table(report);

  process.exit(0);
}

migrateFiles().catch(err => {
  console.error('[FILE MIGRATION FATAL]', err.message);
  process.exit(1);
});

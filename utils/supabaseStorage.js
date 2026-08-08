/**
 * utils/supabaseStorage.js
 * Supabase Storage integration for MAGIC Youth file uploads & management.
 * Replaces Nextcloud WebDAV and local file system uploads.
 */

const fs = require('fs');
const path = require('path');
const supabase = require('./supabaseClient');

const BUCKETS = {
  GALLERY: 'gallery',
  EVENTS: 'events',
  DOCUMENTS: 'documents',
};

/**
 * Ensure Supabase Storage buckets exist on startup.
 */
async function initStorageBuckets() {
  try {
    const { data: existingBuckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn('[Supabase Storage] Could not list buckets:', error.message);
      return;
    }

    const bucketNames = (existingBuckets || []).map(b => b.name);

    for (const bucket of Object.values(BUCKETS)) {
      if (!bucketNames.includes(bucket)) {
        const isPublic = bucket !== 'documents'; // documents can have restricted access
        const { error: createError } = await supabase.storage.createBucket(bucket, {
          public: isPublic,
          fileSizeLimit: 25 * 1024 * 1024, // 25MB
        });
        if (createError) {
          console.warn(`[Supabase Storage] Bucket "${bucket}" creation info:`, createError.message);
        } else {
          console.log(`[Supabase Storage] Created bucket "${bucket}" (Public: ${isPublic}) ✓`);
        }
      }
    }
    console.log('[Supabase Storage] Storage buckets verified ✓');
  } catch (err) {
    console.warn('[Supabase Storage] Initialization warning:', err.message);
  }
}

/**
 * Upload a local file to Supabase Storage bucket.
 * @param {string} bucketName - 'gallery' | 'events' | 'documents'
 * @param {string} localFilePath - Path to file on disk
 * @param {string} destinationPath - Path inside storage bucket (e.g. "2026/event-name/poster.jpg")
 * @param {string} [mimeType] - File MIME type
 * @returns {Promise<{ filePath: string, publicUrl: string }>}
 */
async function uploadFile(bucketName, localFilePath, destinationPath, mimeType) {
  if (!fs.existsSync(localFilePath)) {
    throw new Error(`File not found at path: ${localFilePath}`);
  }

  const fileBuffer = fs.readFileSync(localFilePath);
  const cleanPath = destinationPath.replace(/^\/+/, '');

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(cleanPath, fileBuffer, {
      contentType: mimeType || 'application/octet-stream',
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);

  return {
    filePath: data.path,
    publicUrl: urlData?.publicUrl || '',
  };
}

/**
 * Get Public URL for a file in Supabase Storage.
 */
function getPublicUrl(bucketName, filePath) {
  if (!filePath) return null;
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data?.publicUrl || null;
}

/**
 * Delete a file from Supabase Storage bucket.
 */
async function deleteFile(bucketName, filePath) {
  if (!filePath) return;
  const cleanPath = filePath.replace(/^\/+/, '');
  const { error } = await supabase.storage.from(bucketName).remove([cleanPath]);
  if (error) {
    console.warn(`[Supabase Storage] Delete warning for ${filePath}:`, error.message);
  }
}

module.exports = {
  BUCKETS,
  initStorageBuckets,
  uploadFile,
  getPublicUrl,
  deleteFile,
};

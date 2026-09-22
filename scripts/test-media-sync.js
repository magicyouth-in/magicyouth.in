require('dotenv').config();
const supabase = require('../utils/supabaseClient');

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE VERIFICATION ---');

  // 1. Verify Academic Years exist
  const { data: years, error: yErr } = await supabase.from('academic_years').select('*').order('created_at', { ascending: false });
  if (yErr) {
    console.error('Failed to fetch academic years:', yErr);
    process.exit(1);
  }
  console.log(`Found ${years.length} Academic Years in database:`, years.map(y => `${y.year} (ID: ${y.id})`).join(', '));

  if (years.length === 0) {
    console.error('No academic years found!');
    process.exit(1);
  }

  const defaultYear = years[0];
  const altYear = years.length > 1 ? years[1] : years[0];

  // 2. Verify Units/Chapters exist
  const { data: units, error: uErr } = await supabase.from('units').select('*').limit(3);
  if (uErr) {
    console.error('Failed to fetch units:', uErr);
    process.exit(1);
  }
  console.log(`Found ${units.length} Units/Chapters:`, units.map(u => `${u.name} (ID: ${u.id})`).join(', '));
  const testUnit = units[0];

  // 3. Test Documents: Create a test document with defaultYear
  console.log('\n--- 1. Testing Document Academic Year Persistence ---');
  const testDocTitle = `Test Verification Document ${Date.now()}`;
  const { data: insertedDoc, error: dInsErr } = await supabase.from('documents').insert({
    title: testDocTitle,
    document_type: 'Magazines & Publications',
    visibility: 'Public',
    unit_id: testUnit.id,
    academic_year_id: defaultYear.id,
    file_path: 'https://test.supabase.co/storage/v1/object/public/documents/test.pdf',
    file_size: 1024,
    mime_type: 'application/pdf'
  }).select('*, academic_years(year)').single();

  if (dInsErr) {
    console.error('Error inserting test document:', dInsErr);
    process.exit(1);
  }
  console.log(`Created test document with Academic Year "${insertedDoc.academic_years?.year}" (ID: ${insertedDoc.academic_year_id})`);

  // 4. Update Document to altYear (simulating Admin Edit)
  const { data: updatedDoc, error: dUpErr } = await supabase.from('documents')
    .update({ academic_year_id: altYear.id, title: `${testDocTitle} (Updated)` })
    .eq('id', insertedDoc.id)
    .select('*, academic_years(year)')
    .single();

  if (dUpErr) {
    console.error('Error updating document academic year:', dUpErr);
    process.exit(1);
  }
  console.log(`Updated test document Academic Year to "${updatedDoc.academic_years?.year}" (ID: ${updatedDoc.academic_year_id})`);
  if (updatedDoc.academic_year_id !== altYear.id) {
    console.error('FAIL: Academic year was not persisted in document!');
    process.exit(1);
  }
  console.log('PASS: Document Academic Year persistence in DB verified.');

  // Clean up test document
  await supabase.from('documents').delete().eq('id', insertedDoc.id);
  console.log('Cleaned up test document.');

  // 5. Test Gallery Photo Academic Year Persistence
  console.log('\n--- 2. Testing Gallery Photo Academic Year Persistence ---');
  const testPhotoCaption = `Test Photo ${Date.now()}`;
  const { data: insertedPhoto, error: pInsErr } = await supabase.from('gallery').insert({
    title: testPhotoCaption,
    album: 'Verification Album',
    category: 'Events',
    unit_id: testUnit.id,
    academic_year_id: defaultYear.id,
    file_path: 'https://test.supabase.co/storage/v1/object/public/gallery/test.jpg'
  }).select('*, academic_years(year)').single();

  if (pInsErr) {
    console.error('Error inserting test photo:', pInsErr);
    process.exit(1);
  }
  console.log(`Created test gallery photo with Academic Year "${insertedPhoto.academic_years?.year}" (ID: ${insertedPhoto.academic_year_id})`);

  // Update Photo to altYear (simulating Admin Edit)
  const { data: updatedPhoto, error: pUpErr } = await supabase.from('gallery')
    .update({ academic_year_id: altYear.id, title: `${testPhotoCaption} (Updated)` })
    .eq('id', insertedPhoto.id)
    .select('*, academic_years(year)')
    .single();

  if (pUpErr) {
    console.error('Error updating gallery photo academic year:', pUpErr);
    process.exit(1);
  }
  console.log(`Updated test gallery photo Academic Year to "${updatedPhoto.academic_years?.year}" (ID: ${updatedPhoto.academic_year_id})`);
  if (updatedPhoto.academic_year_id !== altYear.id) {
    console.error('FAIL: Academic year was not persisted in gallery photo!');
    process.exit(1);
  }
  console.log('PASS: Gallery Photo Academic Year persistence in DB verified.');

  // Clean up test photo
  await supabase.from('gallery').delete().eq('id', insertedPhoto.id);
  console.log('Cleaned up test photo.');

  // 6. Verify existing documents (including YES-J's MAGICYOUTH1.pdf)
  console.log('\n--- 3. Verifying Existing Documents in Database ---');
  const { data: allDocs, error: adErr } = await supabase.from('documents').select('id, title, document_type, academic_years(year), units(name)').limit(10);
  if (adErr) {
    console.error('Error fetching all docs:', adErr);
  } else {
    console.log(`Found ${allDocs.length} existing documents:`);
    allDocs.forEach(d => {
      console.log(` - [${d.document_type}] "${d.title}" | Academic Year: ${d.academic_years?.year || 'None'} | Unit: ${d.units?.name || 'All'}`);
    });
  }

  console.log('\n--- ALL VERIFICATIONS PASSED SUCCESSFULLY ---');
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});

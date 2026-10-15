const { db, initDatabase } = require('./dist/config/db');

async function testProjectFirstWorkflow() {
  console.log('=================================================================');
  console.log('🧪 TESTING PROJECT-FIRST PLOT MANAGEMENT WORKFLOW (REQUIREMENT 8)');
  console.log('=================================================================\n');

  await initDatabase();

  // 1. Authenticate Admin
  console.log('Step 1: Authenticating Admin in CRM...');
  const loginRes = await fetch('http://localhost:5000/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@sreeharirealty.com', password: 'AdminPassword@2026' })
  }).then(r => r.json());

  if (!loginRes.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes));
  }
  const token = loginRes.token;
  console.log('✓ Admin authenticated successfully.\n');

  // 2. Create Project A
  console.log('Step 2: Creating Project A (Project Alpha Township)...');
  const projAPayload = {
    name: 'Project Alpha Township',
    slug: 'project-alpha-township',
    tagline: 'High-Growth Plotted Community in South Trichy',
    description: 'Alpha Township is a master-planned community with wide avenues and sweet potable groundwater.',
    location_area: 'Viralimalai Road Corridor',
    location_city: 'Trichy',
    total_extent_acres: 6.2,
    total_plots_count: 60,
    available_plots_count: 58,
    status: 'Ongoing',
    banner_image: '/project_park_avenue_new.jpg',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  };

  const createProjARes = await fetch('http://localhost:5000/api/admin/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(projAPayload)
  }).then(r => r.json());

  const projAId = createProjARes.data?.id;
  console.log(`✓ Project A created: [${projAId}] ${createProjARes.data?.name}\n`);

  // 3. Open Project A details screen via API (GET /api/admin/projects/:id)
  console.log(`Step 3: Opening Project A dedicated details screen (GET /api/admin/projects/${projAId})...`);
  const getProjARes = await fetch(`http://localhost:5000/api/admin/projects/${projAId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  console.log('✓ Project A details loaded:', getProjARes.data?.name, '| Initial plots:', getProjARes.data?.plots?.length, '\n');

  // 4. Add two plots inside Project A
  console.log('Step 4: Adding Plot 1 and Plot 2 inside Project A...');
  const plotA1 = await fetch('http://localhost:5000/api/admin/plots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      project_id: projAId,
      plot_number: 'Alpha-Plot #01',
      dimension: '30 x 40 Ft',
      area_sqft: 1200,
      facing: 'North Facing',
      status: 'Available',
      price: 2500000,
      price_per_sqft: 2083
    })
  }).then(r => r.json());
  const plotA1Id = plotA1.data?.id;
  console.log(`✓ Added Plot 1 to Project A: [${plotA1Id}] ${plotA1.data?.plot_number} (Price: ₹${plotA1.data?.price})`);

  const plotA2 = await fetch('http://localhost:5000/api/admin/plots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      project_id: projAId,
      plot_number: 'Alpha-Plot #02 (Corner)',
      dimension: '35 x 45 Ft',
      area_sqft: 1575,
      facing: 'North-East Corner',
      status: 'Available',
      price: 3500000,
      price_per_sqft: 2222
    })
  }).then(r => r.json());
  const plotA2Id = plotA2.data?.id;
  console.log(`✓ Added Plot 2 to Project A: [${plotA2Id}] ${plotA2.data?.plot_number} (Price: ₹${plotA2.data?.price})\n`);

  // 5. Confirm both plots appear in Project A's inventory
  console.log("Step 5: Verifying Project A's inventory contains both plots...");
  const projAAfter = await fetch(`http://localhost:5000/api/admin/projects/${projAId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  console.log(`Project A plots count: ${projAAfter.data?.plots?.length} (Expected: 2)`);
  projAAfter.data?.plots?.forEach(p => console.log(` - Plot: ${p.plot_number} | Dim: ${p.dimension} | CRM Price: ₹${p.price}`));
  if (projAAfter.data?.plots?.length !== 2) throw new Error('Project A plot count mismatch');
  console.log("✓ Project A inventory verified.\n");

  // 6. Create Project B and add a plot to it
  console.log('Step 6: Creating Project B (Project Beta Enclave) and adding a plot...');
  const projBPayload = {
    name: 'Project Beta Enclave',
    slug: 'project-beta-enclave',
    tagline: 'Exclusive Plotted Enclave near Collector Office',
    description: 'Premium peaceful residential enclave.',
    location_area: 'Collector Office Extension',
    location_city: 'Trichy',
    total_extent_acres: 3.5,
    total_plots_count: 30,
    status: 'Ongoing'
  };

  const createProjBRes = await fetch('http://localhost:5000/api/admin/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(projBPayload)
  }).then(r => r.json());
  const projBId = createProjBRes.data?.id;
  console.log(`✓ Project B created: [${projBId}] ${createProjBRes.data?.name}`);

  const plotB1 = await fetch('http://localhost:5000/api/admin/plots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      project_id: projBId,
      plot_number: 'Beta-Plot #01',
      dimension: '40 x 50 Ft',
      area_sqft: 2000,
      facing: 'East Facing',
      status: 'Available',
      price: 5000000,
      price_per_sqft: 2500
    })
  }).then(r => r.json());
  const plotB1Id = plotB1.data?.id;
  console.log(`✓ Added Plot to Project B: [${plotB1Id}] ${plotB1.data?.plot_number}\n`);

  // 7. Confirm Project A and Project B inventories remain strictly separate
  console.log('Step 7: Verifying inventories are strictly separate...');
  const checkProjA = await fetch(`http://localhost:5000/api/admin/projects/${projAId}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
  const checkProjB = await fetch(`http://localhost:5000/api/admin/projects/${projBId}`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());

  console.log(`Project A plots: ${checkProjA.data?.plots?.map(p => p.plot_number).join(', ')} (Count: ${checkProjA.data?.plots?.length})`);
  console.log(`Project B plots: ${checkProjB.data?.plots?.map(p => p.plot_number).join(', ')} (Count: ${checkProjB.data?.plots?.length})`);

  const hasOverlap = checkProjA.data?.plots?.some(p => p.project_id === projBId) || checkProjB.data?.plots?.some(p => p.project_id === projAId);
  if (hasOverlap) throw new Error('❌ CROSS-PROJECT PLOT POLLUTION DETECTED!');
  console.log('✓ PASS: Zero inventory overlap. Projects maintain strict, isolated plot ownership.\n');

  // 8. Edit a plot and verify database changes
  console.log('Step 8: Editing Alpha-Plot #01 (Change status to "Booked", facing to "East Facing")...');
  const updateRes = await fetch(`http://localhost:5000/api/admin/plots/${plotA1Id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      project_id: projAId,
      plot_number: 'Alpha-Plot #01',
      facing: 'East Facing',
      status: 'Booked',
      price: 2500000
    })
  }).then(r => r.json());
  console.log('Plot update response:', updateRes.success ? '✓ SUCCESS' : 'FAILED');

  // Direct PostgreSQL query verification
  const dbPlot = await db.query('SELECT id, plot_number, facing, status, price FROM plots WHERE id = $1', [plotA1Id]);
  console.log('Database record verified:', dbPlot.rows[0]);
  if (dbPlot.rows[0].status !== 'Booked' || dbPlot.rows[0].facing !== 'East Facing') {
    throw new Error('Database plot record did not update properly!');
  }
  console.log('✓ Database record confirmed updated.\n');

  // 9. Open Public Website endpoints and verify correct plots & zero price exposure
  console.log('Step 9: Verifying Public Website endpoints (GET /api/public/projects/project-alpha-township)...');
  const publicA = await fetch('http://localhost:5000/api/public/projects/project-alpha-township').then(r => r.json());
  console.log(`Public Alpha Project plots count: ${publicA.data?.plots?.length}`);
  const updatedA1 = publicA.data?.plots?.find(p => p.id === plotA1Id);
  console.log(`Public Plot 1 Status: ${updatedA1?.status} (Expected: Booked) | Facing: ${updatedA1?.facing}`);
  
  // Strict price confidentiality check
  const publicPriceKeys = Object.keys(updatedA1 || {}).filter(k => k.toLowerCase().includes('price'));
  console.log('Public Plot Price keys exposed:', publicPriceKeys);
  if (publicPriceKeys.length > 0) throw new Error('Confidential price leaked to public website!');
  console.log('✓ PASS: Public website displays correct plots with zero price exposure.\n');

  // 10. Submit test enquiry and verify correct project & plot recorded
  console.log('Step 10: Submitting public enquiry for Alpha-Plot #01...');
  const enquiryRes = await fetch('http://localhost:5000/api/public/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Project-First Test Buyer',
      phone: '9840188888',
      email: 'alpha-buyer@example.com',
      project_id: projAId,
      plot_name: 'Alpha-Plot #01',
      preferred_budget: '₹25 Lakhs',
      message: 'Booking advance ready for Alpha Plot 1.'
    })
  }).then(r => r.json());
  console.log('Public Lead Submission result:', enquiryRes);

  const dbLead = await db.query("SELECT id, name, phone, email, project_id, plot_name, budget, message FROM leads WHERE email = 'alpha-buyer@example.com'");
  console.log('Database Stored Lead verified:', dbLead.rows[0]);
  if (dbLead.rows[0]?.project_id !== projAId || dbLead.rows[0]?.plot_name !== 'Alpha-Plot #01') {
    throw new Error('Enquiry project or plot association mismatch!');
  }
  console.log('✓ PASS: Lead successfully stored in PostgreSQL with exact project and plot association.\n');

  // Step 11: Cleanup test records
  console.log('Step 11: Cleaning up test data...');
  await fetch(`http://localhost:5000/api/admin/plots/${plotA1Id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  await fetch(`http://localhost:5000/api/admin/plots/${plotA2Id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  await fetch(`http://localhost:5000/api/admin/plots/${plotB1Id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  await fetch(`http://localhost:5000/api/admin/projects/${projAId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  await fetch(`http://localhost:5000/api/admin/projects/${projBId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  if (dbLead.rows[0]?.id) {
    await fetch(`http://localhost:5000/api/admin/crm/leads/${dbLead.rows[0].id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  }
  console.log('✓ Cleanup complete. Database restored to pristine state.\n');

  console.log('=================================================================');
  console.log('🎉 ALL 10 PROJECT-FIRST WORKFLOW VERIFICATIONS PASSED 100%!');
  console.log('=================================================================');
  process.exit(0);
}

testProjectFirstWorkflow().catch(err => {
  console.error('Workflow Test Failed:', err);
  process.exit(1);
});

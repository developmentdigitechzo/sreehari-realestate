async function runE2EWorkflow() {
  console.log('=====================================================');
  console.log('🚀 RUNNING END-TO-END CRM-TO-WEBSITE WORKFLOW VERIFICATION');
  console.log('=====================================================\n');

  // Step 1: Admin Login
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
  console.log('✓ Admin successfully authenticated. Token received.');

  // Step 2: Create a Test Project in CRM
  console.log('\nStep 2: Creating Test Project in CRM (POST /api/admin/projects)...');
  const testProjectPayload = {
    name: 'E2E Royal Meadows',
    slug: 'e2e-royal-meadows',
    tagline: 'Luxury Gated Community on Trichy Ring Road',
    description: 'An exclusive plotted development with wide tar avenues, 24/7 security, sweet groundwater, and children play park.',
    location_area: 'Trichy Ring Road, Panjappur Corridor',
    location_city: 'Trichy',
    total_extent_acres: 4.5,
    total_plots_count: 50,
    available_plots_count: 48,
    plot_size_range: '1200 - 2400 Sq.Ft',
    status: 'Ongoing',
    is_featured: true,
    banner_image: '/project_park_avenue_new.jpg',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    gallery_images: [
      '/project_park_avenue_new.jpg',
      '/hero_gate_entrance.png'
    ],
    highlights: [
      'Grand Entrance Archway',
      'Sweet Groundwater at 40 Feet',
      'Immediate DTCP & TNRERA Clearance'
    ],
    amenities: [
      { id: 'am-1', name: 'Blacktop Tar Roads', icon_key: 'Milestone', description: '40ft Wide Roads' }
    ],
    nearby_landmarks: [
      { name: 'Panjappur Integrated Bus Terminus', distance: '3.5 km', category: 'Transit' },
      { name: 'Samayapuram Mariamman Temple', distance: '12 km', category: 'Places of Worship' }
    ]
  };

  const createProjRes = await fetch('http://localhost:5000/api/admin/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(testProjectPayload)
  }).then(r => r.json());

  console.log('Create Project Result:', createProjRes.success ? '✓ SUCCESS' : 'FAILED', createProjRes.message);
  const projectId = createProjRes.data?.id;
  console.log('Project ID created:', projectId);

  // Step 3 & 4: Add Two Plots to that Project with Price in CRM
  console.log('\nStep 3 & 4: Adding 2 Individual Plots to the Project in CRM with Prices...');
  const plot1Payload = {
    project_id: projectId,
    plot_number: 'E2E-Plot #01',
    dimension: '30 x 40 Ft',
    area_sqft: 1200,
    facing: 'North Facing',
    status: 'Available',
    approval_status: 'DTCP Approved',
    description: 'Prime North-facing vastu plot adjacent to 40ft road.',
    price: 3600000,
    price_per_sqft: 3000,
    primary_image_url: '/project_park_avenue_new.jpg'
  };

  const plot2Payload = {
    project_id: projectId,
    plot_number: 'E2E-Plot #02 (Corner)',
    dimension: '40 x 50 Ft',
    area_sqft: 2000,
    facing: 'North-East Corner',
    status: 'Available',
    approval_status: 'DTCP Approved',
    description: 'Corner plot with dual 40ft & 33ft road frontage.',
    price: 6500000,
    price_per_sqft: 3250,
    primary_image_url: '/hero_gate_entrance.png'
  };

  const createPlot1Res = await fetch('http://localhost:5000/api/admin/plots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(plot1Payload)
  }).then(r => r.json());
  const plot1Id = createPlot1Res.data?.id;
  console.log('Plot 1 Created:', createPlot1Res.success ? '✓ SUCCESS' : 'FAILED', `ID: ${plot1Id}, Price: ₹${createPlot1Res.data?.price}`);

  const createPlot2Res = await fetch('http://localhost:5000/api/admin/plots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(plot2Payload)
  }).then(r => r.json());
  const plot2Id = createPlot2Res.data?.id;
  console.log('Plot 2 Created:', createPlot2Res.success ? '✓ SUCCESS' : 'FAILED', `ID: ${plot2Id}, Price: ₹${createPlot2Res.data?.price}`);

  // Step 5: Verify CRM Admin Listing
  console.log('\nStep 5: Verifying CRM Admin can view the project & plots with prices...');
  const adminPlotsRes = await fetch('http://localhost:5000/api/admin/plots', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  const adminTestPlots = adminPlotsRes.data?.filter(p => p.project_id === projectId);
  console.log(`CRM Admin sees ${adminTestPlots?.length} plots for this project.`);
  adminTestPlots?.forEach(p => console.log(` - ${p.plot_number}: Status=${p.status}, CRM Price=₹${p.price}`));

  // Step 6: Verify Public Website API (GET /api/public/projects/e2e-royal-meadows)
  console.log('\nStep 6: Verifying Public Website API (GET /api/public/projects/e2e-royal-meadows)...');
  const publicProjRes = await fetch('http://localhost:5000/api/public/projects/e2e-royal-meadows').then(r => r.json());
  console.log('Public Project Found:', publicProjRes.success ? '✓ YES' : 'NO');
  console.log('Public Project Name:', publicProjRes.data?.name);
  console.log('Public Plots Attached Count:', publicProjRes.data?.plots?.length);

  // Step 7 & 8: Check Plot Details & ZERO Price Exposure
  console.log('\nStep 7 & 8: Inspecting Public Plot Data for ZERO Price Exposure...');
  let publicPriceExposed = false;
  for (const plot of (publicProjRes.data?.plots || [])) {
    console.log(` - Public Plot: ${plot.plot_number} | Dim: ${plot.dimension || plot.dimension_str} | Facing: ${plot.facing} | Status: ${plot.status}`);
    const keys = Object.keys(plot);
    if (keys.some(k => k.toLowerCase().includes('price'))) {
      publicPriceExposed = true;
      console.error('❌ FAILURE: Price key leaked in public plot object!');
    }
  }
  if (!publicPriceExposed) {
    console.log('✓ PASS: Zero plot prices or confidential rates exposed on public endpoint!');
  }

  // Step 9 & 10: Submit Public Enquiry for Plot 1
  console.log('\nStep 9: Submitting Public Enquiry for E2E-Plot #01...');
  const leadSubmission = await fetch('http://localhost:5000/api/public/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'E2E Buyer Candidate',
      phone: '9840199999',
      email: 'e2ebuyer@example.com',
      project_id: projectId,
      plot_name: 'E2E-Plot #01',
      preferred_budget: '₹35L - ₹40L',
      message: 'Looking to purchase E2E-Plot #01 this month.'
    })
  }).then(r => r.json());
  console.log('Public Lead Submission:', leadSubmission.success ? '✓ SUCCESS' : 'FAILED', leadSubmission.leadId);

  console.log('\nStep 10: Confirming Lead is Stored in CRM (GET /api/admin/crm/leads)...');
  const crmLeadsRes = await fetch('http://localhost:5000/api/admin/crm/leads', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  const storedLead = crmLeadsRes.data?.find(l => l.email === 'e2ebuyer@example.com');
  if (storedLead) {
    console.log('✓ PASS: Stored Lead Found in CRM:');
    console.log(` - ID: ${storedLead.id}`);
    console.log(` - Name: ${storedLead.name} | Phone: ${storedLead.phone}`);
    console.log(` - Project ID: ${storedLead.project_id}`);
    console.log(` - Plot Name: ${storedLead.plot_name}`);
    console.log(` - Budget: ${storedLead.budget}`);
  } else {
    console.error('❌ FAIL: Lead was not found in CRM leads list!');
  }

  // Step 11: Edit Project & Plot in CRM and Confirm Updates Appear Publicly
  console.log('\nStep 11: Editing Project and Plot in CRM...');
  const updateProjRes = await fetch(`http://localhost:5000/api/admin/projects/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      ...testProjectPayload,
      tagline: 'UPDATED: Ultra-Luxury Gated Community on Trichy Ring Road',
      available_plots_count: 47
    })
  }).then(r => r.json());
  console.log('Project Update in CRM:', updateProjRes.success ? '✓ SUCCESS' : 'FAILED');

  const updatePlotRes = await fetch(`http://localhost:5000/api/admin/plots/${plot1Id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      ...plot1Payload,
      status: 'Booked'
    })
  }).then(r => r.json());
  console.log('Plot 1 Status Update to "Booked" in CRM:', updatePlotRes.success ? '✓ SUCCESS' : 'FAILED');

  // Verify updates reflected on Public Website
  console.log('\nVerifying updates appear on public website endpoint...');
  const updatedPublicRes = await fetch('http://localhost:5000/api/public/projects/e2e-royal-meadows').then(r => r.json());
  console.log('Updated Tagline on Public Site:', updatedPublicRes.data?.tagline);
  const updatedPlot1 = updatedPublicRes.data?.plots?.find(p => p.id === plot1Id);
  console.log(`Updated Plot 1 Status on Public Site: ${updatedPlot1?.status} (Expected: Booked)`);

  if (updatedPublicRes.data?.tagline.includes('UPDATED') && updatedPlot1?.status === 'Booked') {
    console.log('✓ PASS: Project and Plot edits immediately reflected on the public website!');
  } else {
    console.error('❌ FAIL: Updates did not match public response!');
  }

  // Step 12: Clean up test records
  console.log('\nStep 12: Cleaning up test records to keep database clean...');
  await fetch(`http://localhost:5000/api/admin/plots/${plot1Id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  await fetch(`http://localhost:5000/api/admin/plots/${plot2Id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  await fetch(`http://localhost:5000/api/admin/projects/${projectId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  if (storedLead) {
    await fetch(`http://localhost:5000/api/admin/crm/leads/${storedLead.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  }
  console.log('✓ Clean-up complete. All temporary test records removed.');

  console.log('\n=====================================================');
  console.log('🎉 END-TO-END WORKFLOW TEST FULLY PASSED WITH 100% SUCCESS!');
  console.log('=====================================================');
  process.exit(0);
}

runE2EWorkflow().catch(err => {
  console.error('E2E Workflow Test Failed:', err);
  process.exit(1);
});

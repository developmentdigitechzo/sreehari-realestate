async function testPublicAPIs() {
  console.log('=== 1. Testing GET /api/public/projects ===');
  const projRes = await fetch('http://localhost:5000/api/public/projects').then(r => r.json());
  console.log('Success:', projRes.success);
  console.log('Projects count:', projRes.data?.length);
  projRes.data?.forEach(p => {
    console.log(` - Project: ${p.name} | Slug: ${p.slug} | Status: ${p.status} | Location: ${p.location_area}`);
    const keys = Object.keys(p);
    const hasPriceField = keys.some(k => k.toLowerCase().includes('price'));
    console.log(`   Fields: [${keys.slice(0, 8).join(', ')}...], Price field exposed: ${hasPriceField}`);
  });

  console.log('\n=== 2. Testing GET /api/public/projects/park-avenue ===');
  const parkRes = await fetch('http://localhost:5000/api/public/projects/park-avenue').then(r => r.json());
  console.log('Success:', parkRes.success);
  const park = parkRes.data;
  console.log('Name:', park?.name);
  console.log('Slug:', park?.slug);
  console.log('Extent:', park?.total_extent_acres, 'Acres');
  console.log('Total Plots Count:', park?.total_plots_count);
  console.log('Available Plots Count:', park?.available_plots_count);
  console.log('DTCP Approval:', park?.dtcp_number);
  console.log('RERA Approval:', park?.rera_number);
  console.log('Gallery Images:', park?.gallery_images?.length);
  console.log('Nearby Landmarks:', park?.nearby_landmarks?.length);
  console.log('Plots attached to Park Avenue:', park?.plots?.length);

  console.log('\n=== 3. Testing GET /api/public/projects/park-avenue/plots ===');
  const plotsRes = await fetch('http://localhost:5000/api/public/projects/park-avenue/plots').then(r => r.json());
  console.log('Success:', plotsRes.success);
  console.log('Plots count:', plotsRes.data?.length);

  console.log('\n=== 4. Deep Inspection of Plot Fields & Price Confidentiality ===');
  if (plotsRes.data && plotsRes.data.length > 0) {
    const samplePlot = plotsRes.data[0];
    console.log('Sample Plot Object keys:', Object.keys(samplePlot));
    console.log('Sample Plot Details:');
    console.log(' - Plot Number:', samplePlot.plot_number);
    console.log(' - Dimension:', samplePlot.dimension || samplePlot.dimension_str);
    console.log(' - Area SqFt:', samplePlot.area_sqft);
    console.log(' - Facing:', samplePlot.facing);
    console.log(' - Status:', samplePlot.status);
    console.log(' - Image URL:', samplePlot.primary_image_url);
    console.log(' - Video URL:', samplePlot.video_url);

    // Deep check every single plot returned
    let priceLeakedCount = 0;
    let internalFieldLeakedCount = 0;
    const internalForbiddenKeys = ['price', 'price_per_sqft', 'total_price_lakhs', 'admin_notes', 'internal_notes', 'assigned_to', 'cost'];

    plotsRes.data.forEach((plot, i) => {
      for (const key of Object.keys(plot)) {
        if (internalForbiddenKeys.includes(key.toLowerCase())) {
          console.error(`ALERT: Forbidden key '${key}' leaked on plot ${i} (${plot.plot_number})`);
          priceLeakedCount++;
        }
      }
    });

    console.log('Total Plots Inspected:', plotsRes.data.length);
    console.log('Total Plots with Price or Internal CRM leakage:', priceLeakedCount);
  }

  console.log('\n=== 5. Testing Error Handling on Non-Existent Project ===');
  const errorRes = await fetch('http://localhost:5000/api/public/projects/non-existent-slug-xyz').then(r => r.json());
  console.log('Non-existent project response:', errorRes);

  process.exit(0);
}

testPublicAPIs().catch(err => {
  console.error('API test failed:', err);
  process.exit(1);
});

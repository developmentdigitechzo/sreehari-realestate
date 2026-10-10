import { db, initDatabase } from '../config/db';

async function checkDatabase() {
  console.log('\n==================================================');
  console.log('🔍 POSTGRESQL DATABASE INSPECTION & SUMMARY');
  console.log('==================================================\n');

  await initDatabase();

  if (!db.isPostgres()) {
    console.log('! Operating in local JSON fallback mode');
    return;
  }

  try {
    // 1. Leads Table
    const leadsRes = await db.query('SELECT name, phone, status, source, created_at FROM leads ORDER BY created_at DESC;');
    console.log(`📋 LEADS TABLE (${leadsRes.rows.length} Total Leads in PostgreSQL):`);
    console.table(leadsRes.rows.map((l: any) => ({
      Name: l.name,
      Phone: l.phone,
      Status: l.status || 'New',
      Source: l.source || 'Website Form',
      Created: new Date(l.created_at).toLocaleString('en-IN')
    })));

    // 2. Projects Table
    const projRes = await db.query('SELECT name, status, location_area, total_plots_count FROM projects;');
    console.log(`\n🏘️ PROJECTS TABLE (${projRes.rows.length} Projects in PostgreSQL):`);
    console.table(projRes.rows.map((p: any) => ({
      Name: p.name,
      Status: p.status,
      Location: p.location_area,
      TotalPlots: p.total_plots_count
    })));

    // 3. Plots Table
    const plotsRes = await db.query('SELECT plot_number, facing, area_sqft, price, status FROM plots;');
    console.log(`\n📐 PLOTS INVENTORY TABLE (${plotsRes.rows.length} Plots in PostgreSQL):`);
    console.table(plotsRes.rows.map((p: any) => ({
      PlotNo: p.plot_number,
      Facing: p.facing,
      AreaSqFt: p.area_sqft,
      Price: p.price,
      Status: p.status
    })));

    console.log('\n==================================================');
    console.log('✓ PostgreSQL Database is 100% Active and Working Great!');
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('Error inspecting database:', err.message);
  } finally {
    process.exit(0);
  }
}

checkDatabase();

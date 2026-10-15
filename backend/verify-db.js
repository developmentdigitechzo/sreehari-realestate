const { db, initDatabase } = require('./dist/config/db');

async function verify() {
  await initDatabase();
  console.log('--- 1. Verification of PostgreSQL Connection & Records ---');
  const projs = await db.query('SELECT id, name, slug, total_plots_count, available_plots_count FROM projects');
  console.log('Projects Count in DB:', projs.rows.length);
  projs.rows.forEach(p => console.log(` - [${p.id}] ${p.name} (${p.slug}): ${p.available_plots_count}/${p.total_plots_count} plots`));

  const plots = await db.query('SELECT id, project_id, plot_number, dimension_str, area_sqft, status, price FROM plots');
  console.log('\nPlots Count in DB:', plots.rows.length);

  console.log('\n--- 2. Foreign Key & Relationship Check ---');
  const linked = await db.query(`
    SELECT pl.id as plot_id, pl.plot_number, pr.name as project_name, pl.project_id
    FROM plots pl
    JOIN projects pr ON pl.project_id = pr.id
  `);
  console.log(`Plots with valid project link: ${linked.rows.length} / ${plots.rows.length}`);

  const orphaned = await db.query(`
    SELECT pl.id, pl.plot_number, pl.project_id
    FROM plots pl
    LEFT JOIN projects pr ON pl.project_id = pr.id
    WHERE pr.id IS NULL
  `);
  console.log('Orphaned plots count (must be 0):', orphaned.rows.length);

  console.log('\n--- 3. Seed Idempotency Check ---');
  const { runSeed } = require('./dist/models/seed');
  console.log('Running seed again...');
  await runSeed();

  const projsAfter = await db.query('SELECT COUNT(*) as count FROM projects');
  const plotsAfter = await db.query('SELECT COUNT(*) as count FROM plots');
  console.log('Projects Count after re-seed:', projsAfter.rows[0].count, '(Expected: ' + projs.rows.length + ')');
  console.log('Plots Count after re-seed:', plotsAfter.rows[0].count, '(Expected: ' + plots.rows.length + ')');

  if (projsAfter.rows[0].count == projs.rows.length && plotsAfter.rows[0].count == plots.rows.length) {
    console.log('>>> IDEMPOTENCY CONFIRMED: No duplicate projects or plots created upon re-seeding!');
  } else {
    console.log('>>> WARNING: Counts changed upon re-seeding!');
  }

  console.log('\n--- 4. Verify Stored Lead (Integration test lead) ---');
  const lead = await db.query("SELECT id, name, phone, email, project_interest, preferred_budget, message, created_at FROM leads WHERE email = 'test@sreeharirealty.com' ORDER BY created_at DESC LIMIT 1");
  if (lead.rows.length > 0) {
    console.log('Lead found in DB:', lead.rows[0]);
  } else {
    console.log('No lead found with email test@sreeharirealty.com');
  }

  process.exit(0);
}

verify().catch(e => {
  console.error('Verification failed:', e);
  process.exit(1);
});

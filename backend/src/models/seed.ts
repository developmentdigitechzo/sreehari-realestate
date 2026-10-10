import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, initDatabase } from '../config/db';

export async function runSeed() {
  console.log('Seeding Sree Hari Realty Promoters initial data...');
  await initDatabase();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('AdminPassword@2026', salt);

  const adminUser = {
    id: uuidv4(),
    username: 'admin',
    email: 'admin@sreeharirealty.com',
    password_hash: passwordHash,
    role: 'admin',
    created_at: new Date().toISOString()
  };

  const amenities = [
    {
      id: 'amenity-roads',
      name: 'Wide Blacktop Tar Roads',
      icon_key: 'Road',
      description: '30ft and 40ft broad tar roads designed for easy vehicular access and heavy vehicle movement.'
    },
    {
      id: 'amenity-entrance',
      name: 'Grand Entrance Arch & Gate',
      icon_key: 'ShieldCheck',
      description: 'Architectural entrance arch with security cabin and access control.'
    },
    {
      id: 'amenity-streetlights',
      name: 'LED & Solar Street Lighting',
      icon_key: 'SunMedium',
      description: 'Well-spaced illumination across all streets ensuring security at night.'
    },
    {
      id: 'amenity-water',
      name: 'Potable Ground Water Supply',
      icon_key: 'Droplets',
      description: 'Sweet, plentiful potable groundwater with pipeline provisions to every plot.'
    },
    {
      id: 'amenity-park',
      name: 'Lush Parks & Children Play Area',
      icon_key: 'Trees',
      description: 'Dedicated recreational open space reservation with green plantations and walking track.'
    }
  ];

  const projects = [
    {
      id: 'proj-park-avenue',
      name: 'Park Avenue',
      slug: 'park-avenue',
      tagline: 'Premium Gated Community Plotted Living in Prime Growth Corridor',
      description: 'Launched in 2026, Park Avenue represents the next step in Sree Hari Realty Promoters journey. Thoughtfully planned in a high-growth corridor with top-tier connectivity to major roadways, educational hubs, and industrial sectors.',
      location_area: 'Thiruverumbur - Kattur Extension',
      location_city: 'Trichy',
      total_extent_acres: 8.5,
      total_plots_count: 94,
      plot_size_range: '1200 - 2400 Sq.Ft',
      price_range: '₹ 1,450 - ₹ 1,850 / Sq.Ft',
      status: 'Ongoing',
      is_featured: true,
      banner_image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'proj-sri-amman-nagar',
      name: 'Sri Amman Nagar',
      slug: 'sri-amman-nagar',
      tagline: 'Gated Residential Township - Sold Out in Record 60 Days',
      description: 'Located in prime Thiruverumbur corridor near BHEL and Manford School.',
      location_area: 'Thiruverumbur',
      location_city: 'Trichy',
      total_extent_acres: 12.0,
      total_plots_count: 140,
      plot_size_range: '1200 - 2400 Sq.Ft',
      price_range: '₹ 1,200 - ₹ 1,500 / Sq.Ft',
      status: 'Sold Out',
      is_featured: true,
      banner_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      created_at: new Date('2025-01-01').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'proj-aishwarya-nagar',
      name: 'Aishwarya Nagar',
      slug: 'aishwarya-nagar',
      tagline: 'Landmark Plotted Layout Near BHEL & Thirumayam Highway',
      description: 'Dedicated residential plot venture establishing our landmark development standards.',
      location_area: 'Thirumayam Road',
      location_city: 'Trichy Corridor',
      total_extent_acres: 15.0,
      total_plots_count: 180,
      plot_size_range: '1200 - 3000 Sq.Ft',
      price_range: '₹ 950 - ₹ 1,250 / Sq.Ft',
      status: 'Completed',
      is_featured: false,
      banner_image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
      created_at: new Date('2022-06-01').toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const plots = [
    {
      id: 'plot-101',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #01',
      dimension_str: '30 x 40 Ft',
      area_sqft: 1200,
      facing: 'North',
      price: 1740000,
      status: 'Available',
      created_at: new Date().toISOString()
    },
    {
      id: 'plot-102',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #02 (Corner)',
      dimension_str: '30 x 60 Ft',
      area_sqft: 1800,
      facing: 'North-East',
      price: 2700000,
      status: 'Available',
      created_at: new Date().toISOString()
    },
    {
      id: 'plot-103',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #03',
      dimension_str: '30 x 50 Ft',
      area_sqft: 1500,
      facing: 'East',
      price: 2250000,
      status: 'Booked',
      created_at: new Date().toISOString()
    },
    {
      id: 'plot-104',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #04',
      dimension_str: '40 x 60 Ft',
      area_sqft: 2400,
      facing: 'South',
      price: 3480000,
      status: 'Available',
      created_at: new Date().toISOString()
    },
    {
      id: 'plot-105',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #05',
      dimension_str: '30 x 40 Ft',
      area_sqft: 1200,
      facing: 'East',
      price: 1800000,
      status: 'Sold',
      created_at: new Date().toISOString()
    }
  ];

  const gallery = [
    {
      id: 'gal-1',
      title: 'Broad 40ft Main Blacktop Road',
      image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      category: 'Roads',
      sort_order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'gal-2',
      title: 'Architectural Gated Entrance & Security Cabins',
      image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      category: 'Entrance Gate',
      sort_order: 2,
      created_at: new Date().toISOString()
    }
  ];

  const leads = [
    {
      id: 'lead-01',
      project_id: 'proj-park-avenue',
      name: 'R. Vignesh Kumar',
      phone: '+91 98401 23456',
      email: 'vignesh.k@gmail.com',
      preferred_plot_size: '1200 - 1500 Sq.Ft',
      message: 'Looking for an East-facing plot in Park Avenue for immediate house construction.',
      source: 'Website Form',
      status: 'New',
      admin_notes: 'Enquired today.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const blogs = [
    {
      id: 'blog-dtcp-guide-2026',
      title: 'Complete Guide to Buying DTCP Approved Plots in Prime City Corridor',
      slug: 'dtcp-approved-plots-prime-city-guide-2026',
      category: 'Buying Guide',
      author: 'Sree Hari Realty Editorial',
      read_time: '5 min read',
      image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      excerpt: 'Learn why DTCP and RERA approval is essential before buying land in Tamil Nadu, and step-by-step guidance on document verification.',
      content: 'Buying a land plot is one of the safest real estate investments in Tamil Nadu. However, ensuring the property has proper DTCP (Directorate of Town and Country Planning) layout approval is crucial for legal safety, loan approvals, and resale value...',
      seo_title: 'DTCP Approved Plots Guide 2026',
      seo_description: 'Discover how to verify DTCP approval, encumbrance certificate, and legal clearance for real estate land investment.',
      status: 'Published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'blog-real-estate-trends-2026',
      title: 'Top Real Estate Investment Trends in Trichy High-Growth Zones for 2026',
      slug: 'trichy-real-estate-investment-trends-2026',
      category: 'Market Trends',
      author: 'Sree Hari Realty Advisory',
      read_time: '4 min read',
      image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      excerpt: 'An in-depth analysis of property appreciation rates, upcoming infrastructure corridors, and residential land potential around Thiruverumbur & Kattur.',
      content: 'Trichy is rapidly expanding along major national highways and industrial corridors. Areas around Thiruverumbur, BHEL township, and airport expansion routes are seeing high land appreciation...',
      seo_title: 'Trichy Real Estate Investment Trends 2026 | Land Plots',
      seo_description: 'Explore high-growth plot investment opportunities in Trichy, Thiruverumbur, and surrounding corridors in 2026.',
      status: 'Published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const settings = {
    company_name: 'Sree Hari Realty Promoters',
    phone_primary: '+91 98424 01991',
    phone_whatsapp: '+91 98424 01991',
    email_primary: 'contact@sreeharirealty.com',
    office_address: 'No. 12, Main Road, Thiruverumbur, Trichy - 620013',
    working_hours: 'Mon - Sat: 9:00 AM - 7:00 PM'
  };

  // 1. Save to JSON fallback
  const store = db.getFallbackData();
  store.users = [adminUser];
  store.amenities = amenities;
  store.projects = projects;
  store.plots = plots;
  store.gallery = gallery;
  store.leads = leads;
  store.blogs = blogs;
  store.settings = settings;
  db.saveFallbackData(store);

  // 2. Save directly to PostgreSQL Database if connected
  if (db.isPostgres()) {
    try {
      // Seed users
      await db.query(
        `INSERT INTO users (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING;`,
        [adminUser.id, adminUser.username, adminUser.email, adminUser.password_hash, adminUser.role]
      );

      // Seed projects
      for (const p of projects) {
        await db.query(
          `INSERT INTO projects (id, name, slug, tagline, description, location_area, location_city, total_extent_acres, total_plots_count, plot_size_range, price_range, status, is_featured, banner_image)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (slug) DO NOTHING;`,
          [p.id, p.name, p.slug, p.tagline, p.description, p.location_area, p.location_city, p.total_extent_acres, p.total_plots_count, p.plot_size_range, p.price_range, p.status, p.is_featured, p.banner_image]
        );
      }

      // Seed plots
      for (const p of plots) {
        await db.query(
          `INSERT INTO plots (id, project_id, plot_number, dimension_str, area_sqft, facing, price, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING;`,
          [p.id, p.project_id, p.plot_number, p.dimension_str, p.area_sqft, p.facing, p.price, p.status]
        );
      }

      // Seed gallery
      for (const g of gallery) {
        await db.query(
          `INSERT INTO gallery (id, title, image_url, category, sort_order)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING;`,
          [g.id, g.title, g.image_url, g.category, g.sort_order]
        );
      }

      // Seed leads
      for (const l of leads) {
        await db.query(
          `INSERT INTO leads (id, project_id, name, phone, email, preferred_plot_size, message, source, status, admin_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING;`,
          [l.id, l.project_id, l.name, l.phone, l.email, l.preferred_plot_size, l.message, l.source, l.status, l.admin_notes]
        );
      }

      // Seed blogs
      for (const b of blogs) {
        await db.query(
          `INSERT INTO blogs (id, title, slug, category, author, read_time, banner_image, image_url, excerpt, content, meta_title, seo_title, meta_description, seo_description, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (slug) DO NOTHING;`,
          [b.id, b.title, b.slug, b.category, b.author, b.read_time, b.image_url, b.image_url, b.excerpt, b.content, b.seo_title, b.seo_title, b.seo_description, b.seo_description, b.status]
        );
      }

      console.log('✓ Successfully seeded PostgreSQL Database tables with initial data!');
    } catch (pgErr: any) {
      console.error('PostgreSQL seed warning:', pgErr.message);
    }
  }

  console.log('✓ Seeding complete: Projects, Plots, Gallery, Settings, and Admin User ready!');
  console.log('  Admin Login: admin@sreeharirealty.com / AdminPassword@2026');
}

// Execute if run directly
if (require.main === module) {
  runSeed().then(() => process.exit(0)).catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

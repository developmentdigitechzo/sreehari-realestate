import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, initDatabase } from '../config/db';

export async function runSeed() {
  console.log('Seeding & Synchronizing Sree Hari Realty Promoters initial data...');
  await initDatabase();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('AdminPassword@2026', salt);

  const adminUser = {
    id: uuidv4(),
    username: 'admin',
    email: 'admin@sreeharirealty.com',
    password_hash: passwordHash,
    role: 'super_admin',
    status: 'Active',
    phone: '+91 98424 01991',
    permissions: ['ALL'],
    created_at: new Date().toISOString()
  };

  const amenities = [
    {
      id: 'amenity-roads',
      name: 'Wide Blacktop Tar Roads',
      icon_key: 'Milestone',
      description: '30ft, 33ft, and 40ft broad asphalt tar roads designed for easy vehicular access and heavy vehicle movement.'
    },
    {
      id: 'amenity-entrance',
      name: 'Grand Entrance Arch & Security',
      icon_key: 'ShieldCheck',
      description: 'Monumental architectural entrance arch with security cabin, CCTV provisions, and access control.'
    },
    {
      id: 'amenity-streetlights',
      name: 'EB & Bright Street Lighting',
      icon_key: 'Sun',
      description: 'High-voltage electric lines and bright LED streetlighting well-spaced across all layout avenues.'
    },
    {
      id: 'amenity-water',
      name: 'Sweet Ground Water Supply',
      icon_key: 'Droplets',
      description: 'Natural sweet potable water source with individual pipe provisions to plot boundaries.'
    },
    {
      id: 'amenity-park',
      name: 'Landscaped Children Park',
      icon_key: 'Trees',
      description: 'Dedicated recreational open space reserve with children play equipment and green avenue plantations.'
    },
    {
      id: 'amenity-registration',
      name: 'Instant Spot Registration',
      icon_key: 'Award',
      description: '100% clear parent title deeds with DTCP & TNRERA compliance and fast spot registration.'
    }
  ];

  const projects = [
    {
      id: 'proj-park-avenue',
      name: 'Park Avenue',
      slug: 'park-avenue',
      tagline: 'Premier Gated Plotted Community with Grand Entrance on Trichy-Pudukkottai Highway Corridor.',
      description: 'Park Avenue is Sree Hari Realty Promoters\' prestigious ongoing flagship plotted community spanning 5.37 acres with 101 DTCP & TNRERA approved residential plots. Situated directly on the booming Trichy-Pudukkottai Highway Corridor close to Trichy International Airport, major universities, and premier hospitals. The community is enveloped by vibrant places of worship including the historic Gundur Mathurakaliamman Temple, Gundur Jumma Masjid, and Infant Jesus Church. Built to the highest civil infrastructure standards with a grand monumental entrance arch, wide blacktop tar avenues, 24/7 security, sweet potable groundwater, and immediate bank loan clearance with all leading banks.',
      location_area: 'Trichy-Pudukkottai Highway Corridor (Near Airport & Universities)',
      location_city: 'Trichy',
      total_extent_acres: 5.37,
      total_plots_count: 101,
      available_plots_count: 38,
      plot_size_range: '750 - 2,687 Sq.Ft',
      price_range: 'Plots from ₹22.65 Lakhs to ₹81 Lakhs',
      status: 'Ongoing',
      is_featured: true,
      banner_image: '/project_park_avenue_new.jpg',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      brochure_url: '/brochure_aishwarya_nagar.jpg',
      google_maps_embed_url: 'https://maps.google.com/?q=Park+Avenue+Trichy+Pudukkottai+Highway+Corridor',
      dtcp_number: '100% DTCP Approved',
      rera_number: 'TNRERA Approved Layout',
      gallery_images: [
        '/project_park_avenue_new.jpg',
        '/hero_gate_entrance.png',
        '/masterplan_community_hd.jpg'
      ],
      highlights: [
        '5.37 Acres Gated Community with 101 DTCP & TNRERA Approved Plots',
        'Plot Sizes Ranging from 750 Sq.Ft up to 2,687 Sq.Ft',
        'Transparent Payment Milestones & 100% Clear Title Guarantee',
        'Booking Advance with Flexible Payment Schedule',
        'Pre-Approved Bank Loans from HDFC, PNB, SIB, SBI & All Leading Banks',
        'Grand Monumental Entrance Arch & Secured Boundary Fencing',
        'Strategic Location just 5.5 km from Trichy International Airport',
        'Spiritual Harmony: Minutes from Gundur Mathurakaliamman Temple, Gundur Jumma Masjid, and Infant Jesus Church'
      ],
      amenities: [
        { icon: 'ShieldCheck', title: 'Grand Entrance & Security', desc: 'Monumental arch entrance with manned security, CCTV provision, and gated boundary.' },
        { icon: 'Milestone', title: 'Wide Blacktop Tar Roads', desc: 'Engineered heavy-duty asphalt roads designed for seamless two-way vehicular flow.' },
        { icon: 'Droplets', title: 'Sweet Groundwater', desc: 'Natural sweet potable water source with individual pipe provisions to plot boundaries.' },
        { icon: 'Trees', title: 'Landscaped Children\'s Park', desc: 'Dedicated open space reserve with children play equipment and green avenue plantations.' },
        { icon: 'Sun', title: 'Electricity & Streetlights', desc: 'High-voltage electric lines and bright LED streetlighting across all layout avenues.' },
        { icon: 'Award', title: 'Instant Spot Registration', desc: '100% clear parent title deeds with DTCP & TNRERA compliance and fast spot registration.' }
      ],
      nearby_landmarks: [
        { landmark: 'Gundur Mathurakaliamman Temple', category: 'Worship', distance: '1.8 km', time: '4 mins', map_url: 'https://maps.google.com/?q=Mathurakaliamman+Temple+Gundur+Trichy' },
        { landmark: 'Gundur Jumma Masjid', category: 'Worship', distance: '1.5 km', time: '3 mins', map_url: 'https://maps.google.com/?q=Gundur+Jumma+Masjid+Trichy' },
        { landmark: 'M.I.E.T. Campus Masjid', category: 'Worship', distance: '2.0 km', time: '4 mins', map_url: 'https://maps.google.com/?q=MIET+Masjid+Trichy' },
        { landmark: 'Infant Jesus Church (Airport Road)', category: 'Worship', distance: '4.5 km', time: '7 mins', map_url: 'https://maps.google.com/?q=Infant+Jesus+Church+Airport+Road+Trichy' },
        { landmark: 'St. Joseph\'s Church (Ponmalai Corridor)', category: 'Worship', distance: '7.5 km', time: '12 mins', map_url: 'https://maps.google.com/?q=St+Joseph+Church+Ponmalai+Trichy' },
        { landmark: 'M.I.E.T. Engineering College', category: 'Education', distance: '2.0 km', time: '4 mins', map_url: 'https://maps.google.com/?q=MIET+Engineering+College+Trichy' },
        { landmark: 'Bharathidasan University', category: 'Education', distance: '2.0 km', time: '4 mins', map_url: 'https://maps.google.com/?q=Bharathidasan+University+Trichy' },
        { landmark: 'SRM Medical College & Hospital', category: 'Healthcare', distance: '4.0 km', time: '8 mins', map_url: 'https://maps.google.com/?q=SRM+Medical+College+Trichy' },
        { landmark: 'Trichy International Airport', category: 'Transit', distance: '5.5 km', time: '10 mins', map_url: 'https://maps.google.com/?q=Trichy+International+Airport' },
        { landmark: 'Anna University (Trichy Campus)', category: 'Education', distance: '6.0 km', time: '10 mins', map_url: 'https://maps.google.com/?q=Anna+University+Trichy' },
        { landmark: 'IIM Trichy', category: 'Education', distance: '7.0 km', time: '12 mins', map_url: 'https://maps.google.com/?q=IIM+Trichy' },
        { landmark: 'Panjappur Integrated Bus Stand', category: 'Transit', distance: '12.0 km', time: '18 mins', map_url: 'https://maps.google.com/?q=Panjappur+Bus+Stand+Trichy' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'proj-sri-amman-nagar',
      name: 'Sri Amman Nagar',
      slug: 'sri-amman-nagar',
      tagline: 'High-Growth Landmark Township in Thiruverumbur — 100% Sold Out in 60 Days.',
      description: 'Sri Amman Nagar is Sree Hari Realty\'s landmark township strategically positioned on the Trichy-Thanjavur National Highway in Thiruverumbur, within Trichy City Corporation limits. Endorsed with DTCP Approval No. 56/2024, TNRERA No. TN/16/Layout/0474/2025, and ISO 9001:2008 Certification, this project achieved an extraordinary record of 100% sold out within just 60 days of launch. Features 33ft and 24ft wide tar roads, Cauvery sweet drinking water line, complete EB streetlights, protective compound wall with entrance gate, and a rare 5-Year Maintenance & Security Guarantee.',
      location_area: 'Trichy - Thanjavur National Highway, Thiruverumbur',
      location_city: 'Trichy',
      total_extent_acres: 12.0,
      total_plots_count: 85,
      available_plots_count: 0,
      plot_size_range: '1000 - 2400 Sq.Ft',
      price_range: 'Plots from ₹24 Lakhs to ₹48 Lakhs (Sold Out)',
      status: 'Sold Out',
      is_featured: true,
      banner_image: '/project_sri_amman_nagar_new.jpg',
      video_url: '',
      brochure_url: '/brochure_sri_amman_nagar.jpg',
      google_maps_embed_url: 'https://maps.google.com/?q=Sri+Amman+Nagar+Thiruverumbur+Trichy',
      dtcp_number: 'DTCP Approved No. 56/2024',
      rera_number: 'TN/16/Layout/0474/2025',
      gallery_images: [
        '/project_sri_amman_nagar_new.jpg',
        '/sri_amman_clean_building.jpg'
      ],
      highlights: [
        '100% Sold Out in 60 Days — Highly Successful Township (2025)',
        'DTCP Approved Layout No. 56/2024 & TNRERA No. TN/16/Layout/0474/2025',
        'Exclusive 5-Year Maintenance & Security Guarantee',
        'Direct Access from Trichy - Thanjavur National Highway',
        '33 Ft & 24 Ft High Quality Asphalt Tar Roads',
        'Cauvery Sweet Potable Drinking Water Supply',
        'Centrally Located near BHEL, OFT, HAPP, Monfort & Sowdambika Schools'
      ],
      amenities: [
        { icon: 'ShieldCheck', title: '5-Year Maintenance & Security', desc: 'Unmatched 5-year maintenance and round-the-clock safety guarantee provided for all residents.' },
        { icon: 'Milestone', title: '33 Ft & 24 Ft Wide Tar Roads', desc: 'Paved high-grade tar roads with proper road camber and stormwater channel drains.' },
        { icon: 'Droplets', title: 'Cauvery Sweet Drinking Water', desc: 'Direct piped Cauvery potable drinking water connection provided throughout the layout.' },
        { icon: 'Fence', title: 'Compound Wall & Entrance Gate', desc: 'Secured peripheral compound wall with a welcoming gate for complete township protection.' },
        { icon: 'Sun', title: 'EB Power & Bright Streetlights', desc: 'Underground electricity connections and LED street lighting illuminating all avenues.' },
        { icon: 'Award', title: 'ISO 9001:2008 & Corporation Limits', desc: 'Inside Trichy City Corporation with ISO 9001:2008 quality certified layout execution.' }
      ],
      nearby_landmarks: [
        { landmark: 'Thiruverumbur Bus Stand', category: 'Transit', distance: '0.5 km', time: '2 mins', map_url: 'https://maps.google.com/?q=Thiruverumbur+Bus+Stand' },
        { landmark: 'Vegetable Market & Sree Hari Sweets', category: 'Shopping', distance: '0.5 km', time: '2 mins', map_url: 'https://maps.google.com/?q=Thiruverumbur+Market' },
        { landmark: 'Thiruverumbur Railway Station', category: 'Transit', distance: '1.0 km', time: '3 mins', map_url: 'https://maps.google.com/?q=Thiruverumbur+Railway+Station' },
        { landmark: 'Montfort School', category: 'Education', distance: '2.0 km', time: '5 mins', map_url: 'https://maps.google.com/?q=Montfort+School+Kattur+Trichy' },
        { landmark: 'Arulmigu Erumbeeswarar Temple', category: 'Worship', distance: '2.0 km', time: '5 mins', map_url: 'https://maps.google.com/?q=Erumbeeswarar+Temple+Thiruverumbur' },
        { landmark: 'BHEL Trichy Complex', category: 'Workplace', distance: '3.0 km', time: '6 mins', map_url: 'https://maps.google.com/?q=BHEL+Trichy' },
        { landmark: 'Trichy International Airport', category: 'Transit', distance: '10.0 km', time: '18 mins', map_url: 'https://maps.google.com/?q=Trichy+Airport' }
      ],
      created_at: new Date('2025-01-01').toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'proj-aishwarya-nagar',
      name: 'Aishwarya Nagar',
      slug: 'aishwarya-nagar',
      tagline: 'Maiden Township near BHEL Thirumayam — 100% Completed & Delivered.',
      description: 'Aishwarya Nagar is Sree Hari Realty\'s maiden milestone plotted residential development launched in 2022. Located at Kadiyapatti & Kammangudippatti, directly adjoining the BHEL Thirumayam industrial hub (just 1.5 km behind Ilanjavur) in Pudukkottai district. Carefully conceived to give middle-income families, industrial employees, and discerning investors secure, legally unassailable land with abundant sweet drinking water, complete boundary security walls, and rapid industrial belt capital appreciation. Fully completed and handed over.',
      location_area: 'Near BHEL Thirumayam (Behind Ilanjavur 1.5 km), Kadiyapatti, Thirumayam',
      location_city: 'Thirumayam',
      total_extent_acres: 15.0,
      total_plots_count: 60,
      available_plots_count: 0,
      plot_size_range: '1000 - 2400 Sq.Ft',
      price_range: 'Plots from ₹9.5 Lakhs to ₹22.8 Lakhs (Completed)',
      status: 'Completed',
      is_featured: true,
      banner_image: '/project_aishwarya_nagar.jpg',
      video_url: '',
      brochure_url: '/brochure_aishwarya_nagar.jpg',
      google_maps_embed_url: 'https://maps.google.com/?q=BHEL+Thirumayam+Kadiyapatti+Thirumayam',
      dtcp_number: 'Approved Residential Layout',
      rera_number: 'Clear Legal Titles',
      gallery_images: [
        '/project_aishwarya_nagar.jpg'
      ],
      highlights: [
        'Maiden Dedicated Township Launched in 2022 — 100% Completed & Handed Over',
        'Located Just 1.5 km from BHEL Thirumayam Heavy Industrial Zone',
        'Abundant Sweet Potable Groundwater at Shallow Depths',
        'Protective Concrete Perimeter Boundary Wall Surrounding all Plots',
        'Pre-Approved for Bank Housing Loans with Leading Financial Institutions',
        'Just 10 Minutes (4.5 km) from Thirumayam Railway Station',
        'Prime Industrial Development Belt with Superior Long-Term Capital Gains'
      ],
      amenities: [
        { icon: 'Droplets', title: 'Sweet Potable Water', desc: 'Sweet groundwater available throughout all seasons at shallow depth.' },
        { icon: 'Fence', title: 'Protective Boundary Walls', desc: 'Sturdy perimeter fencing and concrete boundary posts securing every plot.' },
        { icon: 'Award', title: 'Bank Loan Eligible', desc: 'Clear legal title certificates accepted by all major nationalized banks.' },
        { icon: 'Milestone', title: 'Direct Road Access', desc: 'Direct connectivity to Thirumayam and Pudukkottai Highway corridors.' }
      ],
      nearby_landmarks: [
        { landmark: 'BHEL Thirumayam Heavy Industrial Unit', category: 'Workplace', distance: '1.5 km', time: '3 mins', map_url: 'https://maps.google.com/?q=BHEL+Thirumayam' },
        { landmark: 'Ilanjavur Village Junction', category: 'Transit', distance: '1.5 km', time: '3 mins', map_url: 'https://maps.google.com/?q=Ilanjavur+Pudukkottai' },
        { landmark: 'Thirumayam Railway Station', category: 'Transit', distance: '4.5 km', time: '10 mins', map_url: 'https://maps.google.com/?q=Thirumayam+Railway+Station' },
        { landmark: 'Thirumayam Historic Fort & Temple', category: 'Worship', distance: '5.0 km', time: '12 mins', map_url: 'https://maps.google.com/?q=Thirumayam+Fort' }
      ],
      created_at: new Date('2022-06-01').toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const plots = [
    // Park Avenue Plots
    {
      id: 'plot-pa-01',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #01',
      dimension_str: '25 x 30 Ft',
      dimension: '25 x 30 Ft',
      area_sqft: 750,
      facing: 'North Facing',
      price: 2265000,
      price_per_sqft: 3020,
      status: 'Available',
      approval_status: '100% DTCP Approved',
      description: 'Compact prime residential plot facing North on a 30ft avenue road with instant spot registration clearance.',
      primary_image_url: '/project_park_avenue_new.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 'plot-pa-02',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #02',
      dimension_str: '30 x 40 Ft',
      dimension: '30 x 40 Ft',
      area_sqft: 1200,
      facing: 'East Facing',
      price: 3516000,
      price_per_sqft: 2930,
      status: 'Available',
      approval_status: '100% DTCP Approved',
      description: 'Standard East-facing plot ideal for 3BHK duplex villa construction. Direct access to sweet groundwater connection.',
      primary_image_url: '/project_park_avenue_new.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 'plot-pa-03',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #03 (Corner)',
      dimension_str: '35 x 45 Ft',
      dimension: '35 x 45 Ft',
      area_sqft: 1575,
      facing: 'North-East Corner',
      price: 4756500,
      price_per_sqft: 3020,
      status: 'Few Left',
      approval_status: '100% DTCP Approved',
      description: 'Premium double-road corner plot facing North-East with dual ventilation and spacious frontage.',
      primary_image_url: '/project_park_avenue_new.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 'plot-pa-04',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #04',
      dimension_str: '40 x 50 Ft',
      dimension: '40 x 50 Ft',
      area_sqft: 2000,
      facing: 'East Facing',
      price: 6040000,
      price_per_sqft: 3020,
      status: 'Available',
      approval_status: '100% DTCP Approved',
      description: 'Large estate villa plot facing pure East along the main 40ft tree-lined central avenue.',
      primary_image_url: '/project_park_avenue_new.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 'plot-pa-05',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #05 (Grand Corner)',
      dimension_str: '45 x 60 Ft',
      dimension: '45 x 60 Ft',
      area_sqft: 2687,
      facing: 'Grand Corner Plot',
      price: 8100000,
      price_per_sqft: 3014,
      status: 'Few Left',
      approval_status: '100% DTCP Approved',
      description: 'Flagship grand corner estate plot directly adjoining the park reserve. Ideal for luxury bungalow with private garden.',
      primary_image_url: '/project_park_avenue_new.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 'plot-pa-06',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #06',
      dimension_str: '30 x 40 Ft',
      dimension: '30 x 40 Ft',
      area_sqft: 1200,
      facing: 'West Facing',
      price: 3516000,
      price_per_sqft: 2930,
      status: 'Available',
      approval_status: '100% DTCP Approved',
      description: 'Regular rectangular plot facing West with wide street access and street lighting provisions.',
      primary_image_url: '/project_park_avenue_new.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 'plot-pa-07',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #07',
      dimension_str: '30 x 50 Ft',
      dimension: '30 x 50 Ft',
      area_sqft: 1500,
      facing: 'North Facing',
      price: 4395000,
      price_per_sqft: 2930,
      status: 'Booked',
      approval_status: '100% DTCP Approved',
      description: 'North-facing residential plot currently booked by customer for custom home development.',
      primary_image_url: '/project_park_avenue_new.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 'plot-pa-08',
      project_id: 'proj-park-avenue',
      plot_number: 'Plot #08',
      dimension_str: '40 x 60 Ft',
      dimension: '40 x 60 Ft',
      area_sqft: 2400,
      facing: 'South Facing',
      price: 7032000,
      price_per_sqft: 2930,
      status: 'Sold',
      approval_status: '100% DTCP Approved',
      description: 'Spacious residential plot successfully sold and registered with bank loan endorsement.',
      primary_image_url: '/project_park_avenue_new.jpg',
      created_at: new Date().toISOString()
    },

    // Sri Amman Nagar Plots (Sold Out)
    {
      id: 'plot-san-01',
      project_id: 'proj-sri-amman-nagar',
      plot_number: 'Plot #12',
      dimension_str: '25 x 40 Ft',
      dimension: '25 x 40 Ft',
      area_sqft: 1000,
      facing: 'West Facing',
      price: 2400000,
      price_per_sqft: 2400,
      status: 'Sold Out',
      approval_status: 'DTCP Approved No. 56/2024',
      description: 'Sold in record 60 days with Cauvery water connection and 5-year maintenance guarantee.',
      primary_image_url: '/project_sri_amman_nagar_new.jpg',
      created_at: new Date('2025-01-10').toISOString()
    },
    {
      id: 'plot-san-02',
      project_id: 'proj-sri-amman-nagar',
      plot_number: 'Plot #14',
      dimension_str: '30 x 40 Ft',
      dimension: '30 x 40 Ft',
      area_sqft: 1200,
      facing: 'East Facing',
      price: 2880000,
      price_per_sqft: 2400,
      status: 'Sold Out',
      approval_status: 'DTCP Approved No. 56/2024',
      description: 'East-facing villa plot sold out with complete streetlights and protective compound wall.',
      primary_image_url: '/project_sri_amman_nagar_new.jpg',
      created_at: new Date('2025-01-15').toISOString()
    },

    // Aishwarya Nagar Plots (Completed)
    {
      id: 'plot-an-01',
      project_id: 'proj-aishwarya-nagar',
      plot_number: 'Plot #01',
      dimension_str: '30 x 40 Ft',
      dimension: '30 x 40 Ft',
      area_sqft: 1200,
      facing: 'North Facing',
      price: 1140000,
      price_per_sqft: 950,
      status: 'Sold Out',
      approval_status: 'Approved Residential Layout',
      description: 'Maiden development landmark plot handed over with sweet drinking water and title deeds.',
      primary_image_url: '/project_aishwarya_nagar.jpg',
      created_at: new Date('2022-06-15').toISOString()
    }
  ];

  const gallery = [
    {
      id: 'gal-1',
      title: 'Broad 40ft Main Blacktop Road - Park Avenue',
      image_url: '/project_park_avenue_new.jpg',
      category: 'Park Avenue',
      sort_order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'gal-2',
      title: 'Architectural Gated Entrance & Security Cabins',
      image_url: '/hero_gate_entrance.png',
      category: 'Park Avenue',
      sort_order: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 'gal-3',
      title: 'Sri Amman Nagar Gated Township Layout',
      image_url: '/project_sri_amman_nagar_new.jpg',
      category: 'Sri Amman Nagar',
      sort_order: 3,
      created_at: new Date().toISOString()
    },
    {
      id: 'gal-4',
      title: 'Aishwarya Nagar Plotted Venture at Thirumayam',
      image_url: '/project_aishwarya_nagar.jpg',
      category: 'Aishwarya Nagar',
      sort_order: 4,
      created_at: new Date().toISOString()
    }
  ];

  const blogs = [
    {
      id: 'blog-01',
      title: 'Why Trichy-Pudukkottai Highway Corridor Is The #1 Plotted Investment Hub in 2026',
      slug: 'trichy-pudukkottai-highway-investment-2026',
      category: 'Market Trends',
      author: 'Sree Hari Research Desk',
      read_time: '5 min read',
      banner_image: '/project_park_avenue_new.jpg',
      image_url: '/project_park_avenue_new.jpg',
      excerpt: 'An in-depth analysis of property appreciation rates, upcoming infrastructure corridors, and residential land potential around Thiruverumbur & Kattur.',
      content: 'Trichy is rapidly expanding along major national highways and industrial corridors. Areas around the Trichy-Pudukkottai Highway corridor, airport expansion routes, and Panjappur integrated terminal are seeing extraordinary appreciation. Investing in DTCP & TNRERA approved gated layouts provides the highest safety, sweet groundwater, and immediate clear title peace of mind.',
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

  // 1. Save to JSON fallback only if empty
  const store = db.getFallbackData();
  if (!store.users || store.users.length === 0) store.users = [adminUser];
  if (!store.amenities || store.amenities.length === 0) store.amenities = amenities;
  if (!store.projects || store.projects.length === 0) store.projects = projects;
  if (!store.plots || store.plots.length === 0) store.plots = plots;
  if (!store.gallery || store.gallery.length === 0) store.gallery = gallery;
  if (!store.blogs || store.blogs.length === 0) store.blogs = blogs;
  if (!store.settings || Object.keys(store.settings).length === 0) store.settings = settings;
  db.saveFallbackData(store);

  // 2. Save directly to PostgreSQL Database if connected (IDEMPOTENT - DO NOTHING ON CONFLICT)
  if (db.isPostgres()) {
    try {
      // Seed users
      await db.query(
        `INSERT INTO users (id, username, email, password_hash, role, permissions, status, phone) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         ON CONFLICT (email) DO NOTHING;`,
        [adminUser.id, adminUser.username, adminUser.email, adminUser.password_hash, adminUser.role, JSON.stringify(adminUser.permissions), adminUser.status, adminUser.phone]
      );

      // Seed projects (do not overwrite existing projects)
      for (const p of projects) {
        await db.query(
          `INSERT INTO projects (
            id, name, slug, tagline, description, location_area, location_city, 
            total_extent_acres, total_plots_count, available_plots_count, plot_size_range, 
            price_range, status, is_featured, banner_image, video_url, brochure_url, 
            google_maps_embed_url, dtcp_number, rera_number, gallery_images, highlights, 
            amenities, nearby_landmarks
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
          )
          ON CONFLICT (slug) DO NOTHING;`,
          [
            p.id, p.name, p.slug, p.tagline, p.description, p.location_area, p.location_city,
            p.total_extent_acres, p.total_plots_count, p.available_plots_count, p.plot_size_range,
            p.price_range, p.status, p.is_featured, p.banner_image, p.video_url, p.brochure_url,
            p.google_maps_embed_url, p.dtcp_number, p.rera_number,
            JSON.stringify(p.gallery_images), JSON.stringify(p.highlights), JSON.stringify(p.amenities), JSON.stringify(p.nearby_landmarks)
          ]
        );
      }

      // Seed plots (do not overwrite existing plots)
      for (const p of plots) {
        await db.query(
          `INSERT INTO plots (
            id, project_id, plot_number, dimension_str, dimension, area_sqft, 
            facing, price, price_per_sqft, status, approval_status, description, primary_image_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO NOTHING;`,
          [
            p.id, p.project_id, p.plot_number, p.dimension_str, p.dimension, p.area_sqft,
            p.facing, p.price, p.price_per_sqft, p.status, p.approval_status, p.description, p.primary_image_url
          ]
        );
      }

      // Seed gallery (do not overwrite existing gallery)
      for (const g of gallery) {
        await db.query(
          `INSERT INTO gallery (id, title, image_url, category, sort_order)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING;`,
          [g.id, g.title, g.image_url, g.category, g.sort_order]
        );
      }

      // Seed blogs (do not overwrite existing blogs)
      for (const b of blogs) {
        await db.query(
          `INSERT INTO blogs (id, title, slug, category, author, read_time, banner_image, image_url, excerpt, content, meta_title, seo_title, meta_description, seo_description, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (slug) DO NOTHING;`,
          [b.id, b.title, b.slug, b.category, b.author, b.read_time, b.image_url, b.image_url, b.excerpt, b.content, b.seo_title, b.seo_title, b.seo_description, b.seo_description, b.status]
        );
      }

      console.log('✓ Successfully synchronized PostgreSQL Database with verified project details!');
    } catch (pgErr: any) {
      console.error('PostgreSQL synchronization warning:', pgErr.message);
    }
  }

  console.log('✓ Seeding complete: Projects, Plots, Gallery, Settings, and Admin User ready!');
}

// Execute if run directly
if (require.main === module) {
  runSeed().then(() => process.exit(0)).catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

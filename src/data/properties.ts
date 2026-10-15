export interface Property {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  location: string;
  city: string;
  mapUrl?: string;
  pricePerSqFt: number;
  totalPriceRange: string;
  plotSizes: string;
  availableUnits: number;
  totalPlots: number;
  dtcpNumber: string;
  reraNumber: string;
  status: 'Featured' | 'New Launch' | 'Ready to Invest' | 'Fast Selling' | 'Sold Out';
  badgeColor: 'magenta' | 'green' | 'blue' | 'amber';
  isFeatured: boolean;
  heroImage: string;
  images: string[];
  description: string;
  highlights: string[];
  amenitiesList: string[];
  amenities: {
    icon: string;
    title: string;
    desc: string;
  }[];
  plotVariants: {
    dimension: string;
    sqft: number;
    facing: string;
    approxPrice: string;
    status: 'Available' | 'Sold Out' | 'Few Left';
  }[];
  locationAdvantages: {
    landmark: string;
    distance: string;
    time: string;
  }[];
}

export const properties: Property[] = [
  {
    id: '1',
    slug: 'park-avenue',
    title: 'Park Avenue',
    tagline: 'Premier Gated Plotted Community with Grand Entrance on Trichy-Pudukkottai Highway Corridor.',
    location: 'Trichy-Pudukkottai Highway Corridor (Near Airport & Universities)',
    city: 'Trichy',
    mapUrl: 'https://maps.google.com/?q=Park+Avenue+Trichy+Pudukkottai+Highway+Corridor',
    pricePerSqFt: 2930,
    totalPriceRange: 'Plots from ₹22.65 Lakhs to ₹81 Lakhs',
    plotSizes: '750 - 2,687 Sq.Ft',
    availableUnits: 38,
    totalPlots: 101,
    dtcpNumber: '100% DTCP Approved',
    reraNumber: 'TNRERA Approved Layout',
    status: 'Featured',
    badgeColor: 'magenta',
    isFeatured: true,
    heroImage: '/project_park_avenue_new.jpg',
    images: [
      '/project_park_avenue_new.jpg',
    ],
    description: 'Park Avenue is Sree Hari Realty Promoters\' prestigious ongoing flagship plotted community spanning 5.37 acres with 101 DTCP & TNRERA approved residential plots. Situated directly on the booming Trichy-Pudukkottai Highway Corridor close to Trichy International Airport, major universities, and premier hospitals. Built to the highest civil infrastructure standards with a grand monumental entrance arch, wide blacktop tar avenues, 24/7 security, sweet potable groundwater, and immediate bank loan clearance with all leading banks.',
    highlights: [
      '5.37 Acres Gated Community with 101 DTCP & TNRERA Approved Plots',
      'Plot Sizes Ranging from 750 Sq.Ft up to 2,687 Sq.Ft',
      'Transparent Payment Milestones & 100% Clear Title Guarantee',
      'Booking Advance with Flexible Payment Schedule',
      'Pre-Approved Bank Loans from HDFC, PNB, SIB, SBI & All Leading Banks',
      'Grand Monumental Entrance Arch & Secured Boundary Fencing',
      'Strategic Location just 5.5 km from Trichy International Airport',
    ],
    amenitiesList: [
      'Grand Entrance Arch',
      'Wide Blacktop Tar Roads',
      'Sweet Potable Water',
      'Children\'s Park',
      'EB & Street Lighting',
      '24/7 Secured Community',
    ],
    amenities: [
      {
        icon: 'ShieldCheck',
        title: 'Grand Entrance & Security',
        desc: 'Monumental arch entrance with manned security, CCTV provision, and gated boundary.',
      },
      {
        icon: 'Milestone',
        title: 'Wide Blacktop Tar Roads',
        desc: 'Engineered heavy-duty asphalt roads designed for seamless two-way vehicular flow.',
      },
      {
        icon: 'Droplets',
        title: 'Sweet Groundwater',
        desc: 'Natural sweet potable water source with individual pipe provisions to plot boundaries.',
      },
      {
        icon: 'Trees',
        title: 'Landscaped Children\'s Park',
        desc: 'Dedicated open space reserve with children play equipment and green avenue plantations.',
      },
      {
        icon: 'Sun',
        title: 'Electricity & Streetlights',
        desc: 'High-voltage electric lines and bright LED streetlighting across all layout avenues.',
      },
      {
        icon: 'Award',
        title: 'Instant Spot Registration',
        desc: '100% clear parent title deeds with DTCP & TNRERA compliance and fast spot registration.',
      },
    ],
    plotVariants: [
      { dimension: '25 x 30 Ft', sqft: 750, facing: 'North Facing', approxPrice: '₹22,65,000', status: 'Available' },
      { dimension: '30 x 40 Ft', sqft: 1200, facing: 'East Facing', approxPrice: '₹35,16,000', status: 'Available' },
      { dimension: '35 x 45 Ft', sqft: 1575, facing: 'North-East Corner', approxPrice: '₹47,56,500', status: 'Few Left' },
      { dimension: '40 x 50 Ft', sqft: 2000, facing: 'East Facing', approxPrice: '₹60,40,000', status: 'Available' },
      { dimension: '45 x 60 Ft', sqft: 2687, facing: 'Grand Corner Plot', approxPrice: '₹81,00,000', status: 'Few Left' },
    ],
    locationAdvantages: [
      { landmark: 'M.I.E.T. Engineering College', distance: '2.0 km', time: '4 mins' },
      { landmark: 'Bharathidasan University', distance: '2.0 km', time: '4 mins' },
      { landmark: 'SRM Medical College & Hospital', distance: '4.0 km', time: '8 mins' },
      { landmark: 'Trichy International Airport', distance: '5.5 km', time: '10 mins' },
      { landmark: 'Anna University (Trichy Campus)', distance: '6.0 km', time: '10 mins' },
      { landmark: 'IIM Trichy', distance: '7.0 km', time: '12 mins' },
      { landmark: 'Panjappur Integrated Bus Stand', distance: '12.0 km', time: '18 mins' },
    ],
  },
  {
    id: '2',
    slug: 'sri-amman-nagar',
    title: 'Sri Amman Nagar',
    tagline: 'High-Growth Landmark Township in Thiruverumbur — 100% Sold Out in 60 Days.',
    location: 'Trichy - Thanjavur National Highway, Thiruverumbur, Trichy',
    city: 'Trichy',
    mapUrl: 'https://maps.google.com/?q=Sri+Amman+Nagar+Thiruverumbur+Trichy',
    pricePerSqFt: 2400,
    totalPriceRange: 'Plots from ₹24 Lakhs to ₹48 Lakhs (Sold Out)',
    plotSizes: '1000 - 2400 Sq.Ft',
    availableUnits: 0,
    totalPlots: 85,
    dtcpNumber: 'DTCP Approved No. 56/2024',
    reraNumber: 'TN/16/Layout/0474/2025',
    status: 'Fast Selling',
    badgeColor: 'magenta',
    isFeatured: true,
    heroImage: '/project_sri_amman_nagar_new.jpg',
    images: [
      '/project_sri_amman_nagar_new.jpg',
    ],
    description: 'Sri Amman Nagar is Sree Hari Realty\'s landmark township strategically positioned on the Trichy-Thanjavur National Highway in Thiruverumbur, within Trichy City Corporation limits. Endorsed with DTCP Approval No. 56/2024, TNRERA No. TN/16/Layout/0474/2025, and ISO 9001:2008 Certification, this project achieved an extraordinary record of 100% sold out within just 60 days of launch. Features 33ft and 24ft wide tar roads, Cauvery sweet drinking water line, complete EB streetlights, protective compound wall with entrance gate, and a rare 5-Year Maintenance & Security Guarantee.',
    highlights: [
      '100% Sold Out in 60 Days — Highly Successful Township (2025)',
      'DTCP Approved Layout No. 56/2024 & TNRERA No. TN/16/Layout/0474/2025',
      'Exclusive 5-Year Maintenance & Security Guarantee',
      'Direct Access from Trichy - Thanjavur National Highway',
      '33 Ft & 24 Ft High Quality Asphalt Tar Roads',
      'Cauvery Sweet Potable Drinking Water Supply',
      'Centrally Located near BHEL, OFT, HAPP, Monfort & Sowdambika Schools',
    ],
    amenitiesList: [
      '5-Year Maintenance Guarantee',
      'Cauvery Drinking Water',
      '33ft & 24ft Tar Roads',
      'EB & Street Lighting',
      'Compound Wall & Gate',
      'Stormwater Drainage',
    ],
    amenities: [
      {
        icon: 'ShieldCheck',
        title: '5-Year Maintenance & Security',
        desc: 'Unmatched 5-year maintenance and round-the-clock safety guarantee provided for all residents.',
      },
      {
        icon: 'Milestone',
        title: '33 Ft & 24 Ft Wide Tar Roads',
        desc: 'Paved high-grade tar roads with proper road camber and stormwater channel drains.',
      },
      {
        icon: 'Droplets',
        title: 'Cauvery Sweet Drinking Water',
        desc: 'Direct piped Cauvery potable drinking water connection provided throughout the layout.',
      },
      {
        icon: 'Fence',
        title: 'Compound Wall & Entrance Gate',
        desc: 'Secured peripheral compound wall with a welcoming gate for complete township protection.',
      },
      {
        icon: 'Sun',
        title: 'EB Power & Bright Streetlights',
        desc: 'Underground electricity connections and LED street lighting illuminating all avenues.',
      },
      {
        icon: 'Award',
        title: 'ISO 9001:2008 & Corporation Limits',
        desc: 'Inside Trichy City Corporation with ISO 9001:2008 quality certified layout layout execution.',
      },
    ],
    plotVariants: [
      { dimension: '25 x 40 Ft', sqft: 1000, facing: 'West Facing', approxPrice: '₹24,00,000', status: 'Sold Out' },
      { dimension: '30 x 40 Ft', sqft: 1200, facing: 'East Facing', approxPrice: '₹28,80,000', status: 'Sold Out' },
      { dimension: '30 x 50 Ft', sqft: 1500, facing: 'North Facing', approxPrice: '₹36,00,000', status: 'Sold Out' },
      { dimension: '40 x 50 Ft', sqft: 2000, facing: 'South Facing', approxPrice: '₹48,00,000', status: 'Sold Out' },
    ],
    locationAdvantages: [
      { landmark: 'Thiruverumbur Bus Stand', distance: '0.5 km', time: '2 mins' },
      { landmark: 'Vegetable Market & Sree Hari Sweets', distance: '0.5 km', time: '2 mins' },
      { landmark: 'Thiruverumbur Railway Station', distance: '1.0 km', time: '3 mins' },
      { landmark: 'Montfort School', distance: '2.0 km', time: '5 mins' },
      { landmark: 'Arulmigu Erumbeeswarar Temple', distance: '2.0 km', time: '5 mins' },
      { landmark: 'BHEL Trichy Complex', distance: '3.0 km', time: '6 mins' },
      { landmark: 'Sowdambika Chellamal School', distance: '3.0 km', time: '7 mins' },
      { landmark: 'OFT & HAPP Heavy Industries', distance: '7.0 km', time: '12 mins' },
      { landmark: 'Trichy International Airport', distance: '10.0 km', time: '18 mins' },
    ],
  },
  {
    id: '3',
    slug: 'aishwarya-nagar',
    title: 'Aishwarya Nagar',
    tagline: 'Maiden Township near BHEL Thirumayam — 100% Completed & Delivered.',
    location: 'Near BHEL Thirumayam (Behind Ilanjavur 1.5 km), Kadiyapatti, Thirumayam',
    city: 'Thirumayam',
    mapUrl: 'https://maps.google.com/?q=BHEL+Thirumayam+Kadiyapatti+Thirumayam',
    pricePerSqFt: 950,
    totalPriceRange: 'Plots from ₹9.5 Lakhs to ₹22.8 Lakhs (Completed)',
    plotSizes: '1000 - 2400 Sq.Ft',
    availableUnits: 0,
    totalPlots: 60,
    dtcpNumber: 'Approved Residential Layout',
    reraNumber: 'Clear Legal Titles',
    status: 'Ready to Invest',
    badgeColor: 'green',
    isFeatured: true,
    heroImage: '/project_aishwarya_nagar.jpg',
    images: [
      '/project_aishwarya_nagar.jpg',
    ],
    description: 'Aishwarya Nagar is Sree Hari Realty\'s maiden milestone plotted residential development launched in 2022. Located at Kadiyapatti & Kammangudippatti, directly adjoining the BHEL Thirumayam industrial hub (just 1.5 km behind Ilanjavur) in Pudukkottai district. Carefully conceived to give middle-income families, industrial employees, and discerning investors secure, legally unassailable land with abundant sweet drinking water, complete boundary security walls, and rapid industrial belt capital appreciation. Fully completed and handed over.',
    highlights: [
      'Maiden Dedicated Township Launched in 2022 — 100% Completed & Handed Over',
      'Located Just 1.5 km from BHEL Thirumayam Heavy Industrial Zone',
      'Abundant Sweet Potable Groundwater at Shallow Depths',
      'Protective Concrete Perimeter Boundary Wall Surrounding all Plots',
      'Pre-Approved for Bank Housing Loans with Leading Financial Institutions',
      'Just 10 Minutes (4.5 km) from Thirumayam Railway Station',
      'Prime Industrial Development Belt with Superior Long-Term Capital Gains',
    ],
    amenitiesList: [
      'Sweet Potable Water',
      'Protective Boundary Walls',
      'Bank Loan Eligible',
      'Direct Road Access',
      'Industrial Growth Belt',
      'Clear Spot Patta',
    ],
    amenities: [
      {
        icon: 'Droplets',
        title: 'Abundant Sweet Drinking Water',
        desc: 'Pristine sweet ground drinking water available year-round across the community.',
      },
      {
        icon: 'Fence',
        title: 'Protective Boundary Walls',
        desc: 'Full concrete boundary wall protecting the perimeter and demarcating all plots.',
      },
      {
        icon: 'ShieldCheck',
        title: 'Bank Housing Loan Eligible',
        desc: '100% crystal-clear parent documents enabling effortless housing loan approvals.',
      },
      {
        icon: 'Milestone',
        title: 'Direct Road Connectivity',
        desc: 'Connecting quickly to National Highway corridors and BHEL manufacturing gates.',
      },
      {
        icon: 'Sun',
        title: 'Electricity & Street Infrastructure',
        desc: 'Fully established electrification lines supporting immediate home building.',
      },
      {
        icon: 'Award',
        title: '100% Clear Titles & Patta',
        desc: 'Legally certified documentation with seamless, transparent registration transfer.',
      },
    ],
    plotVariants: [
      { dimension: '25 x 40 Ft', sqft: 1000, facing: 'West Facing', approxPrice: '₹9,50,000', status: 'Sold Out' },
      { dimension: '30 x 40 Ft', sqft: 1200, facing: 'East Facing', approxPrice: '₹11,40,000', status: 'Sold Out' },
      { dimension: '30 x 50 Ft', sqft: 1500, facing: 'North Facing', approxPrice: '₹14,25,000', status: 'Sold Out' },
      { dimension: '40 x 50 Ft', sqft: 2000, facing: 'South Facing', approxPrice: '₹19,00,000', status: 'Sold Out' },
      { dimension: '40 x 60 Ft', sqft: 2400, facing: 'Corner Plot', approxPrice: '₹22,80,000', status: 'Sold Out' },
    ],
    locationAdvantages: [
      { landmark: 'BHEL Thirumayam Complex', distance: '1.5 km', time: '3 mins' },
      { landmark: 'Ilanjavur Village Hub', distance: '1.5 km', time: '3 mins' },
      { landmark: 'Thirumayam Railway Station', distance: '4.5 km', time: '10 mins' },
      { landmark: 'Thirumayam Historic Fort', distance: '6.0 km', time: '12 mins' },
      { landmark: 'Pudukkottai Central Junction', distance: '18 km', time: '25 mins' },
      { landmark: 'Trichy International Airport', distance: '45 km', time: '50 mins' },
    ],
  },
];

export const COMPANY_PHONE = '+91 73737 13559';
export const COMPANY_PHONE_RAW = '917373713559';
export const COMPANY_PHONE_SECONDARY = '+91 99441 11930';
export const COMPANY_PHONE_SECONDARY_RAW = '919944111930';
export const COMPANY_WHATSAPP = '917373713559';
export const COMPANY_EMAIL = 'sreeharirealty@gmail.com';
export const COMPANY_ADDRESS = '9/A1-9A2, 1st Floor, Sree Hari Sweets Building, Near Melapudur Bus Stop, Melapudur, Trichy - 620001';

export const TAMIL_NADU_DISTRICTS = [
  'Trichy (Tiruchirappalli)',
  'Thiruverumbur',
  'Thirumayam',
  'Pudukkottai',
  'Thanjavur',
  'Madurai',
  'Coimbatore',
  'Chennai',
  'Chengalpattu',
  'Salem',
  'Dindigul',
  'Tirunelveli',
  'Erode',
  'Tiruppur',
  'Vellore',
  'Kanchipuram',
  'Karur',
  'Hosur / Krishnagiri',
  'Theni',
  'Sivagangai',
  'Cuddalore',
  'Nagapattinam',
  'Mayiladuthurai',
  'Thoothukudi (Tuticorin)',
  'Kanyakumari / Nagercoil',
  'Namakkal',
  'Virudhunagar',
  'Tiruvallur',
  'Tiruvannamalai',
  'Villupuram',
  'Ramanathapuram',
  'Tenkasi',
  'Perambalur',
  'Ariyalur',
  'Dharmapuri',
  'Nilgiris',
  'Ranipet',
  'Tirupathur',
  'Kallakurichi',
];

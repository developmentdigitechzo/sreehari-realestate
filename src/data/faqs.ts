export interface FAQItem {
  question: string;
  answer: string;
  category: 'Project Specific' | 'Legal & Approvals' | 'Bank Loans' | 'Infrastructure & Amenities' | 'Booking & Site Visits';
}

export const faqs: FAQItem[] = [
  // --- PROJECT SPECIFIC FAQs ---
  {
    category: 'Project Specific',
    question: 'Where is Park Avenue located and what makes its location prime?',
    answer: 'Park Avenue is strategically situated along the Trichy–Pudukkottai Highway (NH 336) growth corridor near Mathur and Trichy International Airport (New Terminal). It enjoys close proximity to Bharathidasan University, Anna University BIT Campus, and MIET Institutions. In addition, revered places of worship—including Gundur Mathurakaliamman Temple, Gundur Jumma Masjid, and Infant Jesus Church—are just minutes away, making it a peaceful, prime residential location.'
  },
  {
    category: 'Project Specific',
    question: 'What plot sizes and road widths are available in Park Avenue?',
    answer: 'Park Avenue offers diverse plot sizes ranging from 750 sq.ft up to 2,687 sq.ft, catering to budget home builders, spacious independent villas, and high-yield investors. The layout is engineered with wide 40-foot and 33-foot blacktop tar roads, underground stormwater drains, and planted avenue trees.'
  },
  {
    category: 'Project Specific',
    question: 'What are the key advantages of Sri Amman Nagar in Thiruverumbur?',
    answer: 'Sri Amman Nagar is located on the Trichy–Thanjavur National Highway (NH 83) within the Trichy City Corporation limits, just 2 minutes from the BHEL Township and close to NIT Trichy (National Institute of Technology). Being inside the Corporation limits, residents enjoy municipal infrastructure, Corporation drinking water facilities, street lighting, and a 5-year maintenance assurance.'
  },
  {
    category: 'Project Specific',
    question: 'Is Cauvery drinking water available at Sri Amman Nagar?',
    answer: 'Yes, Sri Amman Nagar is situated within Trichy Corporation boundaries and has direct access to the municipal water supply network, including Cauvery drinking water pipeline connectivity alongside rich local groundwater.'
  },
  {
    category: 'Project Specific',
    question: 'Can I construct my house immediately at Sri Amman Nagar or Park Avenue?',
    answer: 'Yes! Both Sri Amman Nagar and Park Avenue are 100% "Ready-to-Construct" gated layouts. Electricity power poles (TANGEDCO) are in place, roads are fully laid, and the surrounding areas are thriving residential communities with schools, markets, and transport within 2–5 minutes.'
  },
  {
    category: 'Project Specific',
    question: 'What are the features of Aishwarya Nagar in Thirumayam?',
    answer: 'Aishwarya Nagar is located in Thirumayam (near BHEL Thirumayam and Ilanjavur) along the Trichy–Pudukkottai–Karaikudi corridor. It offers DTCP & TNRERA approved plots with crystal-clear parent titles, sweet groundwater at shallow depths, wide tar roads, and immediate spot registration with Patta transfer.'
  },
  {
    category: 'Project Specific',
    question: 'Is Aishwarya Nagar suitable for investment or immediate living?',
    answer: 'Aishwarya Nagar is ideal for both. For professionals working in BHEL Thirumayam, Ilanjavur, and Pudukkottai town, it provides a serene residential setting. For investors, rapid industrial and highway expansion in the corridor guarantees high capital appreciation and quick liquidity.'
  },

  // --- LEGAL & APPROVALS FAQs ---
  {
    category: 'Legal & Approvals',
    question: 'Are all plots approved by DTCP and TNRERA?',
    answer: 'Yes, 100% of plotted developments by Sree Hari Realty Promoters hold official approvals from DTCP (Directorate of Town and Country Planning) and are registered with TNRERA (Tamil Nadu Real Estate Regulatory Authority). We provide copies of government approval orders and stamped blueprint maps prior to booking.'
  },
  {
    category: 'Legal & Approvals',
    question: 'Can I verify parent documents and get an independent legal opinion before booking?',
    answer: 'Absolutely. We practice complete legal transparency. We provide a full documentation set—including 30-year Encumbrance Certificates (EC), parent title deeds, revenue Patta copies, FMB sketches, and legal audit opinions from senior advocates—for independent verification by your advocate.'
  },
  {
    category: 'Legal & Approvals',
    question: 'Does Sree Hari Realty assist with Patta transfer and Namakaran?',
    answer: 'Yes. Our dedicated in-house legal and liaison desk handles the complete individual Patta transfer and revenue documentation process in your name following registration at the Sub-Registrar Office at zero liaison charges.'
  },
  {
    category: 'Legal & Approvals',
    question: 'How do you ensure clear titles and dispute-free land?',
    answer: 'Every parcel of land acquired by Sree Hari Realty Promoters undergoes rigorous legal scrutiny spanning over 30 years of documentation. We verify that all lands have unencumbered freehold ownership, NIL litigation, clear revenue records, and full conversion to non-agricultural residential layout approval.'
  },

  // --- BANK LOANS FAQs ---
  {
    category: 'Bank Loans',
    question: 'Which banks provide loans for purchasing plots in your projects?',
    answer: 'Our projects are pre-approved by leading nationalized and private financial institutions, including State Bank of India (SBI), HDFC Bank, ICICI Bank, Axis Bank, and LIC Housing Finance. Buyers can avail up to 75% – 80% plot purchase and composite home construction loans.'
  },
  {
    category: 'Bank Loans',
    question: 'What documents are required to apply for a bank loan?',
    answer: 'You will need basic KYC (Aadhaar & PAN card), latest 3 months salary slips, 6 months bank statement, Form 16 / ITR, and passport photos. Our in-house banking coordinator collects these documents from your doorstep, coordinates bank valuation, and tracks approval until loan disbursement.'
  },
  {
    category: 'Bank Loans',
    question: 'Can self-employed or business persons get loan approval?',
    answer: 'Yes. For self-employed and business applicants, loans are sanctioned based on 2–3 years of Income Tax Returns (ITR), audited balance sheets, GST returns, and 12-month business bank statements through our partner bank loan desks.'
  },

  // --- INFRASTRUCTURE & AMENITIES FAQs ---
  {
    category: 'Infrastructure & Amenities',
    question: 'What infrastructure is delivered in your gated layouts?',
    answer: 'Every Sree Hari plotted community is developed with high-grade 40ft/33ft/30ft asphalt blacktop roads, secured 7ft perimeter boundary walls, architect-designed grand entrance arches, underground stormwater drainage, individual potable water connection points, solar/LED street lighting, and landscaped avenue trees.'
  },
  {
    category: 'Infrastructure & Amenities',
    question: 'What is the groundwater quality and depth across your project locations?',
    answer: 'All our layout locations in Thiruverumbur, Mathur Airport corridor, and Thirumayam have tested sweet, potable groundwater available at shallow depths (between 25 to 60 feet), ensuring lifelong, self-sufficient drinking water availability.'
  },

  // --- BOOKING & SITE VISITS FAQs ---
  {
    category: 'Booking & Site Visits',
    question: 'Do you arrange free site visits for interested buyers and families?',
    answer: 'Yes! We arrange complimentary doorstep pickup and drop in air-conditioned company cabs 7 days a week from your home, office, or hotel anywhere in Trichy and nearby districts. You can book a convenient date and time through our website or WhatsApp.'
  },
  {
    category: 'Booking & Site Visits',
    question: 'Can Non-Resident Indians (NRIs) purchase plots with Sree Hari Realty?',
    answer: 'Yes. We offer complete end-to-end NRI facilitation, including HD live video site walkthroughs, digital blueprint reviews, NRI banking compliance (NRE/NRO/FCNR accounts), Power of Attorney (PoA) guidance, and transparent remote registration assistance.'
  },
  {
    category: 'Booking & Site Visits',
    question: 'What is the booking procedure and payment schedule?',
    answer: 'You can book your preferred plot with a nominal advance token amount. Upon token confirmation, the plot is blocked exclusively for you. We provide the sale agreement, coordinate bank loan sanctioning, and schedule the spot registration at the Sub-Registrar Office at your convenience.'
  }
];

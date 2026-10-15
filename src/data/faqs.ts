export interface FAQItem {
  question: string;
  answer: string;
  category: 'Legal & Approvals' | 'Booking & Registration' | 'Bank Loans' | 'Infrastructure & Amenities';
}

export const faqs: FAQItem[] = [
  {
    category: 'Legal & Approvals',
    question: 'Are all plots approved by DTCP and RERA?',
    answer: 'Yes, 100% of our gated plotted developments carry valid approvals from DTCP (Directorate of Town and Country Planning) and are registered with TNRERA. We provide copies of approval orders, approved layout blueprints, and legal title opinion reports from veteran advocates prior to booking.'
  },
  {
    category: 'Legal & Approvals',
    question: 'Can I get a legal opinion from my personal lawyer before booking?',
    answer: 'Absolutely. We encourage total transparency. We provide a full set of parent title deeds, 30-year Encumbrance Certificates (EC), Patta copies, and approval orders for independent verification by your advocate.'
  },
  {
    category: 'Booking & Registration',
    question: 'What is the procedure to book a plot with Sree Hari Realty Promoters?',
    answer: 'You can book your preferred plot by paying an initial advance token amount. Upon token confirmation, the plot is blocked exclusively for you. We then prepare the Sale Agreement and proceed with immediate spot registration at the Sub-Registrar Office once loan/payment milestones are completed.'
  },
  {
    category: 'Booking & Registration',
    question: 'Does Sree Hari Realty Promoters assist with Patta transfer and Namakaran?',
    answer: 'Yes, our dedicated legal and liaison team assists every buyer end-to-end with the individual Patta transfer and documentation in their name following registration.'
  },
  {
    category: 'Bank Loans',
    question: 'Is bank loan available for purchasing these plots?',
    answer: 'Yes! Our projects are pre-approved by leading nationalized and private banks including State Bank of India (SBI), HDFC Bank, ICICI Bank, Axis Bank, and LIC Housing Finance. Buyers can avail up to 75% - 80% plot purchase loans at attractive interest rates with our door-step loan desk assistance.'
  },
  {
    category: 'Infrastructure & Amenities',
    question: 'What infrastructure is delivered in your gated communities?',
    answer: 'Every Sree Hari plotted community is developed with high-grade 40ft/33ft/30ft asphalt blacktop roads, secured 7ft boundary compound walls, grand gated entrance arches, underground stormwater drainage, individual potable water connection points, solar/LED streetlights, and landscaped avenue plantation.'
  },
  {
    category: 'Infrastructure & Amenities',
    question: 'Can I construct my house immediately after registration?',
    answer: 'Yes, all our layouts are "Ready-to-Construct" with active electricity connections, high groundwater table, and heavy-duty road access suitable for immediate construction.'
  },
  {
    category: 'Booking & Registration',
    question: 'Do you arrange site visits for interested buyers and families?',
    answer: 'Yes, we provide complimentary, door-step pickup and drop for site visits 7 days a week. You can click the "Book Site Visit" button or message us directly on WhatsApp to pick a convenient date and time.'
  }
];

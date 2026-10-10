import React from 'react';

export default function BlackCarIcon({ className = "w-16 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 130 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Car Shadow */}
      <ellipse cx="65" cy="46" rx="55" ry="3" fill="#000000" fillOpacity="0.35" />
      
      {/* Car Main Body - Sleek Metallic Obsidian Black */}
      <path
        d="M10 33C10 33 16 26 30 24C36 23 44 15 56 12C70 8.5 90 9 98 14C106 19 112 24 118 28C122 31 122 35 120 38C118 41 112 42 108 42C106 36 100 32 93 32C86 32 80 36 78 42H48C46 36 40 32 33 32C26 32 20 36 18 42H12C9 42 8 38 10 33Z"
        fill="#171717"
      />
      {/* Gloss Highlight on Body */}
      <path
        d="M28 25C40 24 60 22 85 22C105 22 114 27 114 27"
        stroke="#525252"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Roof & Windshield Frame */}
      <path
        d="M46 15L56 12C70 8.5 88 9 96 14L102 22H40L46 15Z"
        fill="#0A0A0A"
      />
      {/* Tinted Windows */}
      <path
        d="M50 15L58 13C68 10.5 80 11 86 13L90 21H45L50 15Z"
        fill="#38BDF8"
        fillOpacity="0.45"
      />
      {/* Window Pillar */}
      <path d="M68 12.5V21H71V12.5H68Z" fill="#171717" />

      {/* Headlight & Beam */}
      <ellipse cx="118" cy="30" rx="3.5" ry="2" fill="#FEF08A" />
      <polygon points="120,29 130,26 130,34 120,31" fill="#FEF08A" fillOpacity="0.5" />

      {/* Tail light */}
      <rect x="10" y="29" width="3" height="5" rx="1" fill="#EF4444" />

      {/* Front Wheel */}
      <circle cx="93" cy="40" r="8.5" fill="#0A0A0A" />
      <circle cx="93" cy="40" r="5.5" fill="#525252" />
      <circle cx="93" cy="40" r="2.5" fill="#D4D4D4" />

      {/* Rear Wheel */}
      <circle cx="33" cy="40" r="8.5" fill="#0A0A0A" />
      <circle cx="33" cy="40" r="5.5" fill="#525252" />
      <circle cx="33" cy="40" r="2.5" fill="#D4D4D4" />

      {/* Door Handle */}
      <rect x="62" y="25" width="6" height="1.5" rx="0.5" fill="#737373" />
    </svg>
  );
}

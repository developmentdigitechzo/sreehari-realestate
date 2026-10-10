'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  GraduationCap,
  Building2,
  Cross,
  Plane,
  Award,
  Bus,
  MapPin
} from 'lucide-react';

interface Landmark {
  id: string;
  name: string;
  category: string;
  distance: string;
  icon: React.ReactNode;
  side: 'left' | 'right';
  y: number;
}

export default function LocationAdvantageMap() {
  const [hoveredLandmark, setHoveredLandmark] = useState<string | null>(null);

  // SVG dimensions: 860 width x 330 height (Compact & balanced, zero empty top/bottom dead space)
  // Center Project Location: (430, 165)
  // Left cards touch at x=210, Right cards touch at x=650
  const landmarks: Landmark[] = [
    // Left side: 4 Academic & Medical Institutions
    {
      id: 'miet-college',
      name: 'M.I.E.T. College',
      category: 'Engineering & Arts',
      distance: '2 km',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      side: 'left',
      y: 32,
    },
    {
      id: 'bharathidasan-univ',
      name: 'Bharathidasan University',
      category: 'Premier State University',
      distance: '4 km',
      icon: <Building2 className="w-3.5 h-3.5" />,
      side: 'left',
      y: 114,
    },
    {
      id: 'srm-medical',
      name: 'SRM Medical College',
      category: 'Hospital & Healthcare',
      distance: '4 km',
      icon: <Cross className="w-3.5 h-3.5" />,
      side: 'left',
      y: 196,
    },
    {
      id: 'anna-univ',
      name: 'Anna University',
      category: 'BIT Campus',
      distance: '6 km',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      side: 'left',
      y: 278,
    },

    // Right side: 3 Transit & Premier Institutes
    {
      id: 'trichy-airport',
      name: 'Trichy Airport',
      category: 'International Terminal',
      distance: '5.5 km',
      icon: <Plane className="w-3.5 h-3.5" />,
      side: 'right',
      y: 45,
    },
    {
      id: 'iim-trichy',
      name: 'IIM Trichy',
      category: 'National Institute',
      distance: '7 km',
      icon: <Award className="w-3.5 h-3.5" />,
      side: 'right',
      y: 155,
    },
    {
      id: 'panjappur-bus',
      name: 'Panjappur Bus Stand',
      category: 'Integrated Bus Terminal',
      distance: '12 km',
      icon: <Bus className="w-3.5 h-3.5" />,
      side: 'right',
      y: 265,
    },
  ];

  return (
    <div className="w-full relative select-none">
      {/* 1. Desktop & Tablet Geographic Map Visualization */}
      <div className="hidden sm:block relative w-full h-[330px]">
        <svg
          viewBox="0 0 860 330"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Tiruchirappalli District Soft Warm Sand & Amber Gradient */}
            <linearGradient id="trichyDistrictGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="40%" stopColor="#fef3c7" />
              <stop offset="80%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>

            {/* Red Pin Radar Beacon Pulse */}
            <radialGradient id="redBeaconPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#dc2626" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1.1 EXACT TIRUCHIRAPPALLI (TRICHY) DISTRICT GEOGRAPHIC MAP */}
          <g transform="translate(320, 10) scale(0.92)">
            {/* Soft Ambient District Drop Shadow */}
            <path
              d="M 90.8,0.0 L 97.3,3.5 L 100.5,10.6 L 107.0,17.6 L 113.5,21.1 L 120.0,21.1 L 120.0,28.2 L 126.5,35.2 L 129.7,42.3 L 129.7,49.3 L 129.7,56.4 L 136.2,63.4 L 142.7,66.9 L 149.2,70.5 L 155.7,66.9 L 162.2,63.4 L 168.6,63.4 L 175.1,66.9 L 181.6,74.0 L 188.1,77.5 L 194.6,81.0 L 201.1,81.0 L 207.6,84.5 L 214.1,84.5 L 220.5,84.5 L 227.0,84.5 L 233.5,81.0 L 240.0,84.5 L 240.0,91.6 L 240.0,98.6 L 240.0,105.7 L 240.0,112.7 L 240.0,119.8 L 240.0,126.8 L 236.8,133.9 L 233.5,137.4 L 227.0,137.4 L 220.5,133.9 L 214.1,133.9 L 207.6,140.9 L 201.1,144.4 L 194.6,151.5 L 188.1,158.5 L 184.9,165.6 L 184.9,172.6 L 181.6,179.7 L 184.9,186.7 L 181.6,193.8 L 178.4,197.3 L 171.9,197.3 L 165.4,193.8 L 158.9,193.8 L 152.4,190.2 L 145.9,183.2 L 139.5,186.7 L 136.2,193.8 L 133.0,200.8 L 126.5,200.8 L 120.0,204.3 L 113.5,204.3 L 107.0,211.4 L 100.5,211.4 L 94.1,211.4 L 87.6,211.4 L 81.1,218.4 L 77.8,225.5 L 74.6,232.5 L 74.6,239.5 L 77.8,246.6 L 81.1,253.6 L 84.3,260.7 L 90.8,267.7 L 97.3,264.2 L 103.8,257.2 L 107.0,260.7 L 103.8,267.7 L 97.3,267.7 L 90.8,274.8 L 90.8,281.8 L 87.6,285.3 L 81.1,278.3 L 74.6,281.8 L 68.1,288.9 L 64.9,295.9 L 58.4,303.0 L 55.1,310.0 L 48.6,306.5 L 42.2,306.5 L 38.9,299.4 L 35.7,292.4 L 35.7,285.3 L 38.9,278.3 L 38.9,271.2 L 35.7,264.2 L 29.2,260.7 L 22.7,257.2 L 16.2,257.2 L 9.7,253.6 L 9.7,246.6 L 9.7,239.5 L 13.0,232.5 L 19.5,229.0 L 25.9,221.9 L 29.2,214.9 L 29.2,207.8 L 29.2,200.8 L 25.9,193.8 L 25.9,186.7 L 29.2,183.2 L 35.7,186.7 L 42.2,186.7 L 48.6,183.2 L 55.1,186.7 L 58.4,193.8 L 64.9,193.8 L 71.4,193.8 L 77.8,186.7 L 84.3,186.7 L 90.8,183.2 L 97.3,179.7 L 100.5,172.6 L 100.5,165.6 L 100.5,158.5 L 103.8,151.5 L 103.8,144.4 L 97.3,137.4 L 90.8,137.4 L 84.3,137.4 L 77.8,133.9 L 71.4,130.3 L 64.9,123.3 L 58.4,123.3 L 51.9,119.8 L 45.4,119.8 L 38.9,119.8 L 32.4,119.8 L 25.9,123.3 L 19.5,126.8 L 13.0,123.3 L 6.5,116.2 L 0.0,109.2 L 3.2,105.7 L 9.7,98.6 L 16.2,95.1 L 22.7,88.1 L 29.2,88.1 L 35.7,91.6 L 42.2,98.6 L 48.6,95.1 L 51.9,88.1 L 55.1,81.0 L 58.4,74.0 L 61.6,66.9 L 64.9,59.9 L 68.1,52.8 L 74.6,45.8 L 77.8,38.8 L 81.1,31.7 L 81.1,24.7 L 81.1,17.6 L 84.3,10.6 L 87.6,3.5 Z"
              fill="black"
              opacity="0.04"
              transform="translate(3, 4)"
            />

            {/* Exact Tiruchirappalli District Shape */}
            <path
              d="M 90.8,0.0 L 97.3,3.5 L 100.5,10.6 L 107.0,17.6 L 113.5,21.1 L 120.0,21.1 L 120.0,28.2 L 126.5,35.2 L 129.7,42.3 L 129.7,49.3 L 129.7,56.4 L 136.2,63.4 L 142.7,66.9 L 149.2,70.5 L 155.7,66.9 L 162.2,63.4 L 168.6,63.4 L 175.1,66.9 L 181.6,74.0 L 188.1,77.5 L 194.6,81.0 L 201.1,81.0 L 207.6,84.5 L 214.1,84.5 L 220.5,84.5 L 227.0,84.5 L 233.5,81.0 L 240.0,84.5 L 240.0,91.6 L 240.0,98.6 L 240.0,105.7 L 240.0,112.7 L 240.0,119.8 L 240.0,126.8 L 236.8,133.9 L 233.5,137.4 L 227.0,137.4 L 220.5,133.9 L 214.1,133.9 L 207.6,140.9 L 201.1,144.4 L 194.6,151.5 L 188.1,158.5 L 184.9,165.6 L 184.9,172.6 L 181.6,179.7 L 184.9,186.7 L 181.6,193.8 L 178.4,197.3 L 171.9,197.3 L 165.4,193.8 L 158.9,193.8 L 152.4,190.2 L 145.9,183.2 L 139.5,186.7 L 136.2,193.8 L 133.0,200.8 L 126.5,200.8 L 120.0,204.3 L 113.5,204.3 L 107.0,211.4 L 100.5,211.4 L 94.1,211.4 L 87.6,211.4 L 81.1,218.4 L 77.8,225.5 L 74.6,232.5 L 74.6,239.5 L 77.8,246.6 L 81.1,253.6 L 84.3,260.7 L 90.8,267.7 L 97.3,264.2 L 103.8,257.2 L 107.0,260.7 L 103.8,267.7 L 97.3,267.7 L 90.8,274.8 L 90.8,281.8 L 87.6,285.3 L 81.1,278.3 L 74.6,281.8 L 68.1,288.9 L 64.9,295.9 L 58.4,303.0 L 55.1,310.0 L 48.6,306.5 L 42.2,306.5 L 38.9,299.4 L 35.7,292.4 L 35.7,285.3 L 38.9,278.3 L 38.9,271.2 L 35.7,264.2 L 29.2,260.7 L 22.7,257.2 L 16.2,257.2 L 9.7,253.6 L 9.7,246.6 L 9.7,239.5 L 13.0,232.5 L 19.5,229.0 L 25.9,221.9 L 29.2,214.9 L 29.2,207.8 L 29.2,200.8 L 25.9,193.8 L 25.9,186.7 L 29.2,183.2 L 35.7,186.7 L 42.2,186.7 L 48.6,183.2 L 55.1,186.7 L 58.4,193.8 L 64.9,193.8 L 71.4,193.8 L 77.8,186.7 L 84.3,186.7 L 90.8,183.2 L 97.3,179.7 L 100.5,172.6 L 100.5,165.6 L 100.5,158.5 L 103.8,151.5 L 103.8,144.4 L 97.3,137.4 L 90.8,137.4 L 84.3,137.4 L 77.8,133.9 L 71.4,130.3 L 64.9,123.3 L 58.4,123.3 L 51.9,119.8 L 45.4,119.8 L 38.9,119.8 L 32.4,119.8 L 25.9,123.3 L 19.5,126.8 L 13.0,123.3 L 6.5,116.2 L 0.0,109.2 L 3.2,105.7 L 9.7,98.6 L 16.2,95.1 L 22.7,88.1 L 29.2,88.1 L 35.7,91.6 L 42.2,98.6 L 48.6,95.1 L 51.9,88.1 L 55.1,81.0 L 58.4,74.0 L 61.6,66.9 L 64.9,59.9 L 68.1,52.8 L 74.6,45.8 L 77.8,38.8 L 81.1,31.7 L 81.1,24.7 L 81.1,17.6 L 84.3,10.6 L 87.6,3.5 Z"
              fill="url(#trichyDistrictGrad)"
              stroke="#d97706"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* District Identifier Label */}
            <text x="120" y="85" textAnchor="middle" fill="#92400e" fontSize="10.5" fontWeight="900" letterSpacing="1.2">
              TIRUCHIRAPPALLI
            </text>
            <text x="120" y="97" textAnchor="middle" fill="#b45309" fontSize="8" fontWeight="700" opacity="0.9">
              DISTRICT MAP
            </text>
          </g>

          {/* 1.2 ANIMATED CONNECTING SPOKES (Direct seamless connection to exact card borders) */}
          {landmarks.map((lm) => {
            const isHovered = hoveredLandmark === lm.id;
            const targetX = lm.side === 'left' ? 210 : 650;
            const pathD =
              lm.side === 'left'
                ? `M 430 165 C 330 165, 270 ${lm.y}, 210 ${lm.y}`
                : `M 430 165 C 530 165, 590 ${lm.y}, 650 ${lm.y}`;

            return (
              <g key={lm.id} className="transition-all duration-300">
                {/* Connecting Curved Dashed Flow Line */}
                <path
                  d={pathD}
                  stroke={isHovered ? '#D61F69' : '#d97706'}
                  strokeWidth={isHovered ? '2.5' : '1.6'}
                  strokeDasharray="5 4"
                  className={isHovered ? 'animate-dash-fast' : 'animate-dash-slow'}
                  strokeLinecap="round"
                />

                {/* Animated Pulsing Signal Moving Outward */}
                <circle r={isHovered ? '4.5' : '3'} fill={isHovered ? '#D61F69' : '#006452'}>
                  <animateMotion
                    path={pathD}
                    dur={isHovered ? '1.2s' : '2.4s'}
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Connection Pin End Dot touching the exact card edge */}
                <circle
                  cx={targetX}
                  cy={lm.y}
                  r="4"
                  fill={isHovered ? '#D61F69' : '#d97706'}
                  stroke="#ffffff"
                  strokeWidth="1.8"
                />
              </g>
            );
          })}

          {/* 1.3 LEFT 4 LANDMARK CARDS (Compact, clean font hierarchy) */}
          {landmarks
            .filter((lm) => lm.side === 'left')
            .map((lm) => (
              <foreignObject
                key={lm.id}
                x="0"
                y={lm.y - 22}
                width="210"
                height="44"
                className="overflow-visible"
              >
                <div
                  onMouseEnter={() => setHoveredLandmark(lm.id)}
                  onMouseLeave={() => setHoveredLandmark(null)}
                  className={`flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-white border transition-all duration-300 cursor-pointer shadow-xs ${
                    hoveredLandmark === lm.id
                      ? 'border-[#D61F69] shadow-md scale-102 ring-1 ring-[#D61F69]/20'
                      : 'border-amber-200/90 hover:border-amber-400'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs ${
                      hoveredLandmark === lm.id
                        ? 'bg-[#D61F69] text-white'
                        : 'bg-pink-50 text-[#D61F69] border border-pink-100'
                    }`}
                  >
                    {lm.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11.5px] font-bold text-gray-900 tracking-tight leading-tight truncate">
                      {lm.name}
                    </h4>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="text-[9px] text-gray-500 truncate block">
                        {lm.category}
                      </span>
                      <span className="text-[11px] font-black text-[#D61F69] flex-shrink-0">
                        {lm.distance}
                      </span>
                    </div>
                  </div>
                </div>
              </foreignObject>
            ))}

          {/* 1.4 RIGHT 3 LANDMARK CARDS (Compact, clean font hierarchy) */}
          {landmarks
            .filter((lm) => lm.side === 'right')
            .map((lm) => (
              <foreignObject
                key={lm.id}
                x="650"
                y={lm.y - 22}
                width="210"
                height="44"
                className="overflow-visible"
              >
                <div
                  onMouseEnter={() => setHoveredLandmark(lm.id)}
                  onMouseLeave={() => setHoveredLandmark(null)}
                  className={`flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-white border transition-all duration-300 cursor-pointer shadow-xs ${
                    hoveredLandmark === lm.id
                      ? 'border-[#D61F69] shadow-md scale-102 ring-1 ring-[#D61F69]/20'
                      : 'border-amber-200/90 hover:border-amber-400'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs ${
                      hoveredLandmark === lm.id
                        ? 'bg-[#D61F69] text-white'
                        : 'bg-pink-50 text-[#D61F69] border border-pink-100'
                    }`}
                  >
                    {lm.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11.5px] font-bold text-gray-900 tracking-tight leading-tight truncate">
                      {lm.name}
                    </h4>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="text-[9px] text-gray-500 truncate block">
                        {lm.category}
                      </span>
                      <span className="text-[11px] font-black text-[#D61F69] flex-shrink-0">
                        {lm.distance}
                      </span>
                    </div>
                  </div>
                </div>
              </foreignObject>
            ))}

          {/* 1.5 CENTRAL PROMINENT RED LOCATION PIN & PROJECT LOCATION CARD */}
          <foreignObject x="355" y="116" width="150" height="98" className="overflow-visible">
            <div className="flex flex-col items-center text-center group cursor-pointer">
              {/* Prominent Red Pin with Radiating Beacon Rings */}
              <div className="relative flex items-center justify-center -mb-2 z-30">
                <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-red-600 opacity-60" />
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 text-white flex items-center justify-center shadow-2xl border-2 border-white ring-2 ring-red-400">
                  <MapPin className="w-4 h-4 fill-white text-white drop-shadow" />
                </div>
              </div>

              {/* Sree Hari Project Location Card */}
              <div className="relative bg-gradient-to-b from-white via-[#fffdf5] to-[#fef9e6] px-3.5 pt-2.5 pb-2 rounded-2xl border border-red-200 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex flex-col items-center min-w-[135px]">
                {/* Transparent High-Res Logo */}
                <div className="relative w-14 h-8 mb-0.5 flex items-center justify-center">
                  <Image
                    src="/logo_transparent.png"
                    alt="Sree Hari Realty Promoters Logo"
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="text-center space-y-0.5">
                  <div className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border border-red-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span>PROJECT LOCATION</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#006452] block pt-0.5">
                    TRICHY CORRIDOR
                  </span>
                </div>
              </div>
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* 2. Mobile Responsive View (under 640px) */}
      <div className="sm:hidden space-y-3">
        <div className="bg-gradient-to-b from-white via-[#fffef7] to-[#fef9e6] p-3 rounded-2xl border border-red-200 shadow-sm text-center flex flex-col items-center justify-center relative">
          <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md mb-1.5 border-2 border-white ring-2 ring-red-300">
            <MapPin className="w-3.5 h-3.5 fill-white" />
          </div>
          <div className="relative w-14 h-8 mb-1 flex items-center justify-center">
            <Image
              src="/logo_transparent.png"
              alt="Sree Hari Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xs font-black tracking-wider text-red-600">
            TIRUCHIRAPPALLI (TRICHY)
          </span>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#006452]">
            PROJECT LOCATION HUB
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {landmarks.map((lm) => (
            <div
              key={lm.id}
              className="bg-gradient-to-b from-white to-[#fffef4] p-2 px-3 rounded-xl border border-amber-200/80 shadow-2xs flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-pink-50 text-[#D61F69] flex items-center justify-center flex-shrink-0 text-xs">
                  {lm.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-gray-900 block truncate">
                    {lm.name}
                  </span>
                  <span className="text-[9.5px] text-gray-500 block truncate">
                    {lm.category}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-black text-[#D61F69] flex-shrink-0 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
                {lm.distance}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

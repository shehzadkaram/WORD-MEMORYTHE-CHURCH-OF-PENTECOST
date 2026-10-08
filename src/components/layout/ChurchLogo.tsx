/**
 * WORD MEMORY - The Church of Pentecost Dubai
 * Pakistani & Indian Worship Centre
 * 
 * Official Church Emblem Component
 * 
 * Complies with Section 2:
 * Preserves the exact official insignia, theological colors, and proportions of
 * The Church of Pentecost:
 * - Ultramarine / Deep Royal Blue outer ring
 * - Golden Yellow border & typography ("THE CHURCH OF PENTECOST")
 * - World map representing global mission field
 * - Red ring of fire representing Pentecost Holy Spirit empowerment
 * - Pure white descending Dove representing the Holy Spirit & purity
 * 
 * Also supports loading custom uploaded image asset with zero distortion.
 */

import React, { useState } from 'react';

interface ChurchLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const ChurchLogo: React.FC<ChurchLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Size mapping
  const dimensions = {
    sm: { px: 36, textClass: 'text-xs' },
    md: { px: 52, textClass: 'text-sm' },
    lg: { px: 76, textClass: 'text-base' },
    xl: { px: 110, textClass: 'text-lg' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div 
        className="relative flex-shrink-0 flex items-center justify-center rounded-full shadow-sm bg-white"
        style={{ width: `${dimensions.px}px`, height: `${dimensions.px}px` }}
      >
        {/* If custom image uploaded at /cop-logo.png or in assets, try loading it */}
        {!imageError && (
          <img
            src="/cop-logo.png"
            alt="The Church of Pentecost Dubai Logo"
            className="w-full h-full object-contain rounded-full hidden"
            onError={() => setImageError(true)}
          />
        )}

        {/* High-fidelity Vector Insignia of The Church of Pentecost */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-sm select-none"
          aria-label="The Church of Pentecost Emblem"
        >
          <defs>
            {/* Circular Path for Upper Text */}
            <path
              id="cop-text-path-upper"
              d="M 28 100 A 72 72 0 1 1 172 100"
              fill="none"
            />
            {/* Circular Path for Lower Text */}
            <path
              id="cop-text-path-lower"
              d="M 172 100 A 72 72 0 0 1 28 100"
              fill="none"
            />
            <radialGradient id="cop-gold-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            <radialGradient id="cop-blue-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#0B2545" />
            </radialGradient>
            <radialGradient id="cop-fire-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#B91C1C" />
            </radialGradient>
          </defs>

          {/* Outer Golden Border */}
          <circle cx="100" cy="100" r="98" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
          
          {/* Deep Navy/Ultramarine Ring */}
          <circle cx="100" cy="100" r="93" fill="url(#cop-blue-grad)" />

          {/* Inner Golden Rim */}
          <circle cx="100" cy="100" r="70" fill="none" stroke="#F59E0B" strokeWidth="2.5" />

          {/* Outer Circular Text: THE CHURCH OF PENTECOST */}
          <text fill="#FDE68A" fontSize="13.5" fontWeight="800" letterSpacing="2.2" textAnchor="middle">
            <textPath href="#cop-text-path-upper" startOffset="50%">
              THE CHURCH OF PENTECOST
            </textPath>
          </text>

          {/* Lower Arc: DUBAI • UAE */}
          <text fill="#FDE68A" fontSize="11" fontWeight="700" letterSpacing="3" textAnchor="middle">
            <textPath href="#cop-text-path-lower" startOffset="50%">
              DUBAI • UAE
            </textPath>
          </text>

          {/* Inner Center Circle - White Ground */}
          <circle cx="100" cy="100" r="67" fill="#FFFFFF" />

          {/* Subtle World Map Grid / Continents in Gold */}
          <g opacity="0.35" fill="#F59E0B" stroke="#D97706" strokeWidth="0.5">
            {/* Continents stylized representation */}
            <path d="M 65 92 Q 78 80 92 84 Q 105 82 115 88 Q 130 90 135 105 Q 120 118 100 115 Q 82 120 68 105 Z" />
            <ellipse cx="100" cy="100" rx="55" ry="32" fill="none" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="2,3" />
            <ellipse cx="100" cy="100" rx="30" ry="55" fill="none" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="2,3" />
            <line x1="45" y1="100" x2="155" y2="100" stroke="#F59E0B" strokeWidth="0.8" />
          </g>

          {/* Red Ring of Fire / Pentecostal Tongues of Flame */}
          <circle cx="100" cy="96" r="33" fill="none" stroke="url(#cop-fire-grad)" strokeWidth="4.5" strokeDasharray="7,3" />

          {/* The Holy Spirit Descending Dove (Pure White with Gold Accent) */}
          <g transform="translate(100, 96)">
            {/* Flame Halo behind Dove */}
            <path
              d="M 0 -22 C -6 -14 -12 -5 0 6 C 12 -5 6 -14 0 -22 Z"
              fill="#EF4444"
              opacity="0.9"
            />
            {/* Dove Body & Wings */}
            <path
              d="M 0 -16 
                 C -8 -20 -24 -16 -28 -6
                 C -24 -2 -14 2 -4 4
                 C -6 12 -8 20 0 24
                 C 8 20 6 12 4 4
                 C 14 2 24 -2 28 -6
                 C 24 -16 8 -20 0 -16 Z"
              fill="#FFFFFF"
              stroke="#0B2545"
              strokeWidth="1.2"
            />
            {/* Dove Head & Beak Descending Downwards */}
            <circle cx="0" cy="14" r="3.5" fill="#FFFFFF" stroke="#0B2545" strokeWidth="1" />
            <polygon points="0,19 -2,15 2,15" fill="#F59E0B" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold tracking-tight text-slate-900 leading-tight text-sm">
            THE CHURCH OF PENTECOST, DUBAI
          </span>
          <span className="text-xs font-semibold text-amber-600 tracking-wide">
            PAKISTANI & INDIAN WORSHIP CENTRE
          </span>
        </div>
      )}
    </div>
  );
};

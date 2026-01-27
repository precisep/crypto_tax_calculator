import React from 'react';

const Logo = ({ size = 50, className = '' }) => {
  // Calculate width based on aspect ratio (220:60 = 3.67:1)
  const width = size * (400/60);
  
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 220 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="30" cy="30" r="22" fill="#2ECC71" />
      <path
        d="M20 31 L27 38 L41 22"
        stroke="white"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="65"
        y="38"
        fontSize="32"
        fill="#000"
      >
        <tspan fontFamily="Arial, Helvetica, sans-serif" fontWeight="700">Tax</tspan>
        <tspan 
          fontFamily="'Chalkduster', 'Comic Sans MS', 'Marker Felt', 'Segoe Print', cursive" 
          fontWeight="400"
          style={{ letterSpacing: '-0.5px' }}
          dx="-6"
        >Tim</tspan>
      </text>
    </svg>
  );
};

export default Logo;
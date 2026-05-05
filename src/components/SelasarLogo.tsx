import React from 'react';

export const SelasarLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Glow / Base */}
      <rect x="5" y="5" width="90" height="90" rx="20" className="fill-primary" />
      
      {/* Stylized 'S' with a geometric/architectural vibe */}
      <path 
        d="M30 35C30 35 45 25 65 30C75 32 75 45 65 48L35 52C25 55 25 68 35 70C55 75 70 65 70 65" 
        stroke="black" 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
      
      {/* Visual accents - dot for focus/eye */}
      <circle cx="50" cy="50" r="4" fill="black" className="animate-pulse" />
    </svg>
  );
};

import React from 'react';

export const Logo = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 800 300" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="AdaptaTest Logo"
    >
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Icono: Hexágono adaptativo con capas */}
      <g transform="translate(80, 150)">
        {/* Capa externa */}
        <path 
          d="M 0,-60 L 52,-30 L 52,30 L 0,60 L -52,30 L -52,-30 Z" 
          fill="none" 
          stroke="url(#gradient1)" 
          strokeWidth="3"
          opacity="0.3"
        />
        
        {/* Capa media */}
        <path 
          d="M 0,-45 L 39,-22.5 L 39,22.5 L 0,45 L -39,22.5 L -39,-22.5 Z" 
          fill="none" 
          stroke="url(#gradient2)" 
          strokeWidth="3"
          opacity="0.6"
        />
        
        {/* Capa interna sólida */}
        <path 
          d="M 0,-30 L 26,-15 L 26,15 L 0,30 L -26,15 L -26,-15 Z" 
          fill="url(#gradient1)"
        />
        
        {/* Símbolo "A" estilizado en el centro */}
        <path 
          d="M -8,10 L 0,-10 L 8,10 M -5,3 L 5,3" 
          stroke="white" 
          strokeWidth="3" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Puntos de conexión (multitenant) */}
        <circle cx="52" cy="-30" r="4" fill="#06B6D4"/>
        <circle cx="52" cy="30" r="4" fill="#06B6D4"/>
        <circle cx="-52" cy="-30" r="4" fill="#06B6D4"/>
      </g>
      
      {/* Texto: Adapta */}
      <text 
        x="180" 
        y="165" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontSize="68" 
        fontWeight="700" 
        className="fill-gray-800 dark:fill-gray-100"
        letterSpacing="-2"
      >
        Adapta
      </text>
      
      {/* Texto: Test */}
      <text 
        x="435" 
        y="165" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontSize="68" 
        fontWeight="300" 
        fill="#6366F1"
        letterSpacing="-1"
      >
        Test
      </text>
      
      {/* Tagline */}
      <text 
        x="180" 
        y="195" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontSize="18" 
        fontWeight="400" 
        className="fill-gray-400 dark:fill-gray-500"
        letterSpacing="3"
      >
        LEARNING MANAGEMENT SYSTEM
      </text>
      
      {/* Elemento decorativo: línea sutil */}
      <line 
        x1="180" 
        y1="175" 
        x2="320" 
        y2="175" 
        stroke="url(#gradient2)" 
        strokeWidth="2" 
        opacity="0.4"
      />
    </svg>
  );
};
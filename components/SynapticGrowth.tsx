import React from 'react';

interface Props {
  progress: number; // 0 to 100
  active: boolean;
}

const SynapticGrowth: React.FC<Props> = ({ progress, active }) => {
  // Normalize progress 0-1
  const p = Math.min(1, Math.max(0, progress / 100));

  return (
    <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
      {/* Background container */}
      <div className="absolute inset-0 rounded-full bg-neuro-900 border border-neuro-800 shadow-inner"></div>

      {/* Main Core - Grows with progress */}
      <div 
        className={`absolute rounded-full transition-all duration-1000 ease-out flex items-center justify-center ${active ? 'bg-neuro-accent shadow-[0_0_20px_rgba(139,92,246,0.6)]' : 'bg-gray-700'}`}
        style={{ 
          width: `${20 + (p * 60)}%`, 
          height: `${20 + (p * 60)}%`,
          opacity: active ? 0.8 + (p * 0.2) : 0.3
        }}
      >
        <div className="w-1/2 h-1/2 bg-white rounded-full opacity-30 blur-sm"></div>
      </div>

      {/* Synaptic Connections (The "Branches") */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none rotate-45">
        {[0, 1, 2, 3].map((i) => {
          const rotation = i * 90;
          const dashArray = 50; // Total length of line
          const dashOffset = 50 - (p * 50); // Reveal line based on progress
          
          return (
            <g key={i} style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}>
              <line 
                x1="50%" y1="50%" x2="50%" y2="10%" 
                stroke={active ? "#8b5cf6" : "#333"} 
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000"
              />
              <circle 
                cx="50%" cy="10%" r={p > 0.8 ? 3 : 0} 
                fill={active ? "#fff" : "#333"}
                className="transition-all duration-500 delay-300"
              />
            </g>
          );
        })}
      </svg>
      
      {/* Text Overlay if inactive or complete */}
      {p >= 1 && (
         <div className="absolute inset-0 flex items-center justify-center z-10 animate-in zoom-in">
           <span className="text-white font-bold text-xs drop-shadow-md">NÚCLEO ESTÁVEL</span>
         </div>
      )}
    </div>
  );
};

export default SynapticGrowth;
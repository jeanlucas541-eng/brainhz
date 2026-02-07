
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { NeuroCoresByMode, SessionMode } from '../types';

interface Props {
  activeNodes: number;
  nodesByMode?: NeuroCoresByMode;
}

interface Point {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  isActive: boolean;
  mode?: string; // The mode this node belongs to
}

// Color palette for each wave type
const MODE_COLORS: Record<string, { fill: string; glow: string }> = {
  GAMMA: { fill: '#fbbf24', glow: '#fbbf24' },      // Yellow/Gold - Insight
  FOCUS: { fill: '#22d3ee', glow: '#06b6d4' },      // Cyan - Concentration
  STUDY: { fill: '#4ade80', glow: '#22c55e' },      // Green - Learning
  CREATIVITY: { fill: '#f472b6', glow: '#ec4899' }, // Pink - Creative
  SLEEP: { fill: '#a78bfa', glow: '#8b5cf6' },      // Purple - Rest
  RESTORE: { fill: '#2dd4bf', glow: '#14b8a6' },    // Turquoise - Healing
  DEFAULT: { fill: '#ffffff', glow: '#8b5cf6' }     // White fallback
};

const BrainMatrix: React.FC<Props> = ({ activeNodes, nodesByMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fake loading sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Configuration
  const TOTAL_POINTS = 300;
  const ROTATION_SPEED = 0.002;
  const CONNECTION_DISTANCE = 35;

  useEffect(() => {
    if (isLoading) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const points: Point[] = [];

    // Build a list of modes with their counts for coloring
    const modeList: string[] = [];
    if (nodesByMode) {
      (Object.entries(nodesByMode) as [string, number][]).forEach(([mode, count]) => {
        for (let i = 0; i < count; i++) {
          modeList.push(mode);
        }
      });
    }

    // GENERATE BRAIN SHAPE
    for (let i = 0; i < TOTAL_POINTS; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 100 + Math.random() * 10;

      let x = radius * Math.sin(phi) * Math.cos(theta);
      let y = radius * Math.sin(phi) * Math.sin(theta);
      let z = radius * Math.cos(phi);

      y *= 0.8;
      z *= 1.2;
      x += (x > 0 ? 10 : -10);

      // Assign mode based on index if we have colored data
      const isActive = i < activeNodes;
      const mode = isActive && modeList[i] ? modeList[i] : undefined;

      points.push({
        x, y, z,
        baseX: x, baseY: y, baseZ: z,
        isActive,
        mode
      });
    }

    let angleY = 0;
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      angleY += ROTATION_SPEED;

      const sinY = Math.sin(angleY);
      const cosY = Math.cos(angleY);

      const projectedPoints = points.map(p => {
        const rotX = p.baseX * cosY - p.baseZ * sinY;
        const rotZ = p.baseX * sinY + p.baseZ * cosY;

        const perspective = 400;
        const scale = perspective / (perspective + rotZ);

        return {
          x: rotX * scale + centerX,
          y: p.baseY * scale + centerY,
          z: rotZ,
          scale,
          isActive: p.isActive,
          mode: p.mode
        };
      });

      // Draw Connections
      ctx.lineWidth = 1;

      for (let i = 0; i < projectedPoints.length; i++) {
        const p1 = projectedPoints[i];

        if (p1.z < -50) continue;

        for (let j = i + 1; j < projectedPoints.length; j++) {
          const p2 = projectedPoints[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE * (p1.scale + p2.scale) / 2) {
            const bothActive = p1.isActive && p2.isActive;

            if (bothActive) {
              // Use color of first node for the connection
              const color = p1.mode ? MODE_COLORS[p1.mode] : MODE_COLORS.DEFAULT;
              ctx.strokeStyle = `rgba(${hexToRgb(color.glow)}, ${0.4 * p1.scale})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            } else {
              ctx.strokeStyle = `rgba(50, 50, 50, ${0.1 * p1.scale})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw Nodes
      projectedPoints.forEach(p => {
        ctx.beginPath();
        const size = (p.isActive ? 2 : 1) * p.scale;
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);

        if (p.isActive) {
          const color = p.mode ? MODE_COLORS[p.mode] : MODE_COLORS.DEFAULT;
          ctx.fillStyle = color.fill;
          ctx.shadowBlur = 10 * p.scale;
          ctx.shadowColor = color.glow;
        } else {
          ctx.fillStyle = '#333';
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };

  }, [activeNodes, nodesByMode, isLoading]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-neuro-900/50 rounded-lg group">

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-neuro-900 flex flex-col items-center justify-center animate-out fade-out duration-700 fill-mode-forwards">
          <div className="relative mb-4">
            <div className="w-12 h-12 border-2 border-neuro-800 border-t-neuro-accent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <span className="text-xs font-mono text-neuro-accent animate-pulse tracking-widest">CARREGANDO MATRIZ...</span>
          <div className="mt-2 text-[10px] text-gray-600 font-mono">
            [||||||||||||......] 64%
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className={`absolute inset-0 z-10 transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`} />

      {/* Aesthetic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neuro-900 via-transparent to-transparent pointer-events-none z-20"></div>
      <div className={`absolute top-2 left-2 z-20 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-neuro-accent rounded-full animate-pulse"></div>
          <span className="text-[9px] font-mono text-neuro-accent tracking-widest uppercase">Live Simulation</span>
        </div>
      </div>

      {/* Color Legend */}
      {nodesByMode && (
        <div className={`absolute bottom-2 right-2 z-20 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-wrap gap-1 justify-end">
            {(Object.entries(nodesByMode) as [string, number][]).filter(([_, count]) => count > 0).map(([mode, count]) => (
              <div key={mode} className="flex items-center gap-1 bg-neuro-900/80 px-1.5 py-0.5 rounded text-[8px] font-mono">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MODE_COLORS[mode]?.fill || '#fff' }}></div>
                <span className="text-gray-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to convert hex to rgb
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '139, 92, 246'; // fallback neuro-accent
}

export default BrainMatrix;

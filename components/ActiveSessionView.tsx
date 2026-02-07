
import React, { useState, useEffect, useRef } from 'react';
import { SessionMode, SESSION_CONFIGS } from '../types';
import { Play, Pause, X, Volume2, Maximize, Minimize, Plus, Info, Timer, Coffee, SkipForward } from 'lucide-react';
import { useSessionTimer } from '../hooks/useSessionTimer';
import { useGamification } from '../src/contexts/GamificationContext';
import SynapticGrowth from './SynapticGrowth';
import TerminalOutput from './TerminalOutput';
import FrequencyVisualizer from './FrequencyVisualizer';

interface Props {
  mode: SessionMode;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: (completedMode?: SessionMode, durationMinutes?: number) => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  insight?: string;
  initialDuration?: number;
}

type PomodoroPhase = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';

const ActiveSessionView: React.FC<Props> = ({
  mode,
  isPlaying,
  onTogglePlay,
  onStop,
  volume,
  onVolumeChange,
  insight,
  initialDuration
}) => {
  const config = SESSION_CONFIGS[mode];
  const containerRef = useRef<HTMLDivElement>(null);
  const { completeSession } = useGamification();

  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- POMODORO STATE MACHINE ---
  const [pomodoro, setPomodoro] = useState<{
    active: boolean;
    phase: PomodoroPhase;
    cycle: number;
    totalCycles: number;
  }>({
    active: initialDuration === 25, // Activate if started via "Pomodoro Button"
    phase: 'WORK',
    cycle: 1,
    totalCycles: 4
  });

  // Handler for timer completion
  const handleTimerComplete = () => {
    if (!pomodoro.active) {
      // Pass mode and calculated duration for completion modal
      const elapsedMinutes = Math.floor((totalTime - timeLeft) / 60) || Math.floor(totalTime / 60);
      onStop(mode, elapsedMinutes > 0 ? elapsedMinutes : Math.floor(totalTime / 60)); // Standard mode stops with celebration
      return;
    }

    // Pomodoro Logic
    if (pomodoro.phase === 'WORK') {
      // Work finished -> Determine Break
      const isLongBreak = pomodoro.cycle % pomodoro.totalCycles === 0;
      const nextPhase = isLongBreak ? 'LONG_BREAK' : 'SHORT_BREAK';

      setPomodoro(prev => ({ ...prev, phase: nextPhase }));

      // Pause Audio for Break (Neural Reset)
      if (isPlaying) onTogglePlay();

      // Set Timer for Break
      setDuration(isLongBreak ? 15 : 5);

      // Optional: Play a chime here (not implemented in this snippet)

    } else {
      // Break finished -> Back to Work
      setPomodoro(prev => ({
        ...prev,
        phase: 'WORK',
        cycle: prev.cycle < prev.totalCycles ? prev.cycle + 1 : 1 // Loop or increment
      }));

      // Resume Audio for Focus
      if (!isPlaying) onTogglePlay();

      // Set Timer for Work
      setDuration(25);
    }
  };

  const skipPhase = () => {
    handleTimerComplete();
  };

  // Hook handles the countdown logic
  const { timeLeft, totalTime, progress, formatTime, addTime, setDuration } = useSessionTimer(
    isPlaying,
    mode,
    config,
    initialDuration,
    handleTimerComplete,
    completeSession // Pass the context function to sync with Supabase
  );

  // Handle Fullscreen Events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
          // Fallback to document full screen if element fails
          document.documentElement.requestFullscreen();
        });
      } else {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // --- THEME & VISUALS ---
  const getThemeColor = () => {
    if (pomodoro.active && pomodoro.phase !== 'WORK') {
      return '#10b981'; // Green for Break/Rest
    }
    switch (mode) {
      case SessionMode.GAMMA: return '#ef4444';
      case SessionMode.FOCUS: return '#ff8906';
      case SessionMode.STUDY: return '#8b5cf6';
      case SessionMode.CREATIVITY: return '#2cb67d';
      case SessionMode.SLEEP: return '#3b82f6';
      case SessionMode.RESTORE: return '#6366f1';
      default: return '#8b5cf6';
    }
  };

  const themeColor = getThemeColor();

  const getStatusText = () => {
    if (pomodoro.active) {
      if (pomodoro.phase === 'WORK') return 'Sincronização Ativa';
      if (pomodoro.phase === 'SHORT_BREAK') return 'Pausa Neural Curta';
      if (pomodoro.phase === 'LONG_BREAK') return 'Reset Neural Completo';
    }
    return isPlaying ? 'Sincronização Ativa' : 'Pausado';
  };

  const getInstructionText = () => {
    if (!pomodoro.active) return config.waveType;
    if (pomodoro.phase === 'WORK') return 'Mantenha o Foco';
    return 'Respire. Hidrate-se. Relaxe.';
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col animate-in zoom-in-95 duration-700 relative overflow-hidden bg-neuro-900 border-neuro-700 shadow-2xl transition-all ${isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen border-none' : 'h-[calc(100vh-140px)] rounded-2xl border'}`}
    >

      {/* Background Visualizer Layer */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${pomodoro.active && pomodoro.phase !== 'WORK' ? 'opacity-10' : 'opacity-40'}`}>
        <FrequencyVisualizer
          isActive={isPlaying}
          color={themeColor}
          speed={(config.frequencyRange[0] + config.frequencyRange[1]) / 2}
          volume={volume}
          fullScreen={true}
        />
      </div>

      {/* Break Overlay Background */}
      {pomodoro.active && pomodoro.phase !== 'WORK' && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-green-900/20 to-neuro-900 animate-in fade-in duration-1000 pointer-events-none"></div>
      )}

      {/* Vignette Overlay for focus */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.8)_80%)] pointer-events-none"></div>

      {/* Header Controls (Floating) */}
      <div className="absolute top-0 left-0 right-0 z-30 p-6 flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ backgroundColor: themeColor }}></div>
            <h2 className="text-sm font-bold text-gray-300 tracking-widest uppercase opacity-80">{config.label}</h2>
          </div>
          <span className={`text-[10px] font-mono ml-5 transition-colors ${pomodoro.active && pomodoro.phase !== 'WORK' ? 'text-green-400' : 'text-gray-600'}`}>
            {getInstructionText()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(true)}
            title="Informações da Sessão"
            className="p-3 rounded-full bg-transparent text-gray-500 border border-transparent hover:bg-white/5 hover:text-white transition-all"
          >
            <Info size={18} />
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
            className="p-3 rounded-full bg-transparent text-gray-500 hover:bg-white/5 hover:text-white transition-all"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <button
            onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen();
              onStop(); // Manual stop - no celebration
            }}
            title="Encerrar Sessão"
            className="p-3 rounded-full hover:bg-red-500/20 hover:text-red-400 text-gray-500 transition-all ml-2"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Center Stage */}
      <div className="relative flex-1 flex flex-col items-center justify-center z-10">

        {/* Synaptic Core Visualizer (Scaled Up - Center Piece) */}
        {/* We hide this during breaks to reduce stimulation */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none blur-sm scale-150 md:scale-[2] transition-opacity duration-1000 ${pomodoro.active && pomodoro.phase !== 'WORK' ? 'opacity-0' : 'opacity-20'}`}>
          <SynapticGrowth progress={progress} active={isPlaying} />
        </div>

        {/* Break Visual (Coffee/Rest Icon) */}
        {pomodoro.active && pomodoro.phase !== 'WORK' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in duration-700 opacity-20">
            <Coffee size={200} className="text-green-500" />
          </div>
        )}

        {/* POMODORO STATUS BAR */}
        {pomodoro.active && (
          <div className="mb-8 flex flex-col items-center gap-2 animate-in slide-in-from-top-4 fade-in">
            <div className="flex items-center gap-2">
              {[...Array(pomodoro.totalCycles)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${i + 1 < pomodoro.cycle
                    ? 'bg-neuro-accent' // Completed
                    : i + 1 === pomodoro.cycle
                      ? pomodoro.phase === 'WORK' ? 'bg-white animate-pulse' : 'bg-green-500 animate-pulse' // Current
                      : 'bg-neuro-700' // Future
                    }`}
                />
              ))}
            </div>
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Ciclo {pomodoro.cycle}/{pomodoro.totalCycles} • {pomodoro.phase === 'WORK' ? 'Foco' : 'Recuperação'}
            </div>
          </div>
        )}

        {/* The Timer */}
        <div className="relative z-20 flex flex-col items-center">
          <div
            className="text-7xl sm:text-8xl md:text-[10rem] font-mono font-bold text-white tracking-tighter tabular-nums leading-none select-none transition-all duration-500"
            style={{
              textShadow: isPlaying ? `0 0 40px ${themeColor}50` : 'none',
              filter: isPlaying ? 'none' : 'grayscale(100%) opacity(0.5)'
            }}
          >
            {formatTime(timeLeft)}
          </div>

          <div className="mt-8 flex flex-wrap justify-center items-center gap-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
            {/* Standard Controls */}
            {!pomodoro.active && (
              <>
                <button
                  onClick={() => addTime(5)}
                  className="px-4 py-2 rounded-full border border-neuro-700 bg-neuro-800/50 hover:bg-neuro-700 text-xs font-mono text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Plus size={12} /> 5 MIN
                </button>
                <button
                  onClick={() => {
                    setPomodoro(p => ({ ...p, active: true }));
                    setDuration(25);
                  }}
                  className="px-4 py-2 rounded-full border border-neuro-accent/50 bg-neuro-accent/10 hover:bg-neuro-accent/20 text-xs font-mono text-neuro-accent hover:text-white transition-colors flex items-center gap-2"
                >
                  <Timer size={12} /> ATIVAR POMODORO
                </button>
              </>
            )}

            {/* Pomodoro Specific Controls */}
            {pomodoro.active && (
              <div className="flex gap-2">
                <button
                  onClick={skipPhase}
                  className="px-4 py-2 rounded-full border border-neuro-700 bg-neuro-800/80 hover:bg-white hover:text-black text-xs font-mono text-white transition-colors flex items-center gap-2"
                >
                  <SkipForward size={12} /> PULAR FASE
                </button>
                <button
                  onClick={() => setPomodoro(p => ({ ...p, active: false }))}
                  className="px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-mono text-red-400 hover:text-white transition-colors"
                >
                  SAIR DO MODO CICLO
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info/Insight Modal Overlay */}
        {showInfo && insight && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowInfo(false)}>
            <div className="bg-neuro-900 border border-neuro-700 p-1 rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <TerminalOutput title="Insight da IA" text={insight} type="insight" />
              <button
                onClick={() => setShowInfo(false)}
                className="w-full py-3 text-xs text-gray-500 hover:text-white mt-1"
              >
                FECHAR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Minimalist Footer Controls */}
      <div className="relative z-30 p-8 pb-10 flex items-center justify-center">
        <div className={`backdrop-blur-md border border-neuro-700 rounded-full px-8 py-4 flex items-center gap-8 shadow-2xl transition-colors duration-500 ${pomodoro.active && pomodoro.phase !== 'WORK' ? 'bg-green-900/40 border-green-800' : 'bg-neuro-800/80'}`}>

          {/* Volume */}
          <div className="group flex items-center gap-3 w-32">
            <Volume2 size={16} className="text-gray-500 group-hover:text-white transition-colors" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-neuro-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            />
          </div>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg relative overflow-hidden group"
            style={{ backgroundColor: isPlaying ? 'white' : themeColor }}
          >
            {isPlaying ? (
              <Pause size={24} className="text-black fill-black" />
            ) : (
              <Play size={24} className="text-white fill-white ml-1" />
            )}
          </button>

          {/* Status Text */}
          <div className="w-32 text-right">
            <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500 transition-colors">
              {isPlaying ? (
                <span className={`${pomodoro.active && pomodoro.phase !== 'WORK' ? 'text-green-400' : 'text-neuro-success'} animate-pulse`}>
                  {getStatusText()}
                </span>
              ) : (
                <span>Pausado</span>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ActiveSessionView;

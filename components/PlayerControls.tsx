
import React, { useEffect } from 'react';
import { Play, Pause, Keyboard } from 'lucide-react';
import { SessionMode } from '../types';

interface PlayerControlsProps {
  /** Current volume level, normalized between 0 and 1 */
  volume: number;
  /** Callback triggered when volume slider changes */
  onVolumeChange: (volume: number) => void;
  /** Indicates if the audio session is currently active/playing */
  isPlaying: boolean;
  /** Callback to toggle the play/pause state */
  onTogglePlay: () => void;
  /** The currently selected session mode, used to determine if controls should be enabled */
  activeMode: SessionMode;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  volume,
  onVolumeChange,
  isPlaying,
  onTogglePlay,
  activeMode,
}) => {

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Safety Check: Don't trigger if user is typing in an input or textarea (e.g., the Chat)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // 2. Handle Shortcuts
      switch (e.code) {
        case 'Space':
          e.preventDefault(); // Prevent scrolling
          if (activeMode !== SessionMode.IDLE) {
            onTogglePlay();
          }
          break;
        case 'ArrowUp':
        case 'ArrowRight':
          e.preventDefault();
          onVolumeChange(Math.min(1, volume + 0.05)); // Increase by 5%
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          e.preventDefault();
          onVolumeChange(Math.max(0, volume - 0.05)); // Decrease by 5%
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, isPlaying, volume, onTogglePlay, onVolumeChange]);

  return (
    <div className="bg-neuro-800/50 border border-neuro-700 rounded-xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <span className="font-mono text-xs uppercase text-gray-500">Intensidade (Ganho)</span>
        <span className="font-mono text-xs text-neuro-accent">{Math.round(volume * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-neuro-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
        aria-label="Volume Control"
      />

      <button
        disabled={activeMode === SessionMode.IDLE}
        onClick={onTogglePlay}
        className={`w-full py-4 rounded-lg font-bold tracking-widest flex justify-center items-center gap-2 transition-all ${activeMode === SessionMode.IDLE
            ? 'bg-neuro-700 cursor-not-allowed text-gray-500 opacity-50'
            : isPlaying
              ? 'bg-white text-neuro-900 hover:bg-gray-200'
              : 'bg-neuro-accent text-white hover:bg-neuro-accent/90 shadow-lg shadow-neuro-accent/20'
          }`}
        aria-label={isPlaying ? "Pause Session" : "Start Session"}
        title="Atalho: Espaço"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        {isPlaying ? 'PAUSAR SESSÃO' : 'INICIAR SESSÃO'}
      </button>

      {/* Shortcuts Hint */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-gray-600 font-mono pt-2 border-t border-neuro-700/50">
        <Keyboard size={12} />
        <span>Espaço: Play/Pause</span>
        <span className="mx-1">•</span>
        <span>Setas: Volume</span>
      </div>
    </div>
  );
};

export default PlayerControls;

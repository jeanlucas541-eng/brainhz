
import React, { useEffect, useRef, useState } from 'react';
import { Clock, Brain, Activity, Waves, Zap, Play, Sparkles, Timer, Heart, Star, Trash2, Lock, Globe } from 'lucide-react';
import { SESSION_CONFIGS, SessionMode } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import {
  fetchFavorites,
  toggleFavorite,
  fetchCustomProtocols,
  deleteCustomProtocol,
  CustomProtocol
} from '../services/protocolService';
import UpgradeButton from './UpgradeButton';

// Color mapping by mode
const WAVE_COLOR_MAP: Record<SessionMode, { border: string, text: string, bg: string, shadow: string, icon: string }> = {
  [SessionMode.IDLE]: { border: 'border-gray-500', text: 'text-gray-500', bg: 'bg-gray-500/10', shadow: 'shadow-gray-500/20', icon: 'text-gray-500' },
  [SessionMode.GAMMA]: { border: 'border-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-500/10', shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.2)]', icon: 'text-yellow-500' }, // Gold
  [SessionMode.FOCUS]: { border: 'border-cyan-500', text: 'text-cyan-500', bg: 'bg-cyan-500/10', shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]', icon: 'text-cyan-500' }, // Cyan
  [SessionMode.STUDY]: { border: 'border-green-500', text: 'text-green-500', bg: 'bg-green-500/10', shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.2)]', icon: 'text-green-500' }, // Green
  [SessionMode.CREATIVITY]: { border: 'border-pink-500', text: 'text-pink-500', bg: 'bg-pink-500/10', shadow: 'shadow-[0_0_20px_rgba(236,72,153,0.2)]', icon: 'text-pink-500' }, // Pink
  [SessionMode.SLEEP]: { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/10', shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]', icon: 'text-purple-500' }, // Purple
  [SessionMode.RESTORE]: { border: 'border-teal-500', text: 'text-teal-500', bg: 'bg-teal-500/10', shadow: 'shadow-[0_0_20px_rgba(20,184,166,0.2)]', icon: 'text-teal-500' }, // Teal
};

interface SciencePanelProps {
  onPlay: (mode: SessionMode, duration?: number) => void;
  activeGlobalMode: SessionMode;
  isGlobalPlaying: boolean;
  aiPlan?: { mode: SessionMode, explanation: string } | null;
  customProtocols?: CustomProtocol[];
  onRefreshCustomProtocols?: () => void;
  checkModeAllowed: (mode: SessionMode) => boolean;
  onShowUpgrade: () => void;
}

const SciencePanel: React.FC<SciencePanelProps> = ({
  onPlay,
  activeGlobalMode,
  isGlobalPlaying,
  aiPlan,
  customProtocols: externalCustomProtocols,
  onRefreshCustomProtocols,
  checkModeAllowed,
  onShowUpgrade
}) => {
  const { user } = useAuth();
  const protocols = Object.values(SESSION_CONFIGS).filter(c => c.id !== SessionMode.IDLE);

  // Track Pomodoro toggle state for each protocol card locally
  const [pomodoroState, setPomodoroState] = useState<Record<string, boolean>>({});

  // Track custom duration for each protocol
  const [customDurations, setCustomDurations] = useState<Record<string, number>>({});

  // Favorites state
  const [favorites, setFavorites] = useState<SessionMode[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Custom protocols state (internal)
  const [internalCustomProtocols, setInternalCustomProtocols] = useState<CustomProtocol[]>([]);
  const customProtocols = externalCustomProtocols || internalCustomProtocols;

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;
      setLoadingFavorites(true);
      const favs = await fetchFavorites(user.id);
      setFavorites(favs);
      setLoadingFavorites(false);
    };
    loadFavorites();
  }, [user]);

  // Load custom protocols on mount
  useEffect(() => {
    const loadCustomProtocols = async () => {
      if (!user || externalCustomProtocols) return;
      const protocols = await fetchCustomProtocols(user.id);
      setInternalCustomProtocols(protocols);
    };
    loadCustomProtocols();
  }, [user, externalCustomProtocols]);

  const handleToggleFavorite = async (mode: SessionMode) => {
    if (!user) return;
    const isFav = favorites.includes(mode);
    const success = await toggleFavorite(user.id, mode, isFav);
    if (success) {
      if (isFav) {
        setFavorites(prev => prev.filter(m => m !== mode));
      } else {
        setFavorites(prev => [...prev, mode]);
      }
    }
  };

  const handleDeleteCustomProtocol = async (protocolId: string) => {
    const success = await deleteCustomProtocol(protocolId);
    if (success) {
      setInternalCustomProtocols(prev => prev.filter(p => p.id !== protocolId));
      if (onRefreshCustomProtocols) onRefreshCustomProtocols();
    }
  };

  const togglePomodoro = (id: string) => {
    setPomodoroState(prev => ({ ...prev, [id]: !prev[id] }));
    // Clear custom duration if enabling pomodoro
    if (!pomodoroState[id]) {
      setCustomDurations(prev => ({ ...prev, [id]: 0 }));
    }
  };

  const handleCustomDurationChange = (id: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setCustomDurations(prev => ({ ...prev, [id]: numValue }));
    // Disable pomodoro if setting custom duration
    if (numValue > 0) {
      setPomodoroState(prev => ({ ...prev, [id]: false }));
    }
  };

  // Auto-scroll to recommended plan if it changes
  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (aiPlan && topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiPlan]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12" ref={topRef}>

      {/* AI Personalized Plan Banner */}
      {aiPlan && (
        <div className="bg-gradient-to-r from-neuro-900 to-neuro-800 border border-neuro-accent rounded-xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(139,92,246,0.2)]">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles size={100} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1.5 bg-neuro-accent rounded-lg">
                <Sparkles className="text-white w-4 h-4" />
              </div>
              <h2 className="font-bold text-white tracking-tight">Plano Personalizado Gerado por IA</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
                {aiPlan.explanation}
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-neuro-accent bg-neuro-accent/10 px-3 py-1.5 rounded-full border border-neuro-accent/20">
                <Activity size={12} />
                Protocolo Selecionado: {aiPlan.mode}
              </div>
              <div>
                <button
                  onClick={() => onPlay(aiPlan.mode)}
                  className="mt-2 px-6 py-2 bg-neuro-accent hover:bg-neuro-accent/90 text-white text-sm font-bold rounded-lg shadow-lg shadow-neuro-accent/20 flex items-center gap-2 transition-all transform hover:scale-105"
                >
                  <Play size={16} fill="white" /> INICIAR SESSÃO RECOMENDADA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intro Section - Expanded Mechanism */}
      <div className="bg-neuro-800/50 border border-neuro-700 rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-neuro-900 rounded-lg border border-neuro-700">
            <Brain className="text-neuro-accent w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Catálogo de Protocolos</h2>
            <span className="text-xs font-mono text-gray-500 uppercase">Selecione uma frequência para iniciar a imersão.</span>
          </div>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed text-justify border-l-2 border-neuro-accent pl-4">
          Cada protocolo abaixo é uma "receita" psicoacústica completa. Ao clicar em iniciar, você será levado para a <strong>Câmara de Imersão (Dashboard)</strong>, onde terá acesso ao cronômetro de foco, visualizador de crescimento sináptico e controles de áudio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neuro-900/60 rounded-lg p-5 border border-neuro-700/50 hover:border-neuro-success/30 transition-colors">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Waves size={16} className="text-neuro-success" />
              Batidas Binaurais
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Requer fones de ouvido para integrar as frequências distintas de cada ouvido no tronco cerebral.
            </p>
          </div>

          <div className="bg-neuro-900/60 rounded-lg p-5 border border-neuro-700/50 hover:border-neuro-warning/30 transition-colors">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Zap size={16} className="text-neuro-warning" />
              Tons Isocrônicos
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Pulsos rápidos que estimulam o Tálamo. Funcionam bem em caixas de som ou fones.
            </p>
          </div>
        </div>
      </div>

      {/* Protocol Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {protocols.map((config) => {
          const isRecommended = aiPlan?.mode === config.id;
          const isActive = activeGlobalMode === config.id && isGlobalPlaying;
          const isPomodoroActive = !!pomodoroState[config.id];
          const customDuration = customDurations[config.id] || 0;
          const hasCustomDuration = customDuration > 0;
          const isFavorite = favorites.includes(config.id);
          const isAllowed = checkModeAllowed(config.id);

          const colors = WAVE_COLOR_MAP[config.id] || WAVE_COLOR_MAP[SessionMode.IDLE];

          return (
            <div
              key={config.id}
              className={`bg-neuro-900 border rounded-xl overflow-hidden transition-all duration-300 group hover:border-neuro-500 flex flex-col ${isRecommended
                ? `border-neuro-accent ring-2 ring-neuro-accent/50 ${colors.shadow}`
                : isFavorite
                  ? `border-pink-500/50 ${colors.shadow}`
                  : 'border-neuro-700'
                } ${!isAllowed ? 'opacity-80' : ''}`}
            >

              {/* Header with Dynamic Colors */}
              <div className={`px-6 py-4 border-b flex justify-between items-center transition-colors ${isActive ? colors.bg : 'bg-neuro-800'} ${isActive ? colors.border : 'border-neuro-700'}`}>
                <div>
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${isActive ? 'text-white' : 'text-gray-200'}`}>
                    {config.label}
                    {isRecommended && <Sparkles size={16} className="text-neuro-accent animate-pulse" />}
                    {isFavorite && <Heart size={14} className="text-pink-500 fill-pink-500" />}
                    {!isAllowed && <Lock size={14} className="text-gray-400" />}
                  </h3>
                  <span className={`text-xs font-mono uppercase ${colors.text}`}>{config.waveType}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Favorite Button */}
                  {isAllowed && (
                    <button
                      onClick={() => handleToggleFavorite(config.id)}
                      className={`p-2 rounded-lg border transition-all ${isFavorite
                        ? 'bg-pink-500/20 border-pink-500/50 text-pink-500'
                        : 'bg-neuro-900 border-neuro-700 text-gray-500 hover:text-pink-400 hover:border-pink-500/30'
                        }`}
                      title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                      <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                    </button>
                  )}
                  {/* Frequency Tag */}
                  <div className={`p-2 rounded-lg border text-xs font-mono ${colors.bg} ${colors.border} ${colors.text}`}>
                    {config.frequencyRange[0]}-{config.frequencyRange[1]} Hz
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">

                {/* Science Description */}
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${colors.text}`}>
                    <Activity size={14} /> Neurociência
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-neuro-700 pl-3">
                    {config.science}
                  </p>
                </div>

                {/* CUSTOM DURATION INPUT */}
                <div className="flex items-center justify-between gap-3 bg-neuro-800/30 rounded-lg px-4 py-3 border border-neuro-700/50">
                  <div className="flex items-center gap-2">
                    <Timer size={14} className="text-gray-500" />
                    <span className="text-[10px] font-mono text-gray-500 uppercase">Duração Personalizada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      placeholder="--"
                      value={customDuration || ''}
                      onChange={(e) => handleCustomDurationChange(config.id, e.target.value)}
                      className={`w-16 px-2 py-1 text-sm font-mono text-center bg-neuro-900 border border-neuro-700 rounded-lg text-white focus:border-neuro-accent focus:outline-none focus:ring-1 focus:${colors.text}`}
                    />
                    <span className="text-xs text-gray-500">min</span>
                  </div>
                </div>

                {/* POMODORO TOGGLE */}
                <div className="flex items-center justify-end gap-3 cursor-pointer" onClick={() => togglePomodoro(config.id)}>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wide transition-colors ${isPomodoroActive ? 'text-white' : 'text-gray-500'}`}>
                    Modo Pomodoro (25m)
                  </span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isPomodoroActive ? colors.bg.replace('/10', '') : 'bg-neuro-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isPomodoroActive ? 'left-6' : 'left-1'}`}></div>
                  </div>
                </div>

                <div className="bg-neuro-800/30 rounded-lg p-4 flex items-center justify-between border border-neuro-700/50">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className={hasCustomDuration ? "text-green-400" : isPomodoroActive ? colors.text : "text-neuro-warning"} />
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold">
                        {hasCustomDuration ? 'Duração Customizada' : isPomodoroActive ? 'Sessão Definida' : 'Sessão Sugerida'}
                      </div>
                      <div className={`text-sm font-mono ${hasCustomDuration || isPomodoroActive ? 'text-white font-bold' : 'text-gray-200'}`}>
                        {hasCustomDuration ? `${customDuration} min` : isPomodoroActive ? '25 min' : config.recommendedDuration}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onPlay(config.id, hasCustomDuration ? customDuration : isPomodoroActive ? 25 : undefined)}
                    className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg ${isActive
                      ? `bg-green-500 text-white animate-pulse`
                      : isRecommended
                        ? 'bg-neuro-accent hover:bg-neuro-accent/90 text-white'
                        : 'bg-neuro-800 hover:bg-white hover:text-black text-white border border-neuro-700'
                      }`}
                  >
                    {isActive ? (
                      <>EM ANDAMENTO <Waves size={16} /></>
                    ) : (
                      <>
                        {isPomodoroActive ? <Timer size={16} /> : <Play size={16} />}
                        {isPomodoroActive ? 'INICIAR POMODORO' : 'ABRIR SESSÃO'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Protocols Section (AI-Generated) */}
      {customProtocols.length > 0 && (
        <div className="bg-neuro-800/50 border border-neuro-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neuro-900 rounded-lg border border-neuro-accent/50">
              <Star className="text-neuro-accent w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Protocolos Globais & Personalizados</h2>
              <span className="text-xs font-mono text-gray-500 uppercase">Criados pela Comunidade & IA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customProtocols.map((protocol) => {
              // Determine colors based on baseMode
              const colors = WAVE_COLOR_MAP[protocol.baseMode] || WAVE_COLOR_MAP[SessionMode.IDLE];

              return (
                <div
                  key={protocol.id}
                  className={`bg-neuro-900 border rounded-lg p-4 hover:border-neuro-accent/50 transition-all ${protocol.isPublic ? 'border-l-4 border-l-neuro-accent' : 'border-neuro-700'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        {protocol.name}
                        {protocol.isPublic && <Globe size={12} className="text-neuro-accent" title="Protocolo Público" />}
                      </h4>
                      <span className={`text-xs font-mono ${colors.text}`}>{protocol.baseMode}</span>
                    </div>
                    {user?.id === protocol.userId && (
                      <button
                        onClick={() => handleDeleteCustomProtocol(protocol.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Excluir protocolo"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Waves size={12} className={colors.text} />
                      <span>{protocol.frequencyHz} Hz</span>
                      <span className="text-gray-600">|</span>
                      <Clock size={12} className={colors.text} />
                      <span>{protocol.durationMinutes} min</span>
                      <span className="text-gray-600">|</span>
                      <span className="capitalize">{protocol.noiseColor}</span>
                    </div>
                    {protocol.description && (
                      <p className="text-xs text-gray-500">{protocol.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onPlay(protocol.baseMode, protocol.durationMinutes)}
                    className={`w-full py-2 border text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${colors.bg} ${colors.border} ${colors.text} hover:bg-white hover:text-black`}
                  >
                    <Play size={14} fill="currentColor" />
                    INICIAR PROTOCOLO
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer References */}
      <div className="text-[10px] text-gray-600 font-mono text-center pt-8 border-t border-neuro-800">
        Baseado em pesquisas de: Thompson (Neurofeedback), Hutchison (Megabrain) e Protocolos de Biofeedback Clinico.
      </div>
    </div>
  );
};

export default SciencePanel;

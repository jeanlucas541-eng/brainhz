
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Moon, Brain, Info, Flame, Lightbulb, HeartPulse, LayoutDashboard, BookOpen, Bot, User, Trophy, Headphones, Lock } from 'lucide-react';
import { SessionMode, SESSION_CONFIGS, UserStats } from './types';
import { generateSessionInsight, constructPromptFromTemplate } from './services/geminiService';
import { useAudioEngine } from './hooks/useAudioEngine';
import { usePlan } from './hooks/usePlan';
import { useGamification } from './src/contexts/GamificationContext';
import { useAuth } from './src/contexts/AuthContext';
import FrequencyVisualizer from './components/FrequencyVisualizer';
import TerminalOutput from './components/TerminalOutput';
import SciencePanel from './components/SciencePanel';
import PlayerControls from './components/PlayerControls';
import SpecialistChat from './components/SpecialistChat';
import ProfileView from './components/ProfileView';
import ActiveSessionView from './components/ActiveSessionView';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import PreSessionChecklist from './components/PreSessionChecklist';
import AdminPanel from './components/AdminPanel';
import SessionCompleteModal from './components/SessionCompleteModal';
import UsernameModal from './components/UsernameModal';
import UpgradeModal from './components/UpgradeModal';
import UpgradeButton from './components/UpgradeButton';

type ViewState = 'LANDING' | 'AUTH' | 'APP' | 'ADMIN';

const App: React.FC = () => {
  // Navigation State
  const [viewState, setViewState] = useState<ViewState>('LANDING');

  const [activeMode, setActiveMode] = useState<SessionMode>(SessionMode.IDLE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [insight, setInsight] = useState<string>("");
  const [promptDisplay, setPromptDisplay] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'science' | 'chat' | 'profile'>('dashboard');

  // Pending Session State (for Checklist)
  const [pendingSession, setPendingSession] = useState<{ mode: SessionMode; duration?: number } | null>(null);

  // Custom Timer Duration (for Pomodoro overrides)
  const [customDuration, setCustomDuration] = useState<number | undefined>(undefined);

  // AI Plan State
  const [aiPlan, setAiPlan] = useState<{ mode: SessionMode; explanation: string } | null>(null);

  // Session Complete Modal State
  const [completedSession, setCompletedSession] = useState<{
    mode: SessionMode;
    durationMinutes: number;
    xpEarned: number;
  } | null>(null);

  // Gamification State (Context)
  const { stats: userStats, addTime } = useGamification();

  // Auth State (for username modal)
  const { user, needsUsername, setUsernameComplete } = useAuth();

  // Subscription Plan State
  const { plan, limits, isPro, checkModeAllowed } = usePlan();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Ref for the internal scroll list in Dashboard
  const dashboardListRef = useRef<HTMLDivElement>(null);

  const config = SESSION_CONFIGS[activeMode];

  // Audio Engine Hook (Always active regardless of view, but logic handles play state)
  const { initializeAudio } = useAudioEngine(activeMode, config, isPlaying, volume);



  // Gamification Loop: Add XP/Minutes while playing
  useEffect(() => {
    let interval: number;
    if (isPlaying && activeMode !== SessionMode.IDLE) {
      interval = window.setInterval(() => {
        // Increment playtime every minute
        addTime(1);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeMode]);

  // Auto-scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const handleModeSelect = async (mode: SessionMode) => {
    if (mode === activeMode) {
      // If clicking already active mode, just ensure we are in dashboard
      setCurrentView('dashboard');
      return;
    }

    // Switch Mode Logic wrapped in triggerChecklist
    // Check if mode is allowed by plan
    if (!checkModeAllowed(mode)) {
      setShowUpgradeModal(true);
      return;
    }
    triggerChecklist(mode);
  };

  // Handler for AI Recommendation via SpecialistChat
  const handleProtocolRecommendation = (mode: SessionMode, explanation: string) => {
    // Check if mode is allowed before setting plan
    if (!checkModeAllowed(mode)) {
      setShowUpgradeModal(true);
      return;
    }
    setAiPlan({ mode, explanation });
    // Switch to Science view so user can see details, but don't auto-start checklist yet
    // Or we could auto-start checklist if desired. Let's send them to Science panel to confirm.
    setCurrentView('science');
  };

  const handleStopSession = (completedMode?: SessionMode, duration?: number) => {
    // Show completion modal if session ended naturally with valid data
    if (completedMode && completedMode !== SessionMode.IDLE && duration && duration > 0) {
      const minutes = Math.floor(duration);
      // Calculate XP: 10 XP per minute, minimum 10 XP
      const xp = Math.max(10, minutes * 10);

      setCompletedSession({
        mode: completedMode,
        durationMinutes: minutes,
        xpEarned: xp
      });
    }
    setIsPlaying(false);
    setActiveMode(SessionMode.IDLE);
    setCustomDuration(undefined);
  };

  // Trigger the Checklist Modal (respecting plan limits)
  const triggerChecklist = (mode: SessionMode, duration?: number) => {
    // Check if mode is allowed by plan
    if (!checkModeAllowed(mode)) {
      setShowUpgradeModal(true);
      return;
    }

    // Enforce max duration for free plan
    let adjustedDuration = duration;
    if (!isPro && duration && duration > limits.maxSessionMinutes) {
      adjustedDuration = limits.maxSessionMinutes;
    }

    // Disable Pomodoro for free users (Pomodoro typically sets 25-min duration)
    if (!isPro && !limits.canUsePomodoro && duration && duration >= 25) {
      adjustedDuration = limits.maxSessionMinutes;
    }

    setPendingSession({ mode, duration: adjustedDuration });
  };

  // Called when User Confirms the Checklist
  const startConfirmedSession = async () => {
    if (!pendingSession) return;

    // Mobile Autoplay Fix: Resume AudioContext immediately on user interaction
    await initializeAudio();

    const { mode, duration } = pendingSession;

    // 1. Set State
    setActiveMode(mode);
    setCustomDuration(duration);
    setPendingSession(null); // Close modal

    // 2. Prepare Data
    setInsight("");
    const newConfig = SESSION_CONFIGS[mode];
    const rawPrompt = constructPromptFromTemplate(newConfig);
    setPromptDisplay(rawPrompt);

    // 3. Switch View
    setCurrentView('dashboard');

    // 4. Play
    setTimeout(() => setIsPlaying(true), 100);

    // 5. Fetch Insight
    if (mode !== SessionMode.IDLE) {
      setLoadingInsight(true);
      try {
        const aiResponse = await generateSessionInsight(newConfig);
        setInsight(aiResponse);
      } catch (e) {
        setInsight("Sincronização iniciada.");
      } finally {
        setLoadingInsight(false);
      }
    } else {
      setPromptDisplay("");
    }
  };

  // Handle Logo Click: Reset View and Scroll to Top (Global + Internal)
  const handleLogoClick = () => {
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePlay = async () => {
    if (activeMode === SessionMode.IDLE) return;

    // Mobile Autoplay Fix
    if (!isPlaying) {
      await initializeAudio();
    }

    setIsPlaying(!isPlaying);
  };

  const MODES_UI = [
    { mode: SessionMode.GAMMA, icon: Flame, colorClass: 'text-red-500', borderClass: 'border-red-500/50', shadowClass: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]' },
    { mode: SessionMode.FOCUS, icon: Zap, colorClass: 'text-neuro-warning', borderClass: 'border-neuro-warning', shadowClass: 'shadow-[0_0_15px_rgba(255,137,6,0.2)]' },
    { mode: SessionMode.STUDY, icon: Activity, colorClass: 'text-neuro-accent', borderClass: 'border-neuro-accent', shadowClass: 'shadow-[0_0_15px_rgba(139,92,246,0.2)]' },
    { mode: SessionMode.CREATIVITY, icon: Lightbulb, colorClass: 'text-green-400', borderClass: 'border-green-400/50', shadowClass: 'shadow-[0_0_15px_rgba(74,222,128,0.2)]' },
    { mode: SessionMode.SLEEP, icon: Moon, colorClass: 'text-blue-400', borderClass: 'border-blue-400/50', shadowClass: 'shadow-[0_0_15px_rgba(96,165,250,0.2)]' },
    { mode: SessionMode.RESTORE, icon: HeartPulse, colorClass: 'text-indigo-400', borderClass: 'border-indigo-400/50', shadowClass: 'shadow-[0_0_15px_rgba(129,140,248,0.2)]' },
  ];

  // --- RENDER LOGIC ---

  if (viewState === 'ADMIN') {
    return <AdminPanel onExit={() => setViewState('LANDING')} />;
  }

  if (viewState === 'LANDING') {
    return (
      <LandingPage
        onEnter={() => setViewState('AUTH')}
        onAdminEnter={() => setViewState('ADMIN')}
      />
    );
  }

  if (viewState === 'AUTH') {
    return (
      <AuthScreen
        onSuccess={() => setViewState('APP')}
        onBack={() => setViewState('LANDING')}
        onAdminLogin={() => setViewState('ADMIN')}
      />
    );
  }

  // --- MAIN APP DASHBOARD ---

  return (
    <div className="min-h-screen bg-neuro-900 text-gray-200 flex flex-col items-center p-4 md:p-8 font-sans selection:bg-neuro-accent selection:text-white relative">

      {/* USERNAME SELECTION MODAL */}
      {needsUsername && user && (
        <UsernameModal
          userId={user.id}
          onComplete={setUsernameComplete}
        />
      )}

      {/* UPGRADE MODAL */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={(plan) => {
          // TODO: Integrate with payment system
          setShowUpgradeModal(false);
          const planName = plan === 'monthly' ? 'Mensal (R$ 19,90)' : 'Vitalício (R$ 199,00)';
          alert(`Iniciando checkout do plano ${planName}...`);
        }}
      />

      {/* CHECKLIST OVERLAY */}
      {pendingSession && (
        <PreSessionChecklist
          mode={pendingSession.mode}
          onConfirm={startConfirmedSession}
          onCancel={() => setPendingSession(null)}
        />
      )}

      {/* SESSION COMPLETE MODAL */}
      <SessionCompleteModal
        isOpen={completedSession !== null}
        mode={completedSession?.mode || SessionMode.IDLE}
        durationMinutes={completedSession?.durationMinutes || 0}
        xpEarned={completedSession?.xpEarned || 0}
        totalNeuroCores={userStats.neuroCores || 0}
        streak={userStats.streak || 0}
        onClose={() => setCompletedSession(null)}
        onNewSession={() => {
          setCompletedSession(null);
          setCurrentView('dashboard');
        }}
        onViewProgress={() => {
          setCompletedSession(null);
          setCurrentView('profile');
        }}
      />

      {/* Header */}
      <header className="w-full max-w-5xl mb-8 px-4 md:px-0">
        <div className="flex justify-between items-center mb-6 border-b border-neuro-700 pb-4">

          {/* BRAINHZ LOGO */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={handleLogoClick}>
            <div className="relative flex items-center justify-center w-12 h-12">
              <img src="/LOGO.jpeg" alt="Logo" className="w-full h-full object-contain rounded-lg shadow-lg" />
            </div>

            <div className="flex flex-col">
              <h1 className="text-2xl font-mono font-bold tracking-tighter text-white leading-none">
                Brain<span className="text-neuro-accent">Hz</span>
              </h1>
              <span className="text-[10px] tracking-[0.2em] text-gray-500 font-sans font-semibold group-hover:text-neuro-accent transition-colors">
                NEURAL FREQUENCY
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Upgrade Button (for free users only) */}
            {!isPro && (
              <UpgradeButton onClick={() => setShowUpgradeModal(true)} variant="header" />
            )}

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-neuro-800 rounded-full border border-neuro-700">
              <Flame size={12} className={userStats.streak > 0 ? "text-neuro-warning fill-neuro-warning animate-pulse" : "text-gray-600"} />
              <span className="text-xs font-mono font-bold text-white">{userStats.streak}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-neuro-800/50 px-3 py-1.5 rounded-full border border-neuro-800">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-neuro-accent animate-pulse' : 'bg-gray-600'}`}></div>
              {isPlaying ? 'ATIVO' : 'EM ESPERA'}
            </div>

            <button
              onClick={() => {
                setIsPlaying(false);
                setViewState('LANDING');
              }}
              className="text-xs text-gray-500 hover:text-white underline font-mono"
            >
              Sair
            </button>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-mono text-sm transition-colors whitespace-nowrap ${currentView === 'dashboard'
              ? 'bg-neuro-800 text-white border-t border-x border-neuro-700 shadow-[0_-4px_10px_rgba(0,0,0,0.2)]'
              : 'text-gray-500 hover:text-gray-300 hover:bg-neuro-800/30'
              }`}
          >
            <LayoutDashboard size={16} /> Painel
          </button>
          <button
            onClick={() => setCurrentView('science')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-mono text-sm transition-colors whitespace-nowrap ${currentView === 'science'
              ? 'bg-neuro-800 text-white border-t border-x border-neuro-700 shadow-[0_-4px_10px_rgba(0,0,0,0.2)]'
              : 'text-gray-500 hover:text-gray-300 hover:bg-neuro-800/30'
              }`}
          >
            <BookOpen size={16} /> Protocolos
          </button>
          <button
            onClick={() => {
              if (limits.canUseAI) {
                setCurrentView('chat');
              } else {
                setShowUpgradeModal(true);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-mono text-sm transition-colors whitespace-nowrap ${currentView === 'chat'
              ? 'bg-neuro-800 text-white border-t border-x border-neuro-700 shadow-[0_-4px_10px_rgba(0,0,0,0.2)]'
              : 'text-gray-500 hover:text-gray-300 hover:bg-neuro-800/30'
              }`}
          >
            <Bot size={16} />
            <span className="flex items-center gap-1">
              Especialista
              {!limits.canUseAI && <Lock size={10} className="text-gray-500" />}
            </span>
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-mono text-sm transition-colors whitespace-nowrap ${currentView === 'profile'
              ? 'bg-neuro-800 text-white border-t border-x border-neuro-700 shadow-[0_-4px_10px_rgba(0,0,0,0.2)]'
              : 'text-gray-500 hover:text-gray-300 hover:bg-neuro-800/30'
              }`}
          >
            <Trophy size={16} className={userStats.streak > 0 ? "text-yellow-500" : ""} /> Progresso
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl px-4 md:px-0">

        {/* DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* CONDITION: If a Mode is Active, Show Full Screen View. Else, Show List. */}
            {activeMode !== SessionMode.IDLE ? (
              <ActiveSessionView
                mode={activeMode}
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onStop={handleStopSession}
                volume={volume}
                onVolumeChange={setVolume}
                insight={insight}
                initialDuration={customDuration}
              />
            ) : (
              // IDLE STATE DASHBOARD (List + Mini Visualizer)
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: List */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-2">Selecionar Protocolo</h2>
                    <div
                      ref={dashboardListRef}
                      className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
                    >
                      {MODES_UI.map(({ mode, icon: Icon, colorClass, borderClass, shadowClass }) => {
                        return (
                          <button
                            key={mode}
                            onClick={() => handleModeSelect(mode)}
                            className={`w-full p-4 rounded-lg border transition-all duration-300 flex items-center gap-4 group text-left bg-transparent border-neuro-700 hover:border-neuro-500 hover:bg-neuro-800/50 hover:translate-x-1`}
                          >
                            <div className="p-2 rounded-md bg-neuro-900 border border-neuro-800 group-hover:border-neuro-600 transition-colors">
                              <Icon className={`w-5 h-5 ${colorClass}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm text-white">{SESSION_CONFIGS[mode].label}</div>
                              <div className="text-xs text-gray-500 font-mono leading-relaxed">{SESSION_CONFIGS[mode].description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Visualization & Welcome */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Visualizer (Mini Mode) */}
                  <div className="relative group">
                    <div className="relative">
                      <FrequencyVisualizer
                        isActive={false}
                        color="#555"
                        speed={10}
                        volume={0}
                        fullScreen={false}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-lg border border-neuro-700/50">
                        <Activity className="text-neuro-700 mb-2" size={48} />
                        <p className="text-gray-500 font-mono text-sm">Selecione um protocolo para iniciar</p>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Display */}
                  <TerminalOutput
                    title="Status do Sistema"
                    text="Aguardando input do usuário. Selecione um modo de arrastamento neural à esquerda para iniciar a calibração de frequência."
                    type="prompt"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCIENCE VIEW */}
        {currentView === 'science' && (
          <SciencePanel
            onPlay={(mode, duration) => triggerChecklist(mode, duration)}
            activeGlobalMode={activeMode}
            isGlobalPlaying={isPlaying}
            aiPlan={aiPlan}
            checkModeAllowed={(mode) => checkModeAllowed(mode.toString())}
            onShowUpgrade={() => setShowUpgradeModal(true)}
          />
        )}

        {/* AI SPECIALIST CHAT */}
        {currentView === 'chat' && (
          <SpecialistChat onRecommend={handleProtocolRecommendation} />
        )}

        {/* PROFILE/GAMIFICATION VIEW */}
        {currentView === 'profile' && (
          <ProfileView stats={userStats} />
        )}

        {/* Footer Info (Common) */}
        {currentView === 'dashboard' && activeMode === SessionMode.IDLE && (
          <div className="mt-8 pt-6 border-t border-neuro-700 flex items-start gap-4 text-xs text-gray-500 leading-relaxed">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-neuro-accent" />
            <p>
              <strong className="text-gray-400">Nota Técnica:</strong> A Plataforma BrainHz utiliza Web Audio API para síntese binaural e isocrônica em tempo real. Fones de ouvido são recomendados para eficácia binaural máxima.
            </p>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;

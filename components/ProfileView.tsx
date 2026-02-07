
import React from 'react';
import { UserStats, LEVEL_THRESHOLDS, RANKS, SessionMode } from '../types';
import { Trophy, Flame, Clock, Zap, Target, Award, Box, Share2, Network, Infinity, Moon, Sun, Hourglass } from 'lucide-react';
import SessionHistory from './SessionHistory';
import BrainMatrix from './BrainMatrix';
import Leaderboard from './Leaderboard';

interface Props {
  stats: UserStats;
}

// Configuration for Achievements
const ACHIEVEMENTS_CONFIG = [
  // --- EASY ACHIEVEMENTS ---
  {
    id: 'first_streak',
    title: 'Primeiro Dia',
    desc: 'Complete sua primeira sessão e inicie sua jornada.',
    icon: Flame,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/20',
    condition: (s: UserStats) => s.streak >= 1
  },
  {
    id: 'first_core',
    title: 'Primeira Sinapse',
    desc: 'Complete sua primeira sessão completa.',
    icon: Share2,
    color: 'text-neuro-accent',
    bgColor: 'bg-neuro-accent/20',
    condition: (s: UserStats) => s.neuroCores >= 1
  },
  // --- STREAK ACHIEVEMENTS ---
  {
    id: 'streak_3',
    title: 'Iniciação Neural',
    desc: 'Mantenha um streak de 3 dias seguidos.',
    icon: Flame,
    color: 'text-neuro-warning',
    bgColor: 'bg-neuro-warning/20',
    condition: (s: UserStats) => s.streak >= 3
  },
  {
    id: 'streak_7',
    title: 'Dedicação Absoluta',
    desc: 'Mantenha um streak de 7 dias seguidos.',
    icon: Flame,
    color: 'text-red-500',
    bgColor: 'bg-red-500/20',
    condition: (s: UserStats) => s.streak >= 7
  },
  {
    id: 'streak_30',
    title: 'Mestre da Consistência',
    desc: 'Mantenha um streak de 30 dias seguidos.',
    icon: Flame,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    condition: (s: UserStats) => s.streak >= 30
  },
  // --- SESSION COUNT ACHIEVEMENTS ---
  {
    id: 'sessions_5',
    title: 'Explorador Neural',
    desc: 'Complete 5 sessões de treino.',
    icon: Share2,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/20',
    condition: (s: UserStats) => s.neuroCores >= 5
  },
  {
    id: 'sessions_10',
    title: 'Veterano Cerebral',
    desc: 'Complete 10 sessões de treino.',
    icon: Share2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    condition: (s: UserStats) => s.neuroCores >= 10
  },
  {
    id: 'sessions_25',
    title: 'Sinapse de Prata',
    desc: 'Complete 25 sessões de treino.',
    icon: Award,
    color: 'text-gray-300',
    bgColor: 'bg-gray-300/20',
    condition: (s: UserStats) => s.neuroCores >= 25
  },
  {
    id: 'sessions_50',
    title: 'Sinapse de Ouro',
    desc: 'Complete 50 sessões de treino.',
    icon: Award,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    condition: (s: UserStats) => s.neuroCores >= 50
  },
  // --- LEVEL ACHIEVEMENTS ---
  {
    id: 'level_5',
    title: 'Arquiteto Mental',
    desc: 'Alcance o Nível 5 de proficiência.',
    icon: Trophy,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    condition: (s: UserStats) => s.level >= 5
  },
  {
    id: 'level_10',
    title: 'Entidade Ascendente',
    desc: 'Alcance o Nível 10 de proficiência.',
    icon: Trophy,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    condition: (s: UserStats) => s.level >= 10
  },
  // --- MODE-SPECIFIC ACHIEVEMENTS ---
  {
    id: 'deep_focus',
    title: 'Hiperfoco',
    desc: 'Acumule 60 minutos em modo FOCUS.',
    icon: Zap,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/20',
    condition: (s: UserStats) => {
      const focusMins = s.history.filter(h => h.mode === SessionMode.FOCUS).reduce((acc, curr) => acc + curr.durationMinutes, 0);
      return focusMins >= 60;
    }
  },
  {
    id: 'night_owl',
    title: 'Guardião do Sono',
    desc: 'Complete 3 sessões de SLEEP ou RESTORE.',
    icon: Moon,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    condition: (s: UserStats) => {
      const count = s.history.filter(h => h.mode === SessionMode.SLEEP || h.mode === SessionMode.RESTORE).length;
      return count >= 3;
    }
  },
  {
    id: 'gamma_master',
    title: 'Mente Gama',
    desc: 'Complete 5 sessões no modo GAMMA.',
    icon: Zap,
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    condition: (s: UserStats) => {
      const count = s.history.filter(h => h.mode === SessionMode.GAMMA).length;
      return count >= 5;
    }
  },
  // --- SPECIAL ACHIEVEMENTS ---
  {
    id: 'marathon',
    title: 'Maratonista Neural',
    desc: 'Complete uma sessão única de mais de 45 minutos.',
    icon: Hourglass,
    color: 'text-green-400',
    bgColor: 'bg-green-400/20',
    condition: (s: UserStats) => s.history.some(h => h.durationMinutes >= 45)
  },
  {
    id: 'polymath',
    title: 'Polímata',
    desc: 'Experimente 3 protocolos diferentes.',
    icon: Infinity,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    condition: (s: UserStats) => {
      const uniqueModes = new Set(s.history.map(h => h.mode));
      return uniqueModes.size >= 3;
    }
  },
  {
    id: 'scientist',
    title: 'Cientista Neural',
    desc: 'Experimente todos os 6 protocolos.',
    icon: Infinity,
    color: 'text-white',
    bgColor: 'bg-white/20',
    condition: (s: UserStats) => {
      const uniqueModes = new Set(s.history.map(h => h.mode));
      return uniqueModes.size >= 6;
    }
  },
  {
    id: 'hundred_minutes',
    title: 'Centurião',
    desc: 'Acumule 100 minutos de treino total.',
    icon: Clock,
    color: 'text-teal-400',
    bgColor: 'bg-teal-400/20',
    condition: (s: UserStats) => s.totalMinutes >= 100
  },
  {
    id: 'master',
    title: 'Transcendente',
    desc: 'Alcance 100 Nós na Matriz Neural.',
    icon: Sun,
    color: 'text-white',
    bgColor: 'bg-white/20',
    condition: (s: UserStats) => s.neuroCores >= 100
  }
];

const ProfileView: React.FC<Props> = ({ stats }) => {
  const currentRank = RANKS[stats.level - 1] || "Entidade Digital";
  const xpForCurrentLevel = LEVEL_THRESHOLDS[stats.level - 1] || 0;
  const xpForNextLevel = LEVEL_THRESHOLDS[stats.level] || (stats.xp * 1.5);

  const progress = Math.min(100, Math.max(0,
    ((stats.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
  ));

  // Determine Ranking based on NeuroCores (Connections)
  const getRankingText = () => {
    const cores = stats.neuroCores || 0;
    if (cores > 100) return "Top 0.1% Global";
    if (cores > 50) return "Top 1% Global";
    if (cores > 25) return "Top 5% Global";
    if (cores > 10) return "Top 20% Global";
    return "Sincronizando...";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">

      {/* Header Profile Card */}
      <div className="bg-neuro-800 border border-neuro-700 rounded-xl p-6 md:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
          <Network size={150} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-neuro-900 flex items-center justify-center border-2 border-neuro-accent text-3xl font-bold font-mono text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] z-10 relative">
                {stats.level}
              </div>
              {/* Spinning Ring */}
              <div className="absolute inset-0 rounded-full border border-neuro-accent/30 scale-125 animate-spin-slow"></div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">{currentRank}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-mono text-neuro-accent bg-neuro-accent/10 px-2 py-0.5 rounded border border-neuro-accent/20">
                  NÍVEL {stats.level}
                </span>
                <span className="text-sm font-mono text-gray-400">
                  {stats.xp} NeuroXP
                </span>
              </div>
            </div>
          </div>

          {/* XP Bar - Cyber Style */}
          <div className="mt-2">
            <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">
              <span>Sincronização Neural</span>
              <span>{(xpForNextLevel - stats.xp).toFixed(0)} XP p/ Upgrade</span>
            </div>
            <div className="w-full h-4 bg-neuro-900/80 rounded-sm overflow-hidden border border-neuro-700 relative">
              {/* Grid background for bar */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div
                className="h-full bg-gradient-to-r from-neuro-accent via-purple-500 to-white/80 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(139,92,246,0.8)] relative"
                style={{ width: `${progress}%` }}
              >
                {/* Leading edge flare */}
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white blur-[2px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* NeuroCores - The Main Ranking Metric */}
        <div className="bg-neuro-800/60 border border-neuro-accent/30 p-4 rounded-xl flex flex-col items-center justify-center gap-2 group hover:bg-neuro-800 transition-all relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-neuro-accent/10 group-hover:text-neuro-accent/20 transition-colors">
            <Share2 size={64} />
          </div>
          <Share2 className="text-neuro-accent group-hover:scale-110 transition-transform z-10" size={28} />
          <div className="text-3xl font-bold text-white font-mono z-10">{stats.neuroCores || 0}</div>
          <div className="text-[10px] uppercase text-neuro-accent font-bold tracking-widest z-10 text-center">Conexões Neurais</div>
        </div>

        {/* Ranking */}
        <div className="bg-neuro-900 border border-neuro-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 group hover:border-white transition-colors">
          <Target className="text-white group-hover:scale-110 transition-transform" size={24} />
          <div className="text-xl font-bold text-white font-mono text-center">{getRankingText()}</div>
          <div className="text-[10px] uppercase text-gray-500 tracking-widest">Ranking Global</div>
        </div>

        {/* Streak */}
        <div className="bg-neuro-900 border border-neuro-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 group hover:border-neuro-warning transition-colors">
          <Flame className="text-neuro-warning group-hover:scale-110 transition-transform" size={24} />
          <div className="text-2xl font-bold text-white font-mono">{stats.streak}</div>
          <div className="text-[10px] uppercase text-gray-500 tracking-widest">Dias Seguidos</div>
        </div>

        {/* Minutes */}
        <div className="bg-neuro-900 border border-neuro-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 group hover:border-blue-400 transition-colors">
          <Clock className="text-blue-400 group-hover:scale-110 transition-transform" size={24} />
          <div className="text-2xl font-bold text-white font-mono">{stats.totalMinutes}</div>
          <div className="text-[10px] uppercase text-gray-500 tracking-widest">Minutos Totais</div>
        </div>
      </div>

      {/* 3D BRAIN MATRIX VISUALIZATION */}
      <div className="bg-neuro-900 border border-neuro-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6 border-b border-neuro-800 pb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Network className="text-neuro-accent" size={18} />
            Matriz Neural Pessoal
          </h3>
          <span className="text-xs font-mono text-gray-500">{stats.neuroCores || 0} NÓS ATIVOS</span>
        </div>

        {/* The 3D Component */}
        <div className="h-[400px] w-full bg-black/50 rounded-lg border border-neuro-800 relative">
          <BrainMatrix activeNodes={stats.neuroCores} nodesByMode={stats.neuroCoresByMode} />
        </div>

        <p className="text-[10px] text-gray-500 mt-4 font-mono text-center">
          Modelo 3D gerado em tempo real com base no seu histórico de sessões.
        </p>
      </div>

      {/* Session History List (New Component Integration) */}
      <SessionHistory history={stats.history} />

      {/* Monthly Leaderboard */}
      <Leaderboard />

      {/* Achievements List */}
      <div className="opacity-90">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Award className="text-yellow-500" size={18} />
          Conquistas & Marcos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACHIEVEMENTS_CONFIG.map((ach) => {
            const unlocked = ach.condition(stats);
            const Icon = ach.icon;

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-lg border flex flex-col gap-3 transition-all duration-300 ${unlocked
                  ? `bg-neuro-800/60 border-neuro-accent/30 shadow-lg`
                  : `bg-neuro-900 border-neuro-700 opacity-40 grayscale`
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-full ${unlocked ? ach.bgColor + ' ' + ach.color : 'bg-gray-800 text-gray-600'}`}>
                    <Icon size={20} />
                  </div>
                  {unlocked && <div className="text-[10px] font-bold text-neuro-success uppercase tracking-wider">Desbloqueado</div>}
                </div>

                <div>
                  <div className={`font-bold text-sm ${unlocked ? 'text-gray-200' : 'text-gray-500'}`}>{ach.title}</div>
                  <div className="text-xs text-gray-500 leading-tight mt-1">{ach.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;

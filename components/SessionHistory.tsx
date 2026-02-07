import React from 'react';
import { SessionRecord, SessionMode, SESSION_CONFIGS } from '../types';
import { History, Clock, Calendar, Activity, Zap, Moon, Flame, Lightbulb, HeartPulse } from 'lucide-react';

interface Props {
  history: SessionRecord[];
}

const SessionHistory: React.FC<Props> = ({ history }) => {
  if (!history || history.length === 0) {
    return null;
  }

  const getIcon = (mode: SessionMode) => {
    switch (mode) {
      case SessionMode.GAMMA: return <Flame size={14} className="text-red-500" />;
      case SessionMode.FOCUS: return <Zap size={14} className="text-neuro-warning" />;
      case SessionMode.STUDY: return <Activity size={14} className="text-neuro-accent" />;
      case SessionMode.CREATIVITY: return <Lightbulb size={14} className="text-green-400" />;
      case SessionMode.SLEEP: return <Moon size={14} className="text-blue-400" />;
      case SessionMode.RESTORE: return <HeartPulse size={14} className="text-indigo-400" />;
      default: return <Activity size={14} className="text-gray-500" />;
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-neuro-900 border border-neuro-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4 border-b border-neuro-800 pb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="text-neuro-accent" size={18} />
          Histórico de Sessões
        </h3>
        <span className="text-xs font-mono text-gray-500">{history.length} REGISTROS</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] uppercase text-gray-500 font-mono tracking-widest border-b border-neuro-800">
              <th className="pb-3 pl-2">Protocolo</th>
              <th className="pb-3 text-center">Duração</th>
              <th className="pb-3 text-right">XP</th>
              <th className="pb-3 text-right pr-2">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neuro-800">
            {history.map((session) => (
              <tr key={session.id} className="group hover:bg-neuro-800/50 transition-colors text-sm">
                <td className="py-3 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-neuro-800 border border-neuro-700 group-hover:border-neuro-500 transition-colors">
                      {getIcon(session.mode)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-200">{SESSION_CONFIGS[session.mode]?.label || session.mode}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{SESSION_CONFIGS[session.mode]?.waveType}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-center font-mono text-gray-400">
                  {session.durationMinutes} min
                </td>
                <td className="py-3 text-right font-mono text-neuro-success">
                  +{session.xpEarned}
                </td>
                <td className="py-3 pr-2 text-right text-xs text-gray-500 font-mono">
                  {formatDate(session.completedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionHistory;
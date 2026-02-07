
import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Medal, ChevronUp, Loader2, Calendar } from 'lucide-react';
import { fetchMonthlyLeaderboard, getCurrentMonthName, LeaderboardData, LeaderboardEntry } from '../services/leaderboardService';
import { useAuth } from '../src/contexts/AuthContext';

const Leaderboard: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            setLoading(true);
            const result = await fetchMonthlyLeaderboard(user?.id);
            setData(result);
            setLoading(false);
        };
        loadLeaderboard();
    }, [user?.id]);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="text-yellow-400" size={18} />;
        if (rank === 2) return <Medal className="text-gray-300" size={18} />;
        if (rank === 3) return <Medal className="text-amber-600" size={18} />;
        return <span className="text-gray-500 font-mono text-sm w-[18px] text-center">{rank}</span>;
    };

    const getRankBgClass = (rank: number, isCurrentUser: boolean) => {
        if (isCurrentUser) return 'bg-neuro-accent/20 border-neuro-accent/50';
        if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/30';
        if (rank === 2) return 'bg-gray-400/10 border-gray-400/30';
        if (rank === 3) return 'bg-amber-600/10 border-amber-600/30';
        return 'bg-neuro-800/40 border-neuro-700';
    };

    if (loading) {
        return (
            <div className="bg-neuro-800 border border-neuro-700 rounded-xl p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-neuro-accent" size={24} />
                    <span className="ml-2 text-gray-400 text-sm">Carregando ranking...</span>
                </div>
            </div>
        );
    }

    if (!data || data.entries.length === 0) {
        return (
            <div className="bg-neuro-800 border border-neuro-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-neuro-700 pb-3">
                    <Trophy className="text-yellow-500" size={18} />
                    <h3 className="text-sm font-bold text-white">Ranking Mensal</h3>
                    <span className="text-xs text-gray-500 ml-auto font-mono">{getCurrentMonthName()}</span>
                </div>
                <div className="text-center py-8 text-gray-500 text-sm">
                    Nenhuma atividade este mês ainda.
                    <br />
                    <span className="text-neuro-accent">Complete sessões para aparecer no ranking.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neuro-800 border border-neuro-700 rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-neuro-700 pb-3">
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={18} />
                    <h3 className="text-sm font-bold text-white">Ranking Mensal</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-gray-500" />
                    <span className="text-xs text-neuro-accent font-mono">{getCurrentMonthName()}</span>
                </div>
            </div>

            {/* Current User Position (if not in top 10) */}
            {data.currentUserRank && data.currentUserRank > 10 && (
                <div className="mb-4 p-3 bg-neuro-accent/10 border border-neuro-accent/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ChevronUp className="text-neuro-accent" size={16} />
                        <span className="text-sm text-white">Sua posição</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-neuro-accent font-mono">#{data.currentUserRank}</span>
                        <span className="text-xs text-gray-500">de {data.totalParticipants}</span>
                    </div>
                </div>
            )}

            {/* Leaderboard List */}
            <div className="space-y-2">
                {data.entries.map((entry) => {
                    const isCurrentUser = user?.id === entry.id;
                    return (
                        <div
                            key={entry.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${getRankBgClass(entry.rank, isCurrentUser)} ${isCurrentUser ? 'ring-1 ring-neuro-accent/50' : ''}`}
                        >
                            {/* Rank Badge */}
                            <div className="w-8 flex justify-center">
                                {getRankIcon(entry.rank)}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium truncate ${isCurrentUser ? 'text-neuro-accent' : 'text-white'}`}>
                                        {entry.displayName}
                                        {isCurrentUser && <span className="text-xs text-neuro-accent ml-1">(você)</span>}
                                    </span>
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono">
                                    {entry.neuroCores} conexões
                                </div>
                            </div>

                            {/* XP This Month */}
                            <div className="text-right">
                                <div className="text-lg font-bold text-white font-mono">
                                    {entry.monthlyXp.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase">XP</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Stats */}
            <div className="mt-4 pt-3 border-t border-neuro-700 flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-mono">
                    {data.totalParticipants} participantes este mês
                </span>
                {data.currentUserRank && data.currentUserRank <= 10 && (
                    <span className="text-[10px] text-neuro-accent font-mono">
                        Você está no Top 10
                    </span>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;

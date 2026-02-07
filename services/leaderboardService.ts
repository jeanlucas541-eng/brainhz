
import { supabase } from '../src/lib/supabase';

export interface LeaderboardEntry {
    id: string;
    email: string;
    username: string | null;
    displayName: string;
    xp: number;
    neuroCores: number;
    monthlyXp: number;
    rank: number;
}

export interface LeaderboardData {
    entries: LeaderboardEntry[];
    currentUserRank: number | null;
    totalParticipants: number;
}

// Get display name - prefer username, fallback to masked email
const getDisplayName = (username: string | null, email: string | null): string => {
    // If user has a username, show it
    if (username) return '@' + username;

    // Fallback to masked email
    if (!email) return 'Anônimo';
    const name = email.split('@')[0];
    if (name.length <= 3) return name;
    return name.substring(0, 3) + '***';
};

// Get the first and last day of current month
const getMonthBounds = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { firstDay, lastDay };
};

export const fetchMonthlyLeaderboard = async (currentUserId?: string): Promise<LeaderboardData> => {
    const { firstDay, lastDay } = getMonthBounds();

    try {
        // Query: Sum XP earned this month per user from sessions table
        const { data: monthlyData, error: monthlyError } = await supabase
            .from('sessions')
            .select('user_id, xp_earned')
            .gte('completed_at', firstDay.toISOString())
            .lte('completed_at', lastDay.toISOString());

        if (monthlyError) throw monthlyError;

        // Aggregate monthly XP by user
        const monthlyXpByUser: Record<string, number> = {};
        (monthlyData || []).forEach((session: any) => {
            const userId = session.user_id;
            if (!monthlyXpByUser[userId]) monthlyXpByUser[userId] = 0;
            monthlyXpByUser[userId] += session.xp_earned || 0;
        });

        // Get profile data for users with activity this month
        const activeUserIds = Object.keys(monthlyXpByUser);

        if (activeUserIds.length === 0) {
            return {
                entries: [],
                currentUserRank: null,
                totalParticipants: 0
            };
        }

        // Include username in the query
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email, username, xp, neuro_cores')
            .in('id', activeUserIds);

        if (profilesError) throw profilesError;

        // Build leaderboard entries
        const entries: LeaderboardEntry[] = (profiles || []).map((profile: any) => ({
            id: profile.id,
            email: profile.email,
            username: profile.username,
            displayName: getDisplayName(profile.username, profile.email),
            xp: profile.xp || 0,
            neuroCores: profile.neuro_cores || 0,
            monthlyXp: monthlyXpByUser[profile.id] || 0,
            rank: 0
        }));

        // Sort by monthly XP (descending) and assign ranks
        entries.sort((a, b) => b.monthlyXp - a.monthlyXp);
        entries.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        // Find current user's rank
        const currentUserRank = currentUserId
            ? entries.find(e => e.id === currentUserId)?.rank || null
            : null;

        return {
            entries: entries.slice(0, 10), // Top 10
            currentUserRank,
            totalParticipants: entries.length
        };

    } catch (error) {
        console.error('[Leaderboard] Error fetching leaderboard:', error);
        return {
            entries: [],
            currentUserRank: null,
            totalParticipants: 0
        };
    }
};

// Get month name in Portuguese
export const getCurrentMonthName = (): string => {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[new Date().getMonth()];
};

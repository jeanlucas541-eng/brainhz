
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserStats, SessionMode } from '../../types';
import {
    loadStats,
    addMinutes as serviceAddMinutes,
    addNeuroCore as serviceAddNeuroCore,
    updateStreak,
    fetchRemoteStats,
    syncProfileToCloud,
    syncSessionToCloud
} from '../../services/gamificationService';
import { useAuth } from './AuthContext';

interface GamificationContextType {
    stats: UserStats;
    addTime: (minutes: number) => void;
    completeSession: (mode: SessionMode, duration: number) => void;
    refreshStats: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState<UserStats>(loadStats());

    // Load stats on mount or user change
    useEffect(() => {
        const load = async () => {
            if (user) {
                console.log('Syncing with Supabase...');
                const remoteStats = await fetchRemoteStats(user.id);
                if (remoteStats) {
                    // Update local state with cloud data
                    // Check if local streak is newer? For now trusted cloud.
                    // But we should re-calculate streak locally just in case.
                    const withStreak = updateStreak(remoteStats);
                    setStats(withStreak);
                    if (withStreak.streak !== remoteStats.streak) {
                        syncProfileToCloud(user.id, withStreak);
                    }
                } else {
                    // First time login or no profile? Maybe create one or sync local to cloud?
                    // For now, let's assume we push local -> cloud if remote is empty
                    console.log("No remote stats found, syncing local to cloud...");
                    const local = updateStreak(loadStats());
                    await syncProfileToCloud(user.id, local);
                    setStats(local);
                }
            } else {
                // Local Storage only
                setStats(updateStreak(loadStats()));
            }
        };
        load();
    }, [user]);

    const addTime = (minutes: number) => {
        setStats(prev => {
            const updated = serviceAddMinutes(prev, minutes);
            if (user) {
                syncProfileToCloud(user.id, updated);
            }
            return updated;
        });
    };

    const completeSession = (mode: SessionMode, duration: number) => {
        setStats(prev => {
            const updated = serviceAddNeuroCore(prev, mode, duration);
            if (user) {
                // Sync the new profile stats (XP, Cores)
                syncProfileToCloud(user.id, updated);

                // Sync the specific session record (Top of history)
                if (updated.history.length > 0) {
                    syncSessionToCloud(user.id, updated.history[0]);
                }
            }
            return updated;
        });
    };

    const refreshStats = async () => {
        if (user) {
            const remoteStats = await fetchRemoteStats(user.id);
            if (remoteStats) setStats(remoteStats);
        } else {
            setStats(loadStats());
        }
    };

    return (
        <GamificationContext.Provider value={{ stats, addTime, completeSession, refreshStats }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};

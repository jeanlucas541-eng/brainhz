
import { UserStats, LEVEL_THRESHOLDS, SessionMode, SessionRecord, DEFAULT_NEURO_CORES, NeuroCoresByMode } from '../types';

const STORAGE_KEY = 'brainhz_user_stats';

// Real empty defaults for new users
const DEFAULT_STATS: UserStats = {
  xp: 0,
  level: 1,
  totalMinutes: 0,
  streak: 0,
  lastLoginDate: new Date().toISOString(),
  achievements: [],
  neuroCores: 0,
  neuroCoresByMode: { ...DEFAULT_NEURO_CORES },
  history: []
};

export const loadStats = (): UserStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const stats = JSON.parse(stored);
      // Validate streak logic on load
      const today = new Date().toDateString();
      const last = new Date(stats.lastLoginDate).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      // If user missed a day (last login was before yesterday), reset streak
      if (last !== today && last !== yesterday && stats.streak > 0) {
        stats.streak = 0;
      }
      // Backwards compatibility for old saves
      if (typeof stats.neuroCores === 'undefined') stats.neuroCores = 0;
      if (!Array.isArray(stats.history)) stats.history = [];

      return stats;
    }
  } catch (e) {
    console.error("Failed to load stats", e);
  }
  return DEFAULT_STATS;
};

export const saveStats = (stats: UserStats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

export const addMinutes = (currentStats: UserStats, minutes: number): UserStats => {
  const newStats = { ...currentStats };

  // 1 Minute = 10 XP
  const XP_PER_MINUTE = 10;

  newStats.totalMinutes += minutes;
  newStats.xp += minutes * XP_PER_MINUTE;

  // Level Up Logic
  const nextLevelThreshold = LEVEL_THRESHOLDS[newStats.level] || 999999;
  if (newStats.xp >= nextLevelThreshold) {
    newStats.level += 1;
  }

  // Update date to now
  newStats.lastLoginDate = new Date().toISOString();

  saveStats(newStats);
  return newStats;
};

export const addNeuroCore = (currentStats: UserStats, mode: SessionMode, durationMinutes: number): UserStats => {
  let newStats = { ...currentStats };
  newStats.neuroCores += 1;

  // Initialize neuroCoresByMode if not exists (migration)
  if (!newStats.neuroCoresByMode) {
    newStats.neuroCoresByMode = { ...DEFAULT_NEURO_CORES };
  } else {
    // Clone to avoid mutation
    newStats.neuroCoresByMode = { ...newStats.neuroCoresByMode };
  }

  // Increment the specific mode's core count (skip IDLE which is not in NeuroCoresByMode)
  if (mode !== SessionMode.IDLE && mode in newStats.neuroCoresByMode) {
    const modeKey = mode as keyof NeuroCoresByMode;
    newStats.neuroCoresByMode[modeKey] += 1;
  }

  // Bonus XP for completing a session core
  const bonusXP = 100;
  newStats.xp += bonusXP;

  // --- UPDATE STREAK INLINE ---
  const today = new Date().toDateString();
  const lastDate = new Date(newStats.lastLoginDate).toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (lastDate !== today) {
    if (lastDate === yesterday) {
      // Consecutive day - increment streak
      newStats.streak += 1;
    } else {
      // First session today (missed days or brand new) - start at 1
      newStats.streak = 1;
    }
  }
  // If same day, don't increment streak again (already counted today)

  // Update last login to now
  newStats.lastLoginDate = new Date().toISOString();

  // Add to History
  const newRecord: SessionRecord = {
    id: Date.now().toString(),
    mode: mode,
    durationMinutes: Math.floor(durationMinutes),
    completedAt: new Date().toISOString(),
    xpEarned: bonusXP
  };

  // Ensure history exists (migration check)
  if (!newStats.history) newStats.history = [];

  // Add to top of list
  newStats.history.unshift(newRecord);

  // Keep history manageable (last 50 sessions)
  if (newStats.history.length > 50) {
    newStats.history = newStats.history.slice(0, 50);
  }

  saveStats(newStats);
  return newStats;
};

export const updateStreak = (currentStats: UserStats): UserStats => {
  const today = new Date().toDateString();
  const lastDate = new Date(currentStats.lastLoginDate).toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const newStats = { ...currentStats };

  if (lastDate !== today) {
    // User is logging in on a new day
    if (lastDate === yesterday) {
      // Consecutive day - increment streak
      newStats.streak += 1;
    } else {
      // Missed days or brand new user - start fresh at 1
      newStats.streak = 1;
    }
    newStats.lastLoginDate = new Date().toISOString();
    saveStats(newStats);
  } else {
    // Same day login - ensure streak is at least 1
    if (newStats.streak < 1) {
      newStats.streak = 1;
      saveStats(newStats);
    }
  }

  return newStats;
};

// --- SUPABASE CLOUD SYNC ---
import { supabase } from '../src/lib/supabase';

export const fetchRemoteStats = async (userId: string): Promise<UserStats | null> => {
  try {
    // 1. Fetch Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // 2. Fetch Sessions History (Last 50)
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(50);

    if (sessionsError) throw sessionsError;

    // Map to UserStats
    return {
      xp: profile.xp,
      level: profile.level,
      totalMinutes: profile.total_minutes,
      streak: profile.streak,
      lastLoginDate: profile.last_login,
      achievements: profile.achievements || [],
      neuroCores: profile.neuro_cores,
      history: sessions.map((s: any) => ({
        id: s.id,
        mode: s.mode as SessionMode,
        durationMinutes: s.duration,
        completedAt: s.completed_at,
        xpEarned: s.xp_earned
      }))
    };
  } catch (error) {
    console.error("Error fetching remote stats:", error);
    return null;
  }
};

export const syncProfileToCloud = async (userId: string, stats: UserStats) => {
  try {
    await supabase.from('profiles').update({
      xp: stats.xp,
      level: stats.level,
      streak: stats.streak,
      total_minutes: stats.totalMinutes,
      neuro_cores: stats.neuroCores,
      last_login: stats.lastLoginDate,
      achievements: stats.achievements
    }).eq('id', userId);
  } catch (error) {
    console.error("Error syncing profile:", error);
  }
};

export const syncSessionToCloud = async (userId: string, session: SessionRecord) => {
  try {
    console.log('[Gamification] Syncing session to cloud:', { userId, session });
    const { data, error } = await supabase.from('sessions').insert({
      user_id: userId,
      mode: session.mode,
      duration: session.durationMinutes,
      xp_earned: session.xpEarned,
      completed_at: session.completedAt
    }).select();

    if (error) {
      console.error('[Gamification] Error inserting session:', error);
    } else {
      console.log('[Gamification] Session synced successfully:', data);
    }
  } catch (error) {
    console.error("Error syncing session:", error);
  }
};

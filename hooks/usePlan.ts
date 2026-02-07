
import { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/contexts/AuthContext';

export type PlanType = 'free' | 'pro' | 'lifetime';

export interface PlanLimits {
    maxSessionMinutes: number;
    allowedModes: string[];
    canUsePomodoro: boolean;
    canUseAI: boolean;
    canSaveProtocols: boolean;
    canUseFavorites: boolean;
    maxFavorites: number;
    isPro: boolean;
}

// Free plan limits
const FREE_LIMITS: PlanLimits = {
    maxSessionMinutes: 10,
    allowedModes: ['FOCUS', 'SLEEP'], // Only 2 modes
    canUsePomodoro: false,
    canUseAI: false,
    canSaveProtocols: false,
    canUseFavorites: true,
    maxFavorites: 1,
    isPro: false
};

// Pro/Lifetime limits (unlimited)
const PRO_LIMITS: PlanLimits = {
    maxSessionMinutes: 999, // Unlimited
    allowedModes: ['GAMMA', 'FOCUS', 'STUDY', 'CREATIVITY', 'SLEEP', 'RESTORE'],
    canUsePomodoro: true,
    canUseAI: true,
    canSaveProtocols: true,
    canUseFavorites: true,
    maxFavorites: 999,
    isPro: true
};

export interface UsePlanReturn {
    plan: PlanType;
    limits: PlanLimits;
    loading: boolean;
    isPro: boolean;
    checkModeAllowed: (mode: string) => boolean;
    checkDurationAllowed: (minutes: number) => boolean;
    refreshPlan: () => Promise<void>;
}

export const usePlan = (): UsePlanReturn => {
    const { user } = useAuth();
    const [plan, setPlan] = useState<PlanType>('free');
    const [loading, setLoading] = useState(true);

    const fetchPlan = async () => {
        if (!user) {
            setPlan('free');
            setLoading(false);
            return;
        }

        // DEV OVERRIDE: Hardcode plans for Test Accounts (Bypass DB/RLS issues)
        if (user.email === 'pro_tester@brainhz.com' || user.email === 'jeanlucas541@gmail.com') {
            setPlan('lifetime');
            setLoading(false);
            return;
        }

        try {
            // Fetch directly from profiles to match Admin Panel logic
            const { data, error } = await supabase
                .from('profiles')
                .select('plan')
                .eq('id', user.id)
                .maybeSingle();

            if (error) throw error;

            if (data?.plan) {
                // If plan is 'lifetime' or 'pro' we consider it valid
                // We default to 'free' if value is unknown
                setPlan(data.plan as PlanType);
            } else {
                // No plan set in profile? Default to free
                setPlan('free');
            }
        } catch (err) {
            console.error('[usePlan] Error fetching plan:', err);
            setPlan('free');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlan();
    }, [user]);

    const isPro = plan === 'pro' || plan === 'lifetime';
    const limits = isPro ? PRO_LIMITS : FREE_LIMITS;

    const checkModeAllowed = (mode: string): boolean => {
        if (mode === 'IDLE') return true;
        return limits.allowedModes.includes(mode);
    };

    const checkDurationAllowed = (minutes: number): boolean => {
        return minutes <= limits.maxSessionMinutes;
    };

    return {
        plan,
        limits,
        loading,
        isPro,
        checkModeAllowed,
        checkDurationAllowed,
        refreshPlan: fetchPlan
    };
};

export default usePlan;

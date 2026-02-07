
import { supabase } from '../src/lib/supabase';
import { SessionMode } from '../types';

// ==================== FAVORITES ====================

export interface FavoriteProtocol {
    mode: SessionMode;
    createdAt: string;
}

// Fetch user's favorite protocols
export const fetchFavorites = async (userId: string): Promise<SessionMode[]> => {
    const { data, error } = await supabase
        .from('user_favorites')
        .select('mode')
        .eq('user_id', userId);

    if (error) {
        console.error('[Favorites] Error fetching:', error);
        return [];
    }

    return (data || []).map((f: any) => f.mode as SessionMode);
};

// Add a protocol to favorites
export const addFavorite = async (userId: string, mode: SessionMode): Promise<boolean> => {
    const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, mode });

    if (error) {
        // Ignore duplicate errors (23505)
        if (error.code === '23505') return true;
        console.error('[Favorites] Error adding:', error);
        return false;
    }
    return true;
};

// Remove a protocol from favorites
export const removeFavorite = async (userId: string, mode: SessionMode): Promise<boolean> => {
    const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('mode', mode);

    if (error) {
        console.error('[Favorites] Error removing:', error);
        return false;
    }
    return true;
};

// Toggle favorite status
export const toggleFavorite = async (userId: string, mode: SessionMode, currentlyFavorite: boolean): Promise<boolean> => {
    if (currentlyFavorite) {
        return removeFavorite(userId, mode);
    } else {
        return addFavorite(userId, mode);
    }
};

// ==================== CUSTOM PROTOCOLS ====================

export interface CustomProtocol {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    baseMode: SessionMode;
    frequencyHz: number;
    durationMinutes: number;
    noiseColor: 'Pink' | 'White' | 'Brown';
    aiExplanation: string | null;
    createdAt: string;
    isFavorite: boolean;
    isPublic: boolean;
}

// Fetch user's custom protocols + Public protocols
export const fetchCustomProtocols = async (userId: string): Promise<CustomProtocol[]> => {
    const { data, error } = await supabase
        .from('custom_protocols')
        .select('*')
        .or(`user_id.eq.${userId},is_public.eq.true`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[CustomProtocols] Error fetching:', error);
        return [];
    }

    return (data || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        name: p.name,
        description: p.description,
        baseMode: p.base_mode as SessionMode,
        frequencyHz: parseFloat(p.frequency_hz),
        durationMinutes: p.duration_minutes,
        noiseColor: p.noise_color as 'Pink' | 'White' | 'Brown',
        aiExplanation: p.ai_explanation,
        createdAt: p.created_at,
        isFavorite: p.is_favorite,
        isPublic: p.is_public
    }));
};

// Create a new custom protocol (from AI)
export interface CreateCustomProtocolParams {
    userId: string;
    name: string;
    description?: string;
    baseMode: SessionMode;
    frequencyHz: number;
    durationMinutes?: number;
    noiseColor?: 'Pink' | 'White' | 'Brown';
    aiExplanation?: string;
    isPublic?: boolean;
}

export const createCustomProtocol = async (params: CreateCustomProtocolParams): Promise<CustomProtocol | null> => {
    const { data, error } = await supabase
        .from('custom_protocols')
        .insert({
            user_id: params.userId,
            name: params.name,
            description: params.description || null,
            base_mode: params.baseMode,
            frequency_hz: params.frequencyHz,
            duration_minutes: params.durationMinutes || 20,
            noise_color: params.noiseColor || 'Brown',
            ai_explanation: params.aiExplanation || null,
            is_public: params.isPublic || false
        })
        .select()
        .single();

    if (error) {
        console.error('[CustomProtocols] Error creating:', error);
        return null;
    }

    return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        description: data.description,
        baseMode: data.base_mode as SessionMode,
        frequencyHz: parseFloat(data.frequency_hz),
        durationMinutes: data.duration_minutes,
        noiseColor: data.noise_color as 'Pink' | 'White' | 'Brown',
        aiExplanation: data.ai_explanation,
        createdAt: data.created_at,
        isFavorite: data.is_favorite,
        isPublic: data.is_public
    };
};

// Delete a custom protocol
export const deleteCustomProtocol = async (protocolId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('custom_protocols')
        .delete()
        .eq('id', protocolId);

    if (error) {
        console.error('[CustomProtocols] Error deleting:', error);
        return false;
    }
    return true;
};

// Toggle favorite status of custom protocol
export const toggleCustomProtocolFavorite = async (protocolId: string, isFavorite: boolean): Promise<boolean> => {
    const { error } = await supabase
        .from('custom_protocols')
        .update({ is_favorite: !isFavorite })
        .eq('id', protocolId);

    if (error) {
        console.error('[CustomProtocols] Error toggling favorite:', error);
        return false;
    }
    return true;
};

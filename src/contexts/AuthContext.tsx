
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthResult {
    error?: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    username: string | null;
    needsUsername: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
    signUpWithEmail: (email: string, password: string) => Promise<AuthResult>;
    signOut: () => Promise<void>;
    setUsernameComplete: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState<string | null>(null);
    const [needsUsername, setNeedsUsername] = useState(false);

    // Check if user has a username set
    const checkUsername = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', userId)
            .maybeSingle();

        if (!error && data) {
            if (data.username) {
                setUsername(data.username);
                setNeedsUsername(false);
            } else {
                setUsername(null);
                setNeedsUsername(true);
            }
        } else {
            // No profile yet, will need username after profile creation
            setNeedsUsername(true);
        }
    };

    useEffect(() => {
        // Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                checkUsername(session.user.id);
            }
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                checkUsername(session.user.id);
            } else {
                setUsername(null);
                setNeedsUsername(false);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
    };

    const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            if (error.message.includes('Invalid login credentials')) {
                return { error: 'Email ou senha incorretos' };
            }
            return { error: error.message };
        }
        return {};
    };

    const signUpWithEmail = async (email: string, password: string): Promise<AuthResult> => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) {
            if (error.message.includes('already registered')) {
                return { error: 'Este email já está cadastrado' };
            }
            return { error: error.message };
        }
        return {};
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const setUsernameComplete = (name: string) => {
        setUsername(name);
        setNeedsUsername(false);
    };

    const value = {
        user,
        session,
        loading,
        username,
        needsUsername,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        setUsernameComplete,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedSessions() {
    console.log('--- SEEDING SESSIONS FOR VIUALIZATION ---');

    // Login as pro_tester to insert sessions for them (standard RLS allows inserting own sessions)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'pro_tester@brainhz.com',
        password: 'password123'
    });

    if (authError || !authData.user) {
        console.error('Login failed:', authError?.message);
        return;
    }
    const userId = authData.user.id;
    console.log(`Logged in as pro_tester (${userId})`);

    const modes = ['FOCUS', 'GAMMA', 'SLEEP', 'STUDY'];
    const sessionsToInsert = [];

    // Generate 10 sessions over the last 7 days
    for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i % 7)); // Spread over week

        sessionsToInsert.push({
            user_id: userId,
            mode: modes[i % modes.length],
            duration: 15 + (i * 5), // 15, 20, 25...
            completed_at: date.toISOString(),
            xp_earned: 150 + (i * 50)
        });
    }

    const { error } = await supabase.from('sessions').insert(sessionsToInsert);

    if (error) {
        console.error('Error inserting sessions:', error.message);
    } else {
        console.log(`Successfully inserted ${sessionsToInsert.length} sessions.`);
    }
}

seedSessions();

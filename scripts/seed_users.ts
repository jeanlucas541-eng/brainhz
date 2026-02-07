
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

// NOTE: Usually we need SERVICE_ROLE key to create users without email confirmation mostly.
// But with anon key we can sign up. They might need to confirm email if "Confirm Email" is on.
// Since this is a test env, we hope user has "Confirm Email" off or we will validade awareness.
// However, creating users via client side implies they are logged in.
// We will just run signUp.

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const users = [
    { email: 'jeanlucas541@gmail.com', password: 'password123', label: 'ADMIN' },
    { email: 'pro_tester@brainhz.com', password: 'password123', label: 'PRO' },
    { email: 'free_tester@brainhz.com', password: 'password123', label: 'FREE' },
];

async function seed() {
    console.log('--- SEEDING USERS ---');

    for (const u of users) {
        console.log(`Creating ${u.label}: ${u.email}...`);
        const { data, error } = await supabase.auth.signUp({
            email: u.email,
            password: u.password,
        });

        if (error) {
            console.error(`Error creating ${u.email}:`, error.message);
        } else {
            console.log(`Success! ID: ${data.user?.id}`);
            if (data.user?.identities?.length === 0) {
                console.warn(`User ${u.email} already registered?`);
            }
        }
    }
}

seed();

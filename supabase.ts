import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Single shared client for client-side usage
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Required for OAuth + OTP security
  },
});

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  language: 'en' | 'hi';
  theme: 'dark' | 'light';
  created_at: string;
};

export type Portfolio = {
  id: string;
  user_id: string;
  name: string;
  investments: Investment[];
  created_at: string;
};

export type Investment = {
  type: string;
  amount: number;
  date: string;
};

export type Watchlist = {
  id: string;
  user_id: string;
  symbols: string[];
  created_at: string;
};

export type AIHistory = {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  language: string;
  created_at: string;
};

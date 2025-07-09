import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

//types for our database
export interface Industry {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

export interface VCFirm {
    id: number;
    name: string;
    description: string;
    website: string;
    location: string;
    founded_year: number;
    assets_under_management: string;
    logo_url: string;
    created_at: string;
}

export interface VentureCapitalist {
    id: number;
    name: string;
    title: string;
    email: string;
    linkedin_url: string;
    twitter_url: string;
    bio: DOMStringList;
    years_experience: number;
    vc_firm_id: number;
    profile_image_url: string;
    created_at: string;
    vc_firms?: VCFirm[];
}

export interface VCIndustrySpecialization {
    id: number;
    vc_id: number;
    industry_id: number;
    expertise_level: 'Low' | 'Medium' | 'High';
    created_at: string;
    industries?: Industry[];
    venture_capitalists?: VentureCapitalist[];
}

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zkdchzvakwrqeknoyguz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZGNoenZha3dycWVrbm95Z3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTg2MzEsImV4cCI6MjA2NTE3NDYzMX0.eibQrgThIpApzBr7vCi1t5k6Xllv0P_DkQSksSCdATo";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});

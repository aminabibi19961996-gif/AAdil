import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://arwibwqiojlowhaldcrv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyd2lid3Fpb2psb3doYWxkY3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0Njg1NjUsImV4cCI6MjA4ODA0NDU2NX0.SBXhwjggBIf78j3xCCFB_aRgffYkkqfJdEczdi-mIDU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

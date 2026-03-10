import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * SecureStore adapter with error handling.
 * Uses expo-secure-store on native (encrypted keychain/keystore)
 * and falls back to localStorage on web.
 * If SecureStore fails for any reason, returns null gracefully
 * so auth still works (user just has to re-login on next cold start).
 */
const SecureStoreAdapter = {
    getItem: async (key) => {
        if (Platform.OS === 'web') {
            try { return localStorage.getItem(key); } catch { return null; }
        }
        try {
            return await SecureStore.getItemAsync(key);
        } catch (e) {
            if (__DEV__) console.error('SecureStore getItem error:', e);
            return null;
        }
    },
    setItem: async (key, value) => {
        if (Platform.OS === 'web') {
            try { localStorage.setItem(key, value); } catch {}
            return;
        }
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (e) {
            if (__DEV__) console.error('SecureStore setItem error:', e);
        }
    },
    removeItem: async (key) => {
        if (Platform.OS === 'web') {
            try { localStorage.removeItem(key); } catch {}
            return;
        }
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (e) {
            if (__DEV__) console.error('SecureStore removeItem error:', e);
        }
    },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: SecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

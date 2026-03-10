import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1, refetchOnWindowFocus: false },
  },
});

/**
 * Expo Router ErrorBoundary – catches rendering crashes inside the
 * router tree and shows a recovery screen instead of a white screen.
 */
export function ErrorBoundary({ error, retry }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8fafc' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1a2332', marginBottom: 10 }}>
        Something went wrong
      </Text>
      <Text style={{ color: '#64748b', marginBottom: 24, textAlign: 'center', fontSize: 15, lineHeight: 22 }}>
        {error?.message || 'An unexpected error occurred'}
      </Text>
      <TouchableOpacity
        onPress={retry}
        style={{ backgroundColor: '#FFB800', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10 }}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1a2332' }}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  const [session, setSession] = useState(undefined);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const hasNavigated = useRef(false);

  // 1. Load session + listen for auth changes
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session ?? null);
        setIsReady(true);
      })
      .catch(() => {
        setSession(null);
        setIsReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (__DEV__) console.log('[AUTH]', _event, !!newSession);
      setSession(newSession ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Hide splash once ready (catch prevents stuck splash if native module errors)
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  // 3. Navigate based on auth state (runs only when session changes, not every render)
  useEffect(() => {
    if (!isReady || session === undefined) return;

    const inAuthGroup = segments[0] === 'login';

    if (session && inAuthGroup) {
      // User just logged in — send them to the main app
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      // User logged out or no session — send to login
      router.replace('/login');
    }
  }, [session, isReady, segments]);

  // Show nothing while splash is visible (splash covers this)
  if (!isReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="crane/[id]" />
          <Stack.Screen name="truck/[id]" />
          <Stack.Screen name="booking/[id]" />
          <Stack.Screen name="truck-booking/[id]" />
          <Stack.Screen name="admin/dashboard" />
          <Stack.Screen name="admin/cranes" />
          <Stack.Screen name="admin/trucks" />
          <Stack.Screen name="admin/vehicles" />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

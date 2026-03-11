import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
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
      if (__DEV__) {
        console.log('[AUTH] Event:', _event, '| hasSession:', !!newSession);
        if (newSession) {
          console.log('[AUTH] User:', newSession.user?.email, '| Provider:', newSession.user?.app_metadata?.provider);
        }
      }
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
    const isRootIndex = segments.length === 0 || segments[0] === 'index';

    if (__DEV__) {
      console.log('[NAV] Evaluating route — segments:', JSON.stringify(segments),
        '| hasSession:', !!session, '| inAuthGroup:', inAuthGroup, '| isRootIndex:', isRootIndex);
    }

    if (session && (inAuthGroup || isRootIndex)) {
      if (__DEV__) console.log('[NAV] → Redirecting to /(tabs)');
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      if (__DEV__) console.log('[NAV] → Redirecting to /login');
      router.replace('/login');
    } else {
      if (__DEV__) console.log('[NAV] → Already in correct place, no redirect needed');
    }
  }, [session, isReady, segments]);

  // Show nothing while splash is visible (splash covers this)
  if (!isReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="crane/[id]" />
          <Stack.Screen name="truck/[id]" />
          <Stack.Screen name="booking/[id]" />
          <Stack.Screen name="truck-booking/[id]" />
          <Stack.Screen name="admin" />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

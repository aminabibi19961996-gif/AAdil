import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { supabase } from "../../utils/supabase";

const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL || "";

export default function AdminLayout() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (
        user &&
        ADMIN_EMAIL &&
        user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      ) {
        setAuthorized(true);
      } else {
        router.replace("/(tabs)/admin");
      }
      setChecking(false);
    }).catch((e) => {
      if (__DEV__) console.error('Admin auth check failed:', e);
      router.replace("/(tabs)/admin");
      setChecking(false);
    });
  }, []);

  if (checking || !authorized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#FFB800" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

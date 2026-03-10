import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../utils/supabase";

// Entry point — checks auth and redirects immediately.
// This screen is only visible for a split second while the redirect fires.
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#1a2332", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#FFB800" />
    </View>
  );
}

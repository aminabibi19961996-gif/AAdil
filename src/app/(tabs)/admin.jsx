import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Lock, Mail, Shield } from "lucide-react-native";
import { supabase } from "../../utils/supabase";
import KeyboardAvoidingAnimatedView from "../../components/KeyboardAvoidingAnimatedView";

// Admin email stored as env var — not hardcoded in client code
const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL || "";

export default function AdminLogin() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      // Authenticate with Supabase email+password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      // Check if the authenticated user is the admin
      if (ADMIN_EMAIL && data.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        // Not an admin — sign them out of this session
        await supabase.auth.signOut();
        Alert.alert("Access Denied", "You are not authorized to access the admin panel.");
        return;
      }

      Alert.alert("Login Successful", "Welcome to Admin Panel", [
        {
          text: "Continue",
          onPress: () => router.push("/admin/dashboard"),
        },
      ]);
    } catch (error) {
      console.error("Error during login:", error);
      if (error.message?.includes("Invalid login")) {
        Alert.alert("Login Failed", "Invalid email or password");
      } else {
        Alert.alert("Login Error", error.message || "Failed to login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <StatusBar style="light" />

        {/* Header */}
        <View
          style={{
            backgroundColor: "#1a2332",
            paddingTop: insets.top + 20,
            paddingBottom: 20,
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: 4,
            }}
          >
            Admin Panel
          </Text>
          <Text style={{ fontSize: 14, color: "#94a3b8" }}>
            Secure access for administrators
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 80,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Login Icon */}
          <View style={{ alignItems: "center", marginTop: 40, marginBottom: 32 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#1a2332",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield color="#FFB800" size={40} />
            </View>
          </View>

          {/* Login Form */}
          <View
            style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 20 }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#1a2332",
                marginBottom: 20,
              }}
            >
              Administrator Login
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                Email Address
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f1f5f9",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  height: 50,
                }}
              >
                <Mail color="#64748b" size={20} />
                <TextInput
                  placeholder="Enter admin email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: "#1a2332",
                  }}
                />
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f1f5f9",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  height: 50,
                }}
              >
                <Lock color="#64748b" size={20} />
                <TextInput
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: "#1a2332",
                  }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: loading ? "#cbd5e1" : "#FFB800",
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              {loading ? (
                <ActivityIndicator color="#1a2332" />
              ) : (
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#1a2332" }}
                >
                  Login
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

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
      // Simple hardcoded admin login (no backend API needed)
      if (email === "admin@cranerental.com" && password === "admin123") {
        Alert.alert("Login Successful", "Welcome to Admin Panel", [
          {
            text: "Continue",
            onPress: () => router.push("/admin/dashboard"),
          },
        ]);
      } else {
        Alert.alert("Login Failed", "Invalid credentials");
      }
    } catch (error) {
      console.error("Error during login:", error);
      Alert.alert("Error", "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
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
                placeholder="admin@cranerental.com"
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
  );
}

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Bell, CheckCircle } from "lucide-react-native";

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

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
          Notifications
        </Text>
        <Text style={{ fontSize: 14, color: "#94a3b8" }}>
          Stay updated on your bookings
        </Text>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: 40, alignItems: "center" }}>
          <Bell color="#cbd5e1" size={64} />
          <Text
            style={{
              fontSize: 18,
              color: "#64748b",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            No notifications yet
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#94a3b8",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            You'll receive updates about your bookings here
          </Text>
        </View>

        {/* Sample notification for demo */}
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: 16,
            marginTop: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#dcfce7",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <CheckCircle color="#16a34a" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#1a2332",
                  marginBottom: 4,
                }}
              >
                Welcome to Premium Crane Rentals!
              </Text>
              <Text style={{ fontSize: 14, color: "#64748b", lineHeight: 20 }}>
                Book your first crane and get instant confirmation. We're here
                to help 24/7!
              </Text>
              <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
                Just now
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

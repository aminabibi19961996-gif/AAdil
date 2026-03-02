import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Search,
} from "lucide-react-native";
import { listBookingsByPhone } from "@/utils/dataService";

export default function MyBookings() {
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);

  const fetchBookings = async () => {
    if (!phoneNumber) return;

    setLoading(true);
    setSearchPerformed(true);
    try {
      const data = await listBookingsByPhone(phoneNumber);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return { bg: "#fef3c7", text: "#92400e" };
      case "approved":
        return { bg: "#dcfce7", text: "#16a34a" };
      case "rejected":
        return { bg: "#fee2e2", text: "#dc2626" };
      case "completed":
        return { bg: "#dbeafe", text: "#1d4ed8" };
      case "cancelled":
        return { bg: "#f3f4f6", text: "#6b7280" };
      default:
        return { bg: "#f3f4f6", text: "#6b7280" };
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
          My Bookings
        </Text>
        <Text style={{ fontSize: 14, color: "#94a3b8" }}>
          Track your crane rental bookings
        </Text>

        {/* Phone Search */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>
            Enter your phone number to view bookings
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#2d3748",
                borderRadius: 12,
                paddingHorizontal: 16,
                height: 50,
              }}
            >
              <Search color="#94a3b8" size={20} />
              <TextInput
                placeholder="Enter phone number"
                placeholderTextColor="#94a3b8"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={{
                  flex: 1,
                  marginLeft: 12,
                  color: "#ffffff",
                  fontSize: 16,
                }}
              />
            </View>
            <TouchableOpacity
              onPress={fetchBookings}
              style={{
                backgroundColor: "#FFB800",
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "#1a2332" }}
              >
                Search
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ paddingTop: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#FFB800" />
            <Text style={{ marginTop: 12, color: "#64748b" }}>
              Loading bookings...
            </Text>
          </View>
        ) : !searchPerformed ? (
          <View style={{ paddingTop: 40, alignItems: "center" }}>
            <Calendar color="#cbd5e1" size={64} />
            <Text
              style={{
                fontSize: 18,
                color: "#64748b",
                textAlign: "center",
                marginTop: 16,
              }}
            >
              Enter your phone number to view your bookings
            </Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={{ paddingTop: 40, alignItems: "center" }}>
            <Calendar color="#cbd5e1" size={64} />
            <Text
              style={{
                fontSize: 18,
                color: "#64748b",
                textAlign: "center",
                marginTop: 16,
              }}
            >
              No bookings found for this phone number
            </Text>
          </View>
        ) : (
          bookings.map((booking) => {
            const statusColors = getStatusColor(booking.status);
            return (
              <View
                key={booking.id}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        marginBottom: 4,
                      }}
                    >
                      Booking ID
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#1a2332",
                      }}
                    >
                      {booking.booking_id}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: statusColors.bg,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: statusColors.text,
                        textTransform: "uppercase",
                      }}
                    >
                      {booking.status}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#1a2332",
                      marginBottom: 4,
                    }}
                  >
                    {booking.crane_name}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#64748b" }}>
                    {booking.crane_capacity}
                  </Text>
                </View>

                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Calendar color="#64748b" size={16} />
                    <Text
                      style={{ fontSize: 14, color: "#64748b", marginLeft: 8 }}
                    >
                      {new Date(booking.booking_date).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Clock color="#64748b" size={16} />
                    <Text
                      style={{ fontSize: 14, color: "#64748b", marginLeft: 8 }}
                    >
                      {booking.start_time} • {booking.duration} hours
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MapPin color="#64748b" size={16} />
                    <Text
                      style={{ fontSize: 14, color: "#64748b", marginLeft: 8 }}
                      numberOfLines={1}
                    >
                      {booking.site_location}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IndianRupee color="#1a2332" size={16} />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#1a2332",
                        marginLeft: 8,
                      }}
                    >
                      {booking.total_price}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react-native";
import { getAdminAnalytics, updateBookingStatus } from "../../utils/dataService";

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setError(null);
      const data = await getAdminAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Could not load analytics. Pull down to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchAnalytics(true);
  }, []);

  const handleBookingAction = async (bookingId, status, bookingType) => {
    try {
      await updateBookingStatus(bookingId, status, bookingType);
      Alert.alert("Success", `Booking ${status} successfully`);
      fetchAnalytics(); // Refresh data
    } catch (error) {
      console.error("Error updating booking:", error);
      Alert.alert("Error", error.message || "Failed to update booking");
    }
  };

  if (loading) {
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

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#1a2332",
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#2d3748",
          }}
        >
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#ffffff" }}>
            Admin Dashboard
          </Text>
          <Text style={{ fontSize: 14, color: "#94a3b8" }}>
            Manage your crane rental business
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFB800"
            colors={["#FFB800"]}
          />
        }
      >
        {/* Stats Grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flex: 1,
              minWidth: "47%",
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#dcfce7",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Calendar color="#16a34a" size={20} />
            </View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#1a2332",
                marginBottom: 4,
              }}
            >
              {analytics?.totalBookings || 0}
            </Text>
            <Text style={{ fontSize: 14, color: "#64748b" }}>
              Total Bookings
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              minWidth: "47%",
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#fef3c7",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Clock color="#92400e" size={20} />
            </View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#1a2332",
                marginBottom: 4,
              }}
            >
              {analytics?.pendingBookings || 0}
            </Text>
            <Text style={{ fontSize: 14, color: "#64748b" }}>Pending</Text>
          </View>

          <View
            style={{
              flex: 1,
              minWidth: "47%",
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#dbeafe",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <DollarSign color="#1d4ed8" size={20} />
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#1a2332",
                marginBottom: 4,
              }}
            >
              ₹{analytics?.totalRevenue?.toLocaleString("en-IN") || 0}
            </Text>
            <Text style={{ fontSize: 14, color: "#64748b" }}>
              Total Revenue
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              minWidth: "47%",
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#fef3c7",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Truck color="#92400e" size={20} />
            </View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#1a2332",
                marginBottom: 4,
              }}
            >
              {analytics?.availableCranes || 0}
            </Text>
            <Text style={{ fontSize: 14, color: "#64748b" }}>
              Available Cranes
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              minWidth: "47%",
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#e0e7ff",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Truck color="#4f46e5" size={20} />
            </View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#1a2332",
                marginBottom: 4,
              }}
            >
              {analytics?.availableTrucks || 0}
            </Text>
            <Text style={{ fontSize: 14, color: "#64748b" }}>
              Available Trucks
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#1a2332",
              marginBottom: 12,
            }}
          >
            Quick Actions
          </Text>
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push("/admin/cranes")}
              style={{
                backgroundColor: "#FFB800",
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "#1a2332" }}
              >
                Manage Cranes
              </Text>
              <Truck color="#1a2332" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/admin/trucks")}
              style={{
                backgroundColor: "#ffffff",
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 2,
                borderColor: "#e2e8f0",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "#1a2332" }}
              >
                Manage Trucks
              </Text>
              <Truck color="#1a2332" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Bookings */}
        <View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#1a2332",
              marginBottom: 12,
            }}
          >
            Recent Bookings
          </Text>
          {analytics?.recentBookings?.slice(0, 5).map((booking) => (
            <View
              key={booking.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
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
                  marginBottom: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}
                  >
                    {booking.booking_id}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#1a2332",
                    }}
                  >
                    {booking.crane_name || booking.truck_name}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#64748b" }}>
                    {booking.user_name} • {booking.user_phone}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#1a2332",
                    }}
                  >
                    ₹{booking.total_price}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#64748b" }}>
                    {new Date(booking.booking_date).toLocaleDateString("en-IN")}
                  </Text>
                </View>
              </View>

              {booking.status === "pending" && (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleBookingAction(booking.id, "approved", booking.type)}
                    style={{
                      flex: 1,
                      backgroundColor: "#dcfce7",
                      paddingVertical: 12,
                      borderRadius: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircle color="#16a34a" size={16} />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#16a34a",
                        marginLeft: 6,
                      }}
                    >
                      Approve
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleBookingAction(booking.id, "rejected", booking.type)}
                    style={{
                      flex: 1,
                      backgroundColor: "#fee2e2",
                      paddingVertical: 12,
                      borderRadius: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <XCircle color="#dc2626" size={16} />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#dc2626",
                        marginLeft: 6,
                      }}
                    >
                      Reject
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {booking.status !== "pending" && (
                <View
                  style={{
                    backgroundColor:
                      booking.status === "approved" ? "#dcfce7" : "#fee2e2",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color:
                        booking.status === "approved" ? "#16a34a" : "#dc2626",
                      textTransform: "uppercase",
                    }}
                  >
                    {booking.status}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  IndianRupee,
} from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "../../components/KeyboardAvoidingAnimatedView";
import { getTruck, createTruckBooking } from "../../utils/dataService";

export default function TruckBookingForm() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [formData, setFormData] = useState({
    user_name: "",
    user_phone: "",
    booking_date: "",
    start_time: "",
    duration: "",
    site_location: "",
    is_emergency: false,
  });

  // Date/Time picker state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchTruckDetails();
  }, [id]);

  const fetchTruckDetails = async () => {
    try {
      setLoadError(null);
      const data = await getTruck(id);
      setTruck(data);
    } catch (err) {
      console.error("Error fetching truck details:", err);
      setLoadError("Could not load truck details.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!truck || !formData.duration) return 0;
    let total = parseFloat(truck.price_per_hour) * parseInt(formData.duration);
    if (formData.is_emergency) {
      total = total * 1.5;
    }
    return total.toFixed(2);
  };

  const handleSubmit = async () => {
    if (
      !formData.user_name ||
      !formData.user_phone ||
      !formData.booking_date ||
      !formData.start_time ||
      !formData.duration ||
      !formData.site_location
    ) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createTruckBooking({
        truck_id: id,
        ...formData,
      });

      const phoneNumber = "+919876543210";
      const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(result.whatsapp_message)}`;

      Alert.alert(
        "Booking Successful!",
        `Your booking ID is ${result.booking.booking_id}. Status: Pending Approval`,
        [
          {
            text: "Send WhatsApp",
            onPress: () => {
              Linking.openURL(url).catch(() => {
                Alert.alert("Error", "Could not open WhatsApp");
              });
              router.push("/(tabs)/bookings");
            },
          },
          {
            text: "View Bookings",
            onPress: () => router.push("/(tabs)/bookings"),
          },
        ],
      );
    } catch (error) {
      console.error("Error creating booking:", error);
      Alert.alert("Booking Failed", error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
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

  if (!truck) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ fontSize: 18, color: "#64748b", marginBottom: 16 }}>
          {loadError || "Truck not found"}
        </Text>
        <TouchableOpacity
          onPress={() => { setLoading(true); fetchTruckDetails(); }}
          style={{
            backgroundColor: "#FFB800",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1a2332" }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
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
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#ffffff" }}
            >
              Book {truck?.name}
            </Text>
            <Text style={{ fontSize: 14, color: "#94a3b8" }}>
              {truck?.tonnage || truck?.capacity} • ₹{truck?.price_per_hour}/hr
            </Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Personal Information */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1a2332",
                marginBottom: 16,
              }}
            >
              Personal Information
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                Full Name
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
                <User color="#64748b" size={20} />
                <TextInput
                  placeholder="Enter your name"
                  value={formData.user_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, user_name: text })
                  }
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: "#1a2332",
                  }}
                />
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                Phone Number
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
                <Phone color="#64748b" size={20} />
                <TextInput
                  placeholder="Enter your phone number"
                  value={formData.user_phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, user_phone: text })
                  }
                  keyboardType="phone-pad"
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: "#1a2332",
                  }}
                />
              </View>
            </View>
          </View>

          {/* Booking Details */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1a2332",
                marginBottom: 16,
              }}
            >
              Booking Details
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f1f5f9",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  height: 50,
                }}
              >
                <Calendar color="#64748b" size={20} />
                <Text
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: formData.booking_date ? "#1a2332" : "#94a3b8",
                  }}
                >
                  {formData.booking_date
                    ? selectedDate.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Select date"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (date) {
                      setSelectedDate(date);
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, "0");
                      const dd = String(date.getDate()).padStart(2, "0");
                      setFormData({ ...formData, booking_date: `${yyyy}-${mm}-${dd}` });
                    }
                  }}
                />
              )}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                Start Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#f1f5f9",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  height: 50,
                }}
              >
                <Clock color="#64748b" size={20} />
                <Text
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: formData.start_time ? "#1a2332" : "#94a3b8",
                  }}
                >
                  {formData.start_time
                    ? selectedTime.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "Select time"}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  is24Hour={false}
                  onChange={(event, time) => {
                    setShowTimePicker(Platform.OS === "ios");
                    if (time) {
                      setSelectedTime(time);
                      const hh = String(time.getHours()).padStart(2, "0");
                      const min = String(time.getMinutes()).padStart(2, "0");
                      setFormData({ ...formData, start_time: `${hh}:${min}` });
                    }
                  }}
                />
              )}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                Duration (hours)
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
                <Clock color="#64748b" size={20} />
                <TextInput
                  placeholder="8"
                  value={formData.duration}
                  onChangeText={(text) =>
                    setFormData({ ...formData, duration: text })
                  }
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: "#1a2332",
                  }}
                />
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                Delivery Location
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
                <MapPin color="#64748b" size={20} />
                <TextInput
                  placeholder="Enter delivery address"
                  value={formData.site_location}
                  onChangeText={(text) =>
                    setFormData({ ...formData, site_location: text })
                  }
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 16,
                    color: "#1a2332",
                  }}
                />
              </View>
            </View>
          </View>

          {/* Emergency Booking */}
          <TouchableOpacity
            onPress={() =>
              setFormData({ ...formData, is_emergency: !formData.is_emergency })
            }
            style={{
              backgroundColor: formData.is_emergency ? "#fef3c7" : "#ffffff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 2,
              borderColor: formData.is_emergency ? "#FFB800" : "#e2e8f0",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#1a2332",
                    marginBottom: 4,
                  }}
                >
                  Emergency Booking
                </Text>
                <Text style={{ fontSize: 14, color: "#64748b" }}>
                  +50% surcharge for urgent requests
                </Text>
              </View>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: formData.is_emergency ? "#FFB800" : "#cbd5e1",
                  backgroundColor: formData.is_emergency
                    ? "#FFB800"
                    : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {formData.is_emergency && (
                  <Text style={{ color: "#1a2332", fontSize: 16 }}>✓</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Price Summary */}
          {formData.duration && (
            <View
              style={{
                backgroundColor: "#1a2332",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#ffffff",
                  marginBottom: 12,
                }}
              >
                Price Summary
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 14, color: "#94a3b8" }}>
                  {formData.duration} hours × ₹{truck?.price_per_hour}
                </Text>
                <Text style={{ fontSize: 14, color: "#94a3b8" }}>
                  ₹
                  {(
                    parseFloat(truck?.price_per_hour) *
                    parseInt(formData.duration)
                  ).toFixed(2)}
                </Text>
              </View>
              {formData.is_emergency && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 14, color: "#FFB800" }}>
                    Emergency surcharge (50%)
                  </Text>
                  <Text style={{ fontSize: 14, color: "#FFB800" }}>
                    +₹
                    {(
                      parseFloat(truck?.price_per_hour) *
                      parseInt(formData.duration) *
                      0.5
                    ).toFixed(2)}
                  </Text>
                </View>
              )}
              <View
                style={{
                  height: 1,
                  backgroundColor: "#2d3748",
                  marginVertical: 8,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "#ffffff" }}
                >
                  Total
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <IndianRupee color="#FFB800" size={20} />
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#FFB800",
                      marginLeft: 4,
                    }}
                  >
                    {calculateTotal()}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            padding: 16,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderColor: "#e2e8f0",
          }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? "#cbd5e1" : "#FFB800",
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#1a2332" />
            ) : (
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#1a2332" }}
              >
                Confirm Booking
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

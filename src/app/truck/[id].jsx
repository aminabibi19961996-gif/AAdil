import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, MapPin, IndianRupee, Calendar, Truck } from "lucide-react-native";
import { getTruck } from "../../utils/dataService";
import OSMMapView from "../../components/OSMMapView";

export default function TruckDetails() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    fetchTruckDetails();
  }, [id]);

  const fetchTruckDetails = async () => {
    try {
      setError(null);
      const data = await getTruck(id);
      if (isMounted.current) setTruck(data);
    } catch (err) {
      if (__DEV__) console.error("Error fetching truck details:", err);
      if (isMounted.current) setError("Could not load truck details.");
    } finally {
      if (isMounted.current) setLoading(false);
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
          {error || "Truck not found"}
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
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar style="light" />

      {/* Header Image */}
      <View style={{ position: "relative" }}>
        <Image
          source={{
            uri:
              truck.images?.[0] ||
              "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800",
          }}
          style={{ width: "100%", height: width > 600 ? 400 : 300 }}
          resizeMode="cover"
        />

        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: insets.top + 12,
            left: 16,
            backgroundColor: "rgba(26, 35, 50, 0.8)",
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>

        {/* Tonnage Badge */}
        <View
          style={{
            position: "absolute",
            top: insets.top + 12,
            right: 16,
            backgroundColor: "#FFB800",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1a2332" }}>
            {truck.tonnage || truck.capacity || "Available"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Details Card */}
        <View
          style={{
            backgroundColor: "#ffffff",
            marginTop: -20,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#1a2332",
              marginBottom: 8,
            }}
          >
            {truck.name}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <MapPin color="#64748b" size={18} />
            <Text style={{ fontSize: 16, color: "#64748b", marginLeft: 8 }}>
              {truck.location || "Location not specified"}
            </Text>
          </View>

          {truck.location && (
            <OSMMapView
              location={truck.location}
              height={180}
              style={{ marginBottom: 20 }}
            />
          )}

          {/* Price */}
          <View
            style={{
              backgroundColor: "#f1f5f9",
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 4 }}>
              Rental Rate
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IndianRupee color="#1a2332" size={24} />
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#1a2332",
                  marginLeft: 4,
                }}
              >
                {truck.price_per_hour}
              </Text>
              <Text style={{ fontSize: 16, color: "#64748b", marginLeft: 8 }}>
                per hour
              </Text>
            </View>
          </View>

          {/* Description */}
          {truck.description && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1a2332",
                  marginBottom: 8,
                }}
              >
                Description
              </Text>
              <Text style={{ fontSize: 16, color: "#64748b", lineHeight: 24 }}>
                {truck.description}
              </Text>
            </View>
          )}

          {/* Features */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1a2332",
                marginBottom: 12,
              }}
            >
              Features
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#FFB800",
                    marginRight: 12,
                  }}
                />
                <Text style={{ fontSize: 16, color: "#64748b" }}>
                  Professional drivers available
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#FFB800",
                    marginRight: 12,
                  }}
                />
                <Text style={{ fontSize: 16, color: "#64748b" }}>
                  Well maintained fleet
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#FFB800",
                    marginRight: 12,
                  }}
                />
                <Text style={{ fontSize: 16, color: "#64748b" }}>
                  24/7 support available
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#FFB800",
                    marginRight: 12,
                  }}
                />
                <Text style={{ fontSize: 16, color: "#64748b" }}>
                  All permits and insurance included
                </Text>
              </View>
            </View>
          </View>

          {/* Availability Status */}
          <View
            style={{
              backgroundColor: "#dcfce7",
              padding: 16,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#16a34a",
                marginRight: 8,
              }}
            />
            <Text style={{ fontSize: 16, color: "#16a34a", fontWeight: "600" }}>
              Available for Booking
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Book Now Button */}
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
          onPress={() => router.push(`/truck-booking/${truck.id}`)}
          style={{
            backgroundColor: "#FFB800",
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Calendar color="#1a2332" size={20} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#1a2332",
              marginLeft: 8,
            }}
          >
            Book Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

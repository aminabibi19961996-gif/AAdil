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
import { ArrowLeft, MapPin, IndianRupee, Calendar } from "lucide-react-native";
import { getCrane } from "../../utils/dataService";
import OSMMapView from "../../components/OSMMapView";

export default function CraneDetails() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const [crane, setCrane] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    fetchCraneDetails();
  }, [id]);

  const fetchCraneDetails = async () => {
    try {
      setError(null);
      const data = await getCrane(id);
      if (isMounted.current) setCrane(data);
    } catch (err) {
      if (__DEV__) console.error("Error fetching crane details:", err);
      if (isMounted.current) setError("Could not load crane details.");
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

  if (!crane) {
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
          {error || "Crane not found"}
        </Text>
        <TouchableOpacity
          onPress={() => { setLoading(true); fetchCraneDetails(); }}
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
              crane.images?.[0] ||
              "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=800",
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

        {/* Capacity Badge */}
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
            {crane.capacity}
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
            {crane.name}
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
              {crane.location || "Location not specified"}
            </Text>
          </View>

          {crane.location && (
            <OSMMapView
              location={crane.location}
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
                {crane.price_per_hour}
              </Text>
              <Text style={{ fontSize: 16, color: "#64748b", marginLeft: 8 }}>
                per hour
              </Text>
            </View>
          </View>

          {/* Description */}
          {crane.description && (
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
                {crane.description}
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
                  Professional operators available
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
                  Regular maintenance and safety checks
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
                  Emergency booking available
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
          onPress={() => router.push(`/booking/${crane.id}`)}
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

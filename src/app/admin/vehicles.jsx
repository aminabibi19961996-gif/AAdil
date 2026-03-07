import { useState, useEffect } from "react";
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
import { ArrowLeft, Plus, Truck } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "../../components/KeyboardAvoidingAnimatedView";
import { supabase } from "../../utils/supabase";

export default function ManageVehicles() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    vehicle_type: "",
    capacity: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.vehicle_type) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from('trucks')
        .insert([{
          name: formData.name,
          tonnage: formData.vehicle_type,
          capacity: formData.capacity || null,
          price_per_hour: 0,
          availability_status: 'available',
        }]);

      if (error) throw error;

      Alert.alert("Success", "Vehicle added successfully");
      setShowForm(false);
      setFormData({ name: "", vehicle_type: "", capacity: "" });
      fetchVehicles();
    } catch (error) {
      console.error("Error creating vehicle:", error);
      Alert.alert("Error", error.message || "Failed to add vehicle");
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
              Transport Vehicles
            </Text>
            <Text style={{ fontSize: 14, color: "#94a3b8" }}>
              {vehicles.length} vehicles in fleet
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowForm(!showForm)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFB800",
            }}
          >
            <Plus color="#1a2332" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Add Vehicle Form */}
          {showForm && (
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
                Add New Vehicle
              </Text>

              <View style={{ gap: 12 }}>
                <View>
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}
                  >
                    Vehicle Name *
                  </Text>
                  <TextInput
                    placeholder="e.g., Tata LPT 1613"
                    value={formData.name}
                    onChangeText={(text) =>
                      setFormData({ ...formData, name: text })
                    }
                    style={{
                      backgroundColor: "#f1f5f9",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      height: 50,
                      fontSize: 16,
                      color: "#1a2332",
                    }}
                  />
                </View>

                <View>
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}
                  >
                    Vehicle Type *
                  </Text>
                  <TextInput
                    placeholder="e.g., Flatbed Truck"
                    value={formData.vehicle_type}
                    onChangeText={(text) =>
                      setFormData({ ...formData, vehicle_type: text })
                    }
                    style={{
                      backgroundColor: "#f1f5f9",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      height: 50,
                      fontSize: 16,
                      color: "#1a2332",
                    }}
                  />
                </View>

                <View>
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}
                  >
                    Capacity
                  </Text>
                  <TextInput
                    placeholder="e.g., 16 tons"
                    value={formData.capacity}
                    onChangeText={(text) =>
                      setFormData({ ...formData, capacity: text })
                    }
                    style={{
                      backgroundColor: "#f1f5f9",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      height: 50,
                      fontSize: 16,
                      color: "#1a2332",
                    }}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={{
                    backgroundColor: "#FFB800",
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#1a2332",
                    }}
                  >
                    Add Vehicle
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Vehicles List */}
          {loading ? (
            <View style={{ paddingTop: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#FFB800" />
            </View>
          ) : vehicles.length === 0 ? (
            <View style={{ paddingTop: 40, alignItems: "center" }}>
              <Truck color="#cbd5e1" size={64} />
              <Text
                style={{
                  fontSize: 18,
                  color: "#64748b",
                  textAlign: "center",
                  marginTop: 16,
                }}
              >
                No vehicles added yet
              </Text>
            </View>
          ) : (
            vehicles.map((vehicle) => (
              <View
                key={vehicle.id}
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
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#1a2332",
                    marginBottom: 4,
                  }}
                >
                  {vehicle.name}
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}
                >
                  {vehicle.vehicle_type}
                </Text>
                {vehicle.capacity && (
                  <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                    Capacity: {vehicle.capacity}
                  </Text>
                )}
                <View
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderColor: "#e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color:
                        vehicle.availability_status === "available"
                          ? "#16a34a"
                          : "#dc2626",
                      textTransform: "uppercase",
                    }}
                  >
                    {vehicle.availability_status}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

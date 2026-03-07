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
import { ArrowLeft, Plus, Trash2, Truck } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "../../components/KeyboardAvoidingAnimatedView";
import { listTrucks, createTruck, deleteTruck } from "../../utils/dataService";

export default function ManageTrucks() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tonnage: "",
    price_per_hour: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      const data = await listTrucks();
      setTrucks(data);
    } catch (error) {
      console.error("Error fetching trucks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.tonnage || !formData.price_per_hour) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    try {
      await createTruck(formData);
      Alert.alert("Success", "Truck added successfully");
      setShowForm(false);
      setFormData({
        name: "",
        tonnage: "",
        price_per_hour: "",
        location: "",
        description: "",
      });
      fetchTrucks();
    } catch (error) {
      console.error("Error creating truck:", error);
      Alert.alert("Error", error.message || "Failed to add truck");
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Delete Truck", "Are you sure you want to delete this truck?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTruck(id);
            Alert.alert("Success", "Truck deleted successfully");
            fetchTrucks();
          } catch (error) {
            console.error("Error deleting truck:", error);
            Alert.alert("Error", error.message || "Failed to delete truck");
          }
        },
      },
    ]);
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
              Manage Trucks
            </Text>
            <Text style={{ fontSize: 14, color: "#94a3b8" }}>
              {trucks.length} trucks in fleet
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
          {/* Add Truck Form */}
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
                Add New Truck
              </Text>

              <View style={{ gap: 12 }}>
                <View>
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}
                  >
                    Truck Name *
                  </Text>
                  <TextInput
                    placeholder="e.g., Heavy Duty Tipper Truck"
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
                    Tonnage *
                  </Text>
                  <TextInput
                    placeholder="e.g., 25T"
                    value={formData.tonnage}
                    onChangeText={(text) =>
                      setFormData({ ...formData, tonnage: text })
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
                    Price per Hour (₹) *
                  </Text>
                  <TextInput
                    placeholder="e.g., 2000"
                    value={formData.price_per_hour}
                    onChangeText={(text) =>
                      setFormData({ ...formData, price_per_hour: text })
                    }
                    keyboardType="numeric"
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
                    Location
                  </Text>
                  <TextInput
                    placeholder="e.g., Mumbai Depot"
                    value={formData.location}
                    onChangeText={(text) =>
                      setFormData({ ...formData, location: text })
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
                    Description
                  </Text>
                  <TextInput
                    placeholder="Brief description of the truck"
                    value={formData.description}
                    onChangeText={(text) =>
                      setFormData({ ...formData, description: text })
                    }
                    multiline
                    numberOfLines={3}
                    style={{
                      backgroundColor: "#f1f5f9",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: "#1a2332",
                      textAlignVertical: "top",
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
                    Add Truck
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Trucks List */}
          {loading ? (
            <View style={{ paddingTop: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#FFB800" />
            </View>
          ) : trucks.length === 0 ? (
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
                No trucks added yet
              </Text>
            </View>
          ) : (
            trucks.map((truck) => (
              <View
                key={truck.id}
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
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#1a2332",
                        marginBottom: 4,
                      }}
                    >
                      {truck.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#FFB800",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "bold",
                            color: "#1a2332",
                          }}
                        >
                          {truck.tonnage}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 14, color: "#64748b" }}>
                        ₹{truck.price_per_hour}/hr
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(truck.id)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#fee2e2",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 color="#dc2626" size={18} />
                  </TouchableOpacity>
                </View>

                {truck.description && (
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}
                  >
                    {truck.description}
                  </Text>
                )}

                {truck.location && (
                  <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                    📍 {truck.location}
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
                        truck.availability_status === "available"
                          ? "#16a34a"
                          : "#dc2626",
                      textTransform: "uppercase",
                    }}
                  >
                    {truck.availability_status}
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

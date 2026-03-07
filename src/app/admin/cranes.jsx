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
import { ArrowLeft, Plus, Edit, Trash2, Truck } from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "../../components/KeyboardAvoidingAnimatedView";
import { listCranes, createCrane, deleteCrane } from "../../utils/dataService";

export default function ManageCranes() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [cranes, setCranes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    price_per_hour: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    fetchCranes();
  }, []);

  const fetchCranes = async () => {
    try {
      const data = await listCranes();
      setCranes(data);
    } catch (error) {
      console.error("Error fetching cranes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.capacity || !formData.price_per_hour) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    try {
      await createCrane(formData);
      Alert.alert("Success", "Crane added successfully");
      setShowForm(false);
      setFormData({
        name: "",
        capacity: "",
        price_per_hour: "",
        location: "",
        description: "",
      });
      fetchCranes();
    } catch (error) {
      console.error("Error creating crane:", error);
      Alert.alert("Error", error.message || "Failed to add crane");
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Delete Crane", "Are you sure you want to delete this crane?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCrane(id);
            Alert.alert("Success", "Crane deleted successfully");
            fetchCranes();
          } catch (error) {
            console.error("Error deleting crane:", error);
            Alert.alert("Error", error.message || "Failed to delete crane");
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
              Manage Cranes
            </Text>
            <Text style={{ fontSize: 14, color: "#94a3b8" }}>
              {cranes.length} cranes in fleet
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
          {/* Add Crane Form */}
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
                Add New Crane
              </Text>

              <View style={{ gap: 12 }}>
                <View>
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}
                  >
                    Crane Name *
                  </Text>
                  <TextInput
                    placeholder="e.g., Hydraulic Mobile Crane"
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
                    Capacity *
                  </Text>
                  <TextInput
                    placeholder="e.g., 14T"
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

                <View>
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}
                  >
                    Price per Hour (₹) *
                  </Text>
                  <TextInput
                    placeholder="e.g., 1500"
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
                    placeholder="Brief description of the crane"
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
                    Add Crane
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Cranes List */}
          {loading ? (
            <View style={{ paddingTop: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#FFB800" />
            </View>
          ) : cranes.length === 0 ? (
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
                No cranes added yet
              </Text>
            </View>
          ) : (
            cranes.map((crane) => (
              <View
                key={crane.id}
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
                      {crane.name}
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
                          {crane.capacity}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 14, color: "#64748b" }}>
                        ₹{crane.price_per_hour}/hr
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(crane.id)}
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

                {crane.description && (
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}
                  >
                    {crane.description}
                  </Text>
                )}

                {crane.location && (
                  <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                    📍 {crane.location}
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
                        crane.availability_status === "available"
                          ? "#16a34a"
                          : "#dc2626",
                      textTransform: "uppercase",
                    }}
                  >
                    {crane.availability_status}
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

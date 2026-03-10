import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Truck,
  ImagePlus,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import KeyboardAvoidingAnimatedView from "../../components/KeyboardAvoidingAnimatedView";
import {
  listTrucks,
  createTruck,
  deleteTruck,
  toggleTruckAvailability,
} from "../../utils/dataService";

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
    images: [],
  });
  const [imageUrl, setImageUrl] = useState("");
  const isMounted = useRef(true);

  useEffect(() => {
    fetchTrucks();
    return () => { isMounted.current = false; };
  }, []);

  const fetchTrucks = async () => {
    try {
      const data = await listTrucks();
      if (isMounted.current) setTrucks(data);
    } catch (error) {
      if (__DEV__) console.error("Error fetching trucks:", error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData({
        ...formData,
        images: [...formData.images, result.assets[0].uri],
      });
    }
  };

  const addImageUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    if (!url.startsWith("http")) {
      Alert.alert("Invalid URL", "Please enter a valid image URL starting with http:// or https://");
      return;
    }
    setFormData({
      ...formData,
      images: [...formData.images, url],
    });
    setImageUrl("");
  };

  const removeImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updated });
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
        images: [],
      });
      fetchTrucks();
    } catch (error) {
      if (__DEV__) console.error("Error creating truck:", error);
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
            if (__DEV__) console.error("Error deleting truck:", error);
            Alert.alert("Error", error.message || "Failed to delete truck");
          }
        },
      },
    ]);
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await toggleTruckAvailability(id, currentStatus);
      fetchTrucks();
    } catch (error) {
      if (__DEV__) console.error("Error toggling availability:", error);
      Alert.alert("Error", error.message || "Failed to update status");
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
          keyboardShouldPersistTaps="handled"
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
                  <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                    Truck Name *
                  </Text>
                  <TextInput
                    placeholder="e.g., Heavy Duty Tipper Truck"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
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
                  <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                    Tonnage *
                  </Text>
                  <TextInput
                    placeholder="e.g., 25T"
                    value={formData.tonnage}
                    onChangeText={(text) => setFormData({ ...formData, tonnage: text })}
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
                  <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                    Price per Hour (₹) *
                  </Text>
                  <TextInput
                    placeholder="e.g., 2000"
                    value={formData.price_per_hour}
                    onChangeText={(text) => setFormData({ ...formData, price_per_hour: text })}
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
                  <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                    Location
                  </Text>
                  <TextInput
                    placeholder="e.g., Mumbai Depot"
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
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
                  <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                    Description
                  </Text>
                  <TextInput
                    placeholder="Brief description of the truck"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
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

                {/* Image Section */}
                <View>
                  <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 8 }}>
                    Images
                  </Text>

                  {/* Image previews */}
                  {formData.images.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginBottom: 12 }}
                    >
                      {formData.images.map((img, index) => (
                        <View key={index} style={{ marginRight: 8, position: "relative" }}>
                          <Image
                            source={{ uri: img }}
                            style={{
                              width: 100,
                              height: 75,
                              borderRadius: 8,
                              backgroundColor: "#f1f5f9",
                            }}
                            resizeMode="cover"
                          />
                          <TouchableOpacity
                            onPress={() => removeImage(index)}
                            style={{
                              position: "absolute",
                              top: -6,
                              right: -6,
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: "#dc2626",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <X color="#fff" size={12} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}

                  {/* Pick from gallery */}
                  <TouchableOpacity
                    onPress={pickImage}
                    style={{
                      backgroundColor: "#f1f5f9",
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      borderStyle: "dashed",
                      marginBottom: 8,
                    }}
                  >
                    <ImagePlus color="#64748b" size={20} />
                    <Text style={{ fontSize: 14, color: "#64748b", marginLeft: 8 }}>
                      Pick from Gallery
                    </Text>
                  </TouchableOpacity>

                  {/* Add image URL */}
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      placeholder="Or paste image URL..."
                      value={imageUrl}
                      onChangeText={setImageUrl}
                      autoCapitalize="none"
                      style={{
                        flex: 1,
                        backgroundColor: "#f1f5f9",
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        height: 44,
                        fontSize: 14,
                        color: "#1a2332",
                      }}
                    />
                    <TouchableOpacity
                      onPress={addImageUrl}
                      style={{
                        backgroundColor: "#1a2332",
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        height: 44,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#FFB800", fontWeight: "bold", fontSize: 14 }}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
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
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1a2332" }}>
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
                  overflow: "hidden",
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {/* Truck image */}
                {truck.images?.[0] && (
                  <Image
                    source={{ uri: truck.images[0] }}
                    style={{ width: "100%", height: 120 }}
                    resizeMode="cover"
                  />
                )}

                <View style={{ padding: 16 }}>
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
                        {truck.images?.length > 0 && (
                          <Text style={{ fontSize: 12, color: "#94a3b8" }}>
                            📷 {truck.images.length}
                          </Text>
                        )}
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
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
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
                    <TouchableOpacity
                      onPress={() =>
                        handleToggleAvailability(truck.id, truck.availability_status)
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor:
                          truck.availability_status === "available"
                            ? "#dcfce7"
                            : "#fee2e2",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      {truck.availability_status === "available" ? (
                        <ToggleRight color="#16a34a" size={18} />
                      ) : (
                        <ToggleLeft color="#dc2626" size={18} />
                      )}
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color:
                            truck.availability_status === "available"
                              ? "#16a34a"
                              : "#dc2626",
                          marginLeft: 4,
                        }}
                      >
                        Toggle
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Linking,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Search, MapPin, Clock, IndianRupee, Truck, Crane } from "lucide-react-native";
import { listCranes, listTrucks } from "../../utils/dataService";

export default function BrowsePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("cranes");
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    fetchItems();
  }, [category]);

  const fetchItems = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      if (category === "cranes") {
        const data = await listCranes("available");
        if (isMounted.current) setItems(data);
      } else {
        const data = await listTrucks("available");
        if (isMounted.current) setItems(data);
      }
    } catch (err) {
      if (__DEV__) console.error(`Error fetching ${category}:`, err);
      if (isMounted.current) setError(`Could not load ${category}. Pull down to retry.`);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const onRefresh = useCallback(() => {
    fetchItems(true);
  }, [category]);

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.capacity || "").toLowerCase().includes(q) ||
      (item.tonnage || "").toLowerCase().includes(q) ||
      (item.location || "").toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q)
    );
  });

  const openWhatsApp = () => {
    const phoneNumber = "+919876543210";
    const message = category === "cranes"
      ? "Hello! I would like to inquire about crane rentals."
      : "Hello! I would like to inquire about truck rentals.";
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      alert("Make sure WhatsApp is installed on your device");
    });
  };

  const handleItemPress = (item) => {
    if (category === "cranes") {
      router.push(`/crane/${item.id}`);
    } else {
      router.push(`/truck/${item.id}`);
    }
  };

  const getItemName = () => category === "cranes" ? "crane" : "truck";
  const getItemTitle = () => category === "cranes" ? "Cranes" : "Trucks";
  const getSubtitle = () => category === "cranes"
    ? "Find the perfect crane for your project"
    : "Find the perfect truck for your needs";
  const getNoItemsMessage = () => category === "cranes"
    ? "No cranes available"
    : "No trucks available";
  const getSearchPlaceholder = () => category === "cranes"
    ? "Search by name, capacity, or location..."
    : "Search by name, tonnage, or location...";

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleItemPress(item)}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 16,
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Image
        source={{
          uri:
            item.images?.[0] ||
            "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=800",
        }}
        style={{ width: "100%", height: width > 600 ? 280 : 200 }}
        resizeMode="cover"
      />

      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#1a2332",
                marginBottom: 4,
              }}
            >
              {item.name}
            </Text>
            <View
              style={{
                backgroundColor: "#FFB800",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 6,
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  color: "#1a2332",
                }}
              >
                {item.capacity || item.tonnage || "Available"}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <IndianRupee color="#1a2332" size={18} />
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#1a2332",
                }}
              >
                {item.price_per_hour}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: "#64748b" }}>
              per hour
            </Text>
          </View>
        </View>

        {item.description && (
          <Text
            style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <MapPin color="#64748b" size={16} />
          <Text
            style={{ fontSize: 14, color: "#64748b", marginLeft: 6 }}
          >
            {item.location || "Location not specified"}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#dcfce7",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            alignSelf: "flex-start",
          }}
        >
          <Clock color="#16a34a" size={14} />
          <Text
            style={{
              fontSize: 12,
              color: "#16a34a",
              marginLeft: 6,
              fontWeight: "600",
            }}
          >
            Available Now
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [width, category]);

  const keyExtractor = useCallback((item) => String(item.id), []);

  const ListHeaderComponent = () => (
    <View>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#1a2332",
          paddingTop: insets.top + 20,
          paddingBottom: 20,
          paddingHorizontal: 20,
          marginHorizontal: -16,
          marginTop: -16,
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
          Premium Rentals
        </Text>
        <Text style={{ fontSize: 14, color: "#94a3b8" }}>
          {getSubtitle()}
        </Text>

        {/* Category Toggle */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#2d3748",
            borderRadius: 12,
            padding: 4,
            marginTop: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => setCategory("cranes")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              borderRadius: 10,
              backgroundColor: category === "cranes" ? "#FFB800" : "transparent",
            }}
          >
            <Crane
              size={18}
              color={category === "cranes" ? "#1a2332" : "#94a3b8"}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: category === "cranes" ? "#1a2332" : "#94a3b8",
                marginLeft: 8,
              }}
            >
              Cranes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCategory("trucks")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              borderRadius: 10,
              backgroundColor: category === "trucks" ? "#FFB800" : "transparent",
            }}
          >
            <Truck
              size={18}
              color={category === "trucks" ? "#1a2332" : "#94a3b8"}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: category === "trucks" ? "#1a2332" : "#94a3b8",
                marginLeft: 8,
              }}
            >
              Trucks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#2d3748",
            borderRadius: 12,
            paddingHorizontal: 16,
            marginTop: 16,
            height: 50,
          }}
        >
          <Search color="#94a3b8" size={20} />
          <TextInput
            placeholder={getSearchPlaceholder()}
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              marginLeft: 12,
              color: "#ffffff",
              fontSize: 16,
            }}
          />
        </View>
      </View>
    </View>
  );

  const ListEmptyComponent = () => {
    if (loading) {
      return (
        <View style={{ paddingTop: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#FFB800" />
          <Text style={{ marginTop: 12, color: "#64748b" }}>
            Loading {getItemTitle()}...
          </Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={{ paddingTop: 40, alignItems: "center" }}>
          <Text
            style={{ fontSize: 18, color: "#dc2626", textAlign: "center", marginBottom: 16 }}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchItems()}
            style={{
              backgroundColor: "#FFB800",
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1a2332" }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={{ paddingTop: 40, alignItems: "center" }}>
        <Text
          style={{ fontSize: 18, color: "#64748b", textAlign: "center" }}
        >
          {searchQuery
            ? `No ${getItemName()}s found matching your search`
            : getNoItemsMessage()}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar style="light" />

      <FlatList
        data={loading || error ? [] : filteredItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 80,
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
      />

      {/* Floating WhatsApp Button */}
      <TouchableOpacity
        onPress={openWhatsApp}
        style={{
          position: "absolute",
          bottom: insets.bottom + 80,
          right: 20,
          backgroundColor: "#25D366",
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text style={{ fontSize: 32 }}>💬</Text>
      </TouchableOpacity>
    </View>
  );
}

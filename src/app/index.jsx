import { View, ActivityIndicator } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: "#1a2332", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#FFB800" />
    </View>
  );
}

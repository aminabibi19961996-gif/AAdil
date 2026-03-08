import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Mail,
  Phone,
  Globe,
  Sparkles,
  MessageCircle,
  ChevronRight,
} from "lucide-react-native";
import { supabase } from "../../utils/supabase";
import { useTranslation, useLanguageStore } from "../../utils/language";
import { LogOut } from "lucide-react-native";

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { t, currentLanguage } = useTranslation();
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadLanguage();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error logging out: " + error.message);
    }
  };

  const languages = [
    { code: "en", name: t("english"), nativeName: "English" },
    { code: "hi", name: t("hindi"), nativeName: "हिंदी" },
  ];

  const handleLanguageChange = async (langCode) => {
    await setLanguage(langCode);
    setShowLanguageModal(false);
  };

  const openEmail = () => {
    Linking.openURL("mailto:info@premiumcranes.com");
  };

  const openPhone = () => {
    Linking.openURL("tel:+919876543210");
  };

  const openWhatsApp = () => {
    const message = "Hello! I would like to add my crane to your fleet.";
    const url = `whatsapp://send?phone=+919876543210&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      alert("Make sure WhatsApp is installed on your device");
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#1a2332",
          paddingTop: insets.top + 20,
          paddingBottom: 20,
          paddingHorizontal: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#ffffff",
              marginBottom: 4,
            }}
          >
            {t("settings")}
          </Text>
          <Text style={{ fontSize: 14, color: "#94a3b8" }}>
            {user?.email || t("accountSettings")}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#ef4444",
            padding: 10,
            borderRadius: 12,
          }}
        >
          <LogOut color="white" size={20} />
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
        {/* Contact Information */}
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: 20,
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
            {t("contactInformation")}
          </Text>

          <TouchableOpacity
            onPress={openEmail}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderColor: "#f1f5f9",
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
                marginRight: 12,
              }}
            >
              <Mail color="#1d4ed8" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
                {t("email")}
              </Text>
              <Text
                style={{ fontSize: 16, color: "#1a2332", fontWeight: "500" }}
              >
                info@premiumcranes.com
              </Text>
            </View>
            <ChevronRight color="#94a3b8" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openPhone}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
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
                marginRight: 12,
              }}
            >
              <Phone color="#16a34a" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
                {t("phone")}
              </Text>
              <Text
                style={{ fontSize: 16, color: "#1a2332", fontWeight: "500" }}
              >
                +91 98765 43210
              </Text>
            </View>
            <ChevronRight color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>

        {/* Language Selection */}
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: 20,
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
            {t("language")}
          </Text>

          <TouchableOpacity
            onPress={() => setShowLanguageModal(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
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
                marginRight: 12,
              }}
            >
              <Globe color="#92400e" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>
                {t("selectLanguage")}
              </Text>
              <Text
                style={{ fontSize: 16, color: "#1a2332", fontWeight: "500" }}
              >
                {languages.find((l) => l.code === currentLanguage)
                  ?.nativeName || "English"}
              </Text>
            </View>
            <ChevronRight color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>

        {/* Coming Soon */}
        <View
          style={{
            backgroundColor:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            backgroundColor: "#667eea",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Sparkles color="#ffffff" size={24} />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#ffffff",
                marginLeft: 8,
              }}
            >
              {t("comingSoon")}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#ffffff",
              lineHeight: 20,
              opacity: 0.9,
            }}
          >
            {t("comingSoonMessage")}
          </Text>
        </View>

        {/* Add Your Crane CTA */}
        <View
          style={{
            backgroundColor: "#FFB800",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#1a2332",
              marginBottom: 8,
            }}
          >
            {t("addYourCrane")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#1a2332",
              marginBottom: 16,
              opacity: 0.8,
            }}
          >
            {t("contactUs")}
          </Text>

          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={openWhatsApp}
              style={{
                backgroundColor: "#25D366",
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageCircle color="#ffffff" size={20} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#ffffff",
                  marginLeft: 8,
                }}
              >
                WhatsApp: +91 98765 43210
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openEmail}
              style={{
                backgroundColor: "#1a2332",
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mail color="#ffffff" size={20} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#ffffff",
                  marginLeft: 8,
                }}
              >
                info@premiumcranes.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <Text style={{ fontSize: 12, color: "#94a3b8" }}>
            Premium Crane Rentals v1.0.0
          </Text>
          <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            © 2026 All Rights Reserved
          </Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#ffffff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 20,
              paddingBottom: insets.bottom + 20,
            }}
          >
            <View
              style={{
                paddingHorizontal: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderColor: "#f1f5f9",
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#1a2332" }}
              >
                {t("selectLanguage")}
              </Text>
            </View>

            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => handleLanguageChange(lang.code)}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderBottomWidth: 1,
                  borderColor: "#f1f5f9",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#1a2332",
                    }}
                  >
                    {lang.nativeName}
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#64748b", marginTop: 2 }}
                  >
                    {lang.name}
                  </Text>
                </View>
                {currentLanguage === lang.code && (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "#FFB800",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#1a2332",
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowLanguageModal(false)}
              style={{
                marginTop: 12,
                marginHorizontal: 20,
                backgroundColor: "#f1f5f9",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "bold", color: "#64748b" }}
              >
                {t("cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { MapPin } from "lucide-react-native";
import { geocodeLocation } from "../utils/geocoding";

function buildMapHTML(lat, lng) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
      <style>
        * { margin: 0; padding: 0; }
        html, body, #map { width: 100%; height: 100%; }
        .leaflet-control-attribution { font-size: 8px; }
      </style>
    </head>
    <body style="background:#f1f5f9">
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: true,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false
        }).setView([${lat}, ${lng}], 15);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '\u00a9 OpenStreetMap'
        }).addTo(map);

        L.marker([${lat}, ${lng}]).addTo(map);
      <\/script>
    </body>
    </html>
  `;
}

export default function OSMMapView({ location, height = 200, style }) {
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      setLoading(true);
      setFailed(false);

      const result = await geocodeLocation(location);

      if (cancelled) return;

      if (result) {
        setRegion(result);
      } else {
        setFailed(true);
      }
      setLoading(false);
    }

    if (location) {
      resolve();
    } else {
      setLoading(false);
      setFailed(true);
    }

    return () => { cancelled = true; };
  }, [location]);

  if (loading) {
    return (
      <View
        style={[{
          height,
          borderRadius: 12,
          backgroundColor: "#f1f5f9",
          alignItems: "center",
          justifyContent: "center",
        }, style]}
      >
        <ActivityIndicator size="small" color="#FFB800" />
        <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
          Loading map…
        </Text>
      </View>
    );
  }

  if (failed || !region) {
    return (
      <View
        style={[{
          height,
          borderRadius: 12,
          backgroundColor: "#f1f5f9",
          alignItems: "center",
          justifyContent: "center",
        }, style]}
      >
        <MapPin color="#94a3b8" size={24} />
        <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
          Map not available
        </Text>
      </View>
    );
  }

  return (
    <View style={[{ height, borderRadius: 12, overflow: "hidden" }, style]}>
      <WebView
        source={{ html: buildMapHTML(region.latitude, region.longitude) }}
        style={{ flex: 1, backgroundColor: "#f1f5f9" }}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        originWhitelist={["*"]}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={false}
      />
    </View>
  );
}

const cache = new Map();

const DEFAULT_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 15,
  longitudeDelta: 15,
};

export async function geocodeLocation(locationText) {
  if (!locationText) return null;

  const key = locationText.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key);

  try {
    const query = encodeURIComponent(`${locationText}, India`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'CraneWalah/1.0 (com.mohammadsaiyed.cranewalah)',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) return null;

    const results = await response.json();
    if (!results || results.length === 0) return null;

    const result = {
      latitude: parseFloat(results[0].lat),
      longitude: parseFloat(results[0].lon),
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };

    cache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

export { DEFAULT_REGION };

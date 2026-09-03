// Weather domain models + provider integration (Open-Meteo, no API key required).
// This lives server-side and is used by the API routes so the frontend only
// ever talks to our own /api endpoints.

export interface CurrentWeather {
  city: string;
  country: string | null;
  latitude: number;
  longitude: number;
  temperature: number; // Celsius
  feelsLike: number; // Celsius
  description: string;
  icon: string; // emoji
  humidity: number; // %
  windSpeed: number; // km/h
  pressure: number; // hPa
  isDay: boolean;
  localTime: string;
}

export interface ForecastDay {
  date: string; // ISO date
  label: string; // e.g. "Mon"
  min: number; // Celsius
  max: number; // Celsius
  description: string;
  icon: string;
}

export interface WeatherBundle {
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export interface GeoResult {
  name: string;
  country: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
}

// WMO weather interpretation codes -> label + emoji.
// https://open-meteo.com/en/docs
const WMO: Record<number, { day: string; night: string; label: string }> = {
  0: { day: "☀️", night: "🌙", label: "Clear sky" },
  1: { day: "🌤️", night: "🌙", label: "Mainly clear" },
  2: { day: "⛅", night: "☁️", label: "Partly cloudy" },
  3: { day: "☁️", night: "☁️", label: "Overcast" },
  45: { day: "🌫️", night: "🌫️", label: "Fog" },
  48: { day: "🌫️", night: "🌫️", label: "Rime fog" },
  51: { day: "🌦️", night: "🌦️", label: "Light drizzle" },
  53: { day: "🌦️", night: "🌦️", label: "Drizzle" },
  55: { day: "🌧️", night: "🌧️", label: "Dense drizzle" },
  56: { day: "🌧️", night: "🌧️", label: "Freezing drizzle" },
  57: { day: "🌧️", night: "🌧️", label: "Freezing drizzle" },
  61: { day: "🌦️", night: "🌦️", label: "Light rain" },
  63: { day: "🌧️", night: "🌧️", label: "Rain" },
  65: { day: "🌧️", night: "🌧️", label: "Heavy rain" },
  66: { day: "🌧️", night: "🌧️", label: "Freezing rain" },
  67: { day: "🌧️", night: "🌧️", label: "Freezing rain" },
  71: { day: "🌨️", night: "🌨️", label: "Light snow" },
  73: { day: "🌨️", night: "🌨️", label: "Snow" },
  75: { day: "❄️", night: "❄️", label: "Heavy snow" },
  77: { day: "🌨️", night: "🌨️", label: "Snow grains" },
  80: { day: "🌦️", night: "🌦️", label: "Rain showers" },
  81: { day: "🌧️", night: "🌧️", label: "Rain showers" },
  82: { day: "⛈️", night: "⛈️", label: "Violent showers" },
  85: { day: "🌨️", night: "🌨️", label: "Snow showers" },
  86: { day: "❄️", night: "❄️", label: "Snow showers" },
  95: { day: "⛈️", night: "⛈️", label: "Thunderstorm" },
  96: { day: "⛈️", night: "⛈️", label: "Thunderstorm, hail" },
  99: { day: "⛈️", night: "⛈️", label: "Thunderstorm, hail" },
};

function describe(code: number, isDay: boolean) {
  const entry = WMO[code] ?? { day: "🌡️", night: "🌡️", label: "Unknown" };
  return { icon: isDay ? entry.day : entry.night, label: entry.label };
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export class WeatherError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

async function fetchJson(url: string) {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new WeatherError("Network error contacting the weather provider.", 502);
  }
  if (!res.ok) {
    throw new WeatherError("The weather provider returned an error.", 502);
  }
  return res.json();
}

// Geocode a free-text city name into coordinates + a list of candidate cities.
export async function geocode(query: string, count = 6): Promise<GeoResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed
  )}&count=${count}&language=en&format=json`;
  const data = await fetchJson(url);
  const results = Array.isArray(data.results) ? data.results : [];
  return results.map(
    (r: {
      name: string;
      country?: string;
      admin1?: string;
      latitude: number;
      longitude: number;
    }) => ({
      name: r.name,
      country: r.country ?? null,
      admin1: r.admin1 ?? null,
      latitude: r.latitude,
      longitude: r.longitude,
    })
  );
}

// Fetch current conditions + daily forecast for coordinates.
export async function getWeather(
  latitude: number,
  longitude: number,
  cityName: string,
  country: string | null
): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "6",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const data = await fetchJson(url);

  if (!data.current || !data.daily) {
    throw new WeatherError("Weather data is unavailable for this location.", 502);
  }

  const c = data.current;
  const isDay = c.is_day === 1;
  const currentDesc = describe(c.weather_code, isDay);

  const current: CurrentWeather = {
    city: cityName,
    country,
    latitude,
    longitude,
    temperature: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    description: currentDesc.label,
    icon: currentDesc.icon,
    humidity: Math.round(c.relative_humidity_2m),
    windSpeed: Math.round(c.wind_speed_10m),
    pressure: Math.round(c.surface_pressure),
    isDay,
    localTime: c.time,
  };

  const d = data.daily;
  const forecast: ForecastDay[] = [];
  const times: string[] = d.time ?? [];
  // Skip index 0 (today) so we show the next 5 days.
  for (let i = 1; i < times.length && forecast.length < 5; i++) {
    const dateStr = times[i];
    const dayDesc = describe(d.weather_code[i], true);
    const dayIdx = new Date(dateStr + "T00:00:00").getDay();
    forecast.push({
      date: dateStr,
      label: DAY_LABELS[dayIdx],
      min: Math.round(d.temperature_2m_min[i]),
      max: Math.round(d.temperature_2m_max[i]),
      description: dayDesc.label,
      icon: dayDesc.icon,
    });
  }

  return { current, forecast };
}

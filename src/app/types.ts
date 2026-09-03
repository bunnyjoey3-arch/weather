export interface CurrentWeather {
  city: string;
  country: string | null;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  isDay: boolean;
  localTime: string;
}

export interface ForecastDay {
  date: string;
  label: string;
  min: number;
  max: number;
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

export interface HistoryRow {
  id: number;
  city: string;
  country: string | null;
  latitude: number;
  longitude: number;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  searchedAt: string;
}

export type Unit = "C" | "F";

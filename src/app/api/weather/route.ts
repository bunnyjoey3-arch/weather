import { db } from "@/db";
import { searchHistory } from "@/db/schema";
import { geocode, getWeather, WeatherError } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim() ?? "";
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");

  try {
    let latitude: number;
    let longitude: number;
    let name = city;
    let country: string | null = searchParams.get("country");

    if (latParam && lonParam) {
      latitude = Number(latParam);
      longitude = Number(lonParam);
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return Response.json({ error: "Invalid coordinates." }, { status: 400 });
      }
      if (!name) name = "Selected location";
    } else {
      if (!city) {
        return Response.json({ error: "City is required." }, { status: 400 });
      }
      const matches = await geocode(city, 1);
      if (matches.length === 0) {
        return Response.json(
          { error: `Could not find a city called "${city}".` },
          { status: 404 }
        );
      }
      const best = matches[0];
      latitude = best.latitude;
      longitude = best.longitude;
      name = best.name;
      country = best.country;
    }

    const bundle = await getWeather(latitude, longitude, name, country);

    // Persist to search history when a database is configured.
    if (db) {
      try {
        await db.insert(searchHistory).values({
          city: bundle.current.city,
          country: bundle.current.country,
          latitude: bundle.current.latitude,
          longitude: bundle.current.longitude,
          temperature: bundle.current.temperature,
          description: bundle.current.description,
          icon: bundle.current.icon,
          humidity: bundle.current.humidity,
          windSpeed: bundle.current.windSpeed,
          pressure: bundle.current.pressure,
        });
      } catch (dbErr) {
        console.error("Failed to save search history:", dbErr);
      }
    }

    return Response.json(bundle);
  } catch (err) {
    const status = err instanceof WeatherError ? err.status : 500;
    const message =
      err instanceof WeatherError
        ? err.message
        : "Unexpected error fetching weather.";
    return Response.json({ error: message }, { status });
  }
}

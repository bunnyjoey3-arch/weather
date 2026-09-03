import { geocode, WeatherError } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return Response.json({ results: [] });
  }

  try {
    const results = await geocode(q);
    return Response.json({ results });
  } catch (err) {
    const status = err instanceof WeatherError ? err.status : 500;
    const message =
      err instanceof WeatherError ? err.message : "Unexpected error.";
    return Response.json({ error: message }, { status });
  }
}

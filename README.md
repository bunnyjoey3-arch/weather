# Weather Dashboard

A Next.js weather app that lets users search for a city, view current conditions, browse a 5-day forecast, and revisit recent searches.

## Features

- Search for cities by name with autocomplete suggestions
- View live current weather from Open-Meteo
- See a 5-day forecast with icons and temperature ranges
- Toggle between Celsius and Fahrenheit
- Save recent searches to PostgreSQL via Drizzle (when configured)
- Responsive dashboard UI built with Next.js and Tailwind-inspired styling

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- PostgreSQL + Drizzle ORM
- Open-Meteo API

## Prerequisites

- Node.js 18+ recommended
- PostgreSQL database (optional for search history persistence)

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   copy .env.example .env.local
   ```

   If you do not want database-backed history, you can skip this step and the app will still run using the weather API.

3. Configure your database if you want search history enabled:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the app in your browser:

   ```text
   http://localhost:3000
   ```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Project Structure

```text
src/
  app/
    api/
      health/
      history/
      search/
      weather/
    components/
    globals.css
    layout.tsx
    page.tsx
    types.ts
  db/
    index.ts
    schema.ts
  lib/
    weather.ts
```

## Notes

- Weather data comes from the free Open-Meteo API.
- Search history persistence is best-effort and only works when `DATABASE_URL` is configured.
- The app can still run and display weather results without a database connection.

## License

This project is provided as-is for learning and demo purposes.

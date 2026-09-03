import { db } from "@/db";
import { searchHistory } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!db) {
    return Response.json({ history: [] });
  }

  try {
    const rows = await db
      .select()
      .from(searchHistory)
      .orderBy(desc(searchHistory.searchedAt))
      .limit(12);
    return Response.json({ history: rows });
  } catch (err) {
    console.error(err);
    return Response.json({ history: [] });
  }
}

export async function DELETE() {
  if (!db) {
    return Response.json({ ok: false }, { status: 503 });
  }

  try {
    await db.delete(searchHistory);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ ok: false }, { status: 500 });
  }
}

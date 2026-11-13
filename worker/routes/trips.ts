import { Hono } from "hono";
import { getAuth } from "@clerk/hono";
import type { CloudflareBindings } from "../env";

const trips = new Hono<{ Bindings: CloudflareBindings }>();

trips.get("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const { results } = await c.env.DB.prepare(
    "SELECT trip_name, image_url, start_date, end_date FROM trips WHERE user_id = ? ORDER BY start_date DESC"
  )
    .bind(userId)
    .all();

  return c.json(results);
});

trips.post("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const { trip_name, daterange, image_url } = await c.req.json<{
    trip_name: string;
    daterange: { from: string; to: string };
    image_url?: string;
  }>();
  // No cover picked → default cover from this env's media base (local R2 in dev, custom domain in prod).
  const cover = image_url || `${c.env.MEDIA_PUBLIC_BASE}/backgrounds/default.webp`;

  const existing = await c.env.DB.prepare(
    "SELECT trip_name FROM trips WHERE user_id = ? AND trip_name = ?"
  )
    .bind(userId, trip_name)
    .first();

  if (existing) {
    return c.json({ error: "Trip Name already taken." }, 409);
  }

  const start = new Date(daterange.from);
  const end = new Date(daterange.to);

  const statements = [
    c.env.DB.prepare(
      "INSERT INTO trips (user_id, trip_name, start_date, end_date, image_url) VALUES (?, ?, ?, ?, ?)"
    ).bind(userId, trip_name, start.toISOString(), end.toISOString(), cover),
  ];

  let day = 1;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1), day++) {
    statements.push(
      c.env.DB.prepare("INSERT INTO logs (user_id, trip, date, day) VALUES (?, ?, ?, ?)").bind(
        userId,
        trip_name,
        d.toLocaleDateString("en-us"),
        day
      )
    );
  }

  await c.env.DB.batch(statements);

  return c.json({ ok: true });
});

trips.patch("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const { trip_name, imageURL } = await c.req.json<{ trip_name: string; imageURL: string }>();

  await c.env.DB.prepare("UPDATE trips SET image_url = ? WHERE user_id = ? AND trip_name = ?")
    .bind(imageURL, userId, trip_name)
    .run();

  return c.json({ ok: true });
});

// Logs/photos are keyed by day number, so shifting the range keeps Day N as Day N
// with a new date. Shrinking is refused if a dropped day has content.
trips.patch("/dates", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const { trip_name, daterange } = await c.req.json<{
    trip_name: string;
    daterange: { from: string; to: string };
  }>();

  const start = new Date(daterange?.from);
  const end = new Date(daterange?.to);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return c.json({ error: "Invalid date range." }, 400);
  }

  const trip = await c.env.DB.prepare("SELECT trip_name FROM trips WHERE user_id = ? AND trip_name = ?")
    .bind(userId, trip_name)
    .first();
  if (!trip) return c.json({ error: "Trip not found." }, 404);

  const dates: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toLocaleDateString("en-us"));
  }
  const newLen = dates.length;

  const { results: blocked } = await c.env.DB.prepare(
    `SELECT day FROM logs WHERE user_id = ? AND trip = ? AND day > ?
       AND (COALESCE(entry, '') != '' OR COALESCE(title, '') != '' OR COALESCE(location, '') != '')
     UNION
     SELECT day FROM photos WHERE user_id = ? AND trip_name = ? AND day > ?
     ORDER BY day`
  )
    .bind(userId, trip_name, newLen, userId, trip_name, newLen)
    .all<{ day: number }>();
  if (blocked.length > 0) {
    const days = blocked.map((r) => r.day).join(", ");
    return c.json({ error: `Day ${days} still has entries or photos. Clear them first.` }, 409);
  }

  const { results: existing } = await c.env.DB.prepare("SELECT day FROM logs WHERE user_id = ? AND trip = ?")
    .bind(userId, trip_name)
    .all<{ day: number }>();
  const existingDays = new Set(existing.map((r) => r.day));

  const statements = [
    c.env.DB.prepare("DELETE FROM logs WHERE user_id = ? AND trip = ? AND day > ?").bind(userId, trip_name, newLen),
    c.env.DB.prepare("UPDATE trips SET start_date = ?, end_date = ? WHERE user_id = ? AND trip_name = ?").bind(
      start.toISOString(),
      end.toISOString(),
      userId,
      trip_name
    ),
  ];
  dates.forEach((date, i) => {
    const day = i + 1;
    statements.push(
      existingDays.has(day)
        ? c.env.DB.prepare("UPDATE logs SET date = ? WHERE user_id = ? AND trip = ? AND day = ?").bind(
            date,
            userId,
            trip_name,
            day
          )
        : c.env.DB.prepare("INSERT INTO logs (user_id, trip, date, day) VALUES (?, ?, ?, ?)").bind(
            userId,
            trip_name,
            date,
            day
          )
    );
  });

  await c.env.DB.batch(statements);

  return c.json({ ok: true, start_date: start.toISOString(), end_date: end.toISOString() });
});

trips.delete("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const { trip_name } = await c.req.json<{ trip_name: string }>();

  await c.env.DB.prepare("DELETE FROM trips WHERE user_id = ? AND trip_name = ?")
    .bind(userId, trip_name)
    .run();

  return c.json({ ok: true });
});

export default trips;

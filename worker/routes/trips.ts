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
    image_url: string;
  }>();

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
    ).bind(userId, trip_name, start.toISOString(), end.toISOString(), image_url),
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

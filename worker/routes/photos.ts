import { Hono } from "hono";
import { getAuth } from "@clerk/hono";
import type { CloudflareBindings } from "../env";

const photos = new Hono<{ Bindings: CloudflareBindings }>();

photos.get("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const trip_name = c.req.query("trip_name");
  const start_day = Number(c.req.query("start_day"));
  const end_day = Number(c.req.query("end_day"));
  if (!trip_name) return c.text("trip_name is required", 400);

  const query =
    end_day !== -1
      ? c.env.DB.prepare(
          "SELECT day, imageURL, lat, long, area FROM photos WHERE user_id = ? AND trip_name = ? AND day >= ? AND day <= ?"
        ).bind(userId, trip_name, start_day, end_day)
      : c.env.DB.prepare(
          "SELECT day, imageURL, lat, long, area FROM photos WHERE user_id = ? AND trip_name = ? AND day = ?"
        ).bind(userId, trip_name, start_day);

  const { results } = await query.all();

  return c.json(results);
});

photos.post("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const { trip_name, day, imageURL, lat, long, area } = await c.req.json<{
    trip_name: string;
    day: number;
    imageURL: string;
    lat: number | null;
    long: number | null;
    area: string | null;
  }>();

  await c.env.DB.prepare(
    "INSERT INTO photos (user_id, day, trip_name, imageURL, lat, long, area) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(userId, day, trip_name, imageURL, lat ?? null, long ?? null, area ?? null)
    .run();

  return c.json({ ok: true });
});

photos.patch("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const { trip_name, imageURL, lat, long, area } = await c.req.json<{
    trip_name: string;
    imageURL: string;
    lat: number;
    long: number;
    area: string;
  }>();

  await c.env.DB.prepare(
    "UPDATE photos SET lat = ?, long = ?, area = ? WHERE user_id = ? AND trip_name = ? AND imageURL = ?"
  )
    .bind(lat, long, area, userId, trip_name, imageURL)
    .run();

  return c.json({ ok: true });
});

photos.delete("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const { trip_name, day, imageURL } = await c.req.json<{
    trip_name: string;
    day: number;
    imageURL: string;
  }>();

  await c.env.DB.prepare(
    "DELETE FROM photos WHERE user_id = ? AND trip_name = ? AND day = ? AND imageURL = ?"
  )
    .bind(userId, trip_name, day, imageURL)
    .run();

  return c.json({ ok: true });
});

export default photos;

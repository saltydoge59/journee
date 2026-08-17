import { Hono } from "hono";
import { getAuth } from "@clerk/hono";
import type { CloudflareBindings } from "../env";

const logs = new Hono<{ Bindings: CloudflareBindings }>();

logs.get("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const trip_name = c.req.query("trip_name");
  const day = c.req.query("day");
  if (!trip_name) return c.text("trip_name is required", 400);

  if (day !== undefined) {
    const log = await c.env.DB.prepare(
      "SELECT entry, title, location FROM logs WHERE user_id = ? AND trip = ? AND day = ?"
    )
      .bind(userId, trip_name, Number(day))
      .first();
    return c.json(log ?? null);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT entry, title, day FROM logs WHERE user_id = ? AND trip = ? ORDER BY day ASC"
  )
    .bind(userId, trip_name)
    .all();

  return c.json(results);
});

logs.patch("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const { trip_name, day, entry, title, loc } = await c.req.json<{
    trip_name: string;
    day: number;
    entry: string;
    title: string;
    loc: string;
  }>();

  await c.env.DB.prepare(
    "UPDATE logs SET entry = ?, title = ?, location = ? WHERE user_id = ? AND day = ? AND trip = ?"
  )
    .bind(entry, title, loc, userId, day, trip_name)
    .run();

  return c.json({ ok: true });
});

export default logs;

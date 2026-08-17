import { Hono } from "hono";
import { getAuth } from "@clerk/hono";
import type { CloudflareBindings } from "../env";

const users = new Hono<{ Bindings: CloudflareBindings }>();

users.post("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const { username } = await c.req.json<{ username: string }>();

  const existing = await c.env.DB.prepare("SELECT user_id FROM users WHERE user_id = ?")
    .bind(userId)
    .first();

  if (!existing) {
    await c.env.DB.prepare("INSERT INTO users (user_id, username, created_at) VALUES (?, ?, ?)")
      .bind(userId, username, new Date().toISOString())
      .run();
  }

  return c.json({ ok: true });
});

export default users;

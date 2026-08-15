import { auth } from "@clerk/nextjs/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { username } = (await req.json()) as { username: string };
  const { env } = await getCloudflareContext({ async: true });

  const existing = await env.DB
    .prepare("SELECT user_id FROM users WHERE user_id = ?")
    .bind(userId)
    .first();

  if (!existing) {
    await env.DB
      .prepare("INSERT INTO users (user_id, username, created_at) VALUES (?, ?, ?)")
      .bind(userId, username, new Date().toISOString())
      .run();
  }

  return Response.json({ ok: true });
}

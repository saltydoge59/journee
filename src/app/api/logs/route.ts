import { auth } from "@clerk/nextjs/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const trip_name = searchParams.get("trip_name");
  const day = searchParams.get("day");
  if (!trip_name) return new Response("trip_name is required", { status: 400 });

  const { env } = await getCloudflareContext({ async: true });

  if (day !== null) {
    const log = await env.DB
      .prepare(
        "SELECT entry, title, location FROM logs WHERE user_id = ? AND trip = ? AND day = ?"
      )
      .bind(userId, trip_name, Number(day))
      .first();
    return Response.json(log ?? null);
  }

  const { results } = await env.DB
    .prepare(
      "SELECT entry, title, day FROM logs WHERE user_id = ? AND trip = ? ORDER BY day ASC"
    )
    .bind(userId, trip_name)
    .all();

  return Response.json(results);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { trip_name, day, entry, title, loc } = (await req.json()) as {
    trip_name: string;
    day: number;
    entry: string;
    title: string;
    loc: string;
  };
  const { env } = await getCloudflareContext({ async: true });

  await env.DB
    .prepare(
      "UPDATE logs SET entry = ?, title = ?, location = ? WHERE user_id = ? AND day = ? AND trip = ?"
    )
    .bind(entry, title, loc, userId, day, trip_name)
    .run();

  return Response.json({ ok: true });
}

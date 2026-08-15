import { auth } from "@clerk/nextjs/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { env } = await getCloudflareContext({ async: true });
  const { results } = await env.DB
    .prepare(
      "SELECT trip_name, image_url, start_date, end_date FROM trips WHERE user_id = ? ORDER BY start_date DESC"
    )
    .bind(userId)
    .all();

  return Response.json(results);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { trip_name, daterange, image_url } = (await req.json()) as {
    trip_name: string;
    daterange: { from: string; to: string };
    image_url: string;
  };
  const { env } = await getCloudflareContext({ async: true });

  const existing = await env.DB
    .prepare("SELECT trip_name FROM trips WHERE user_id = ? AND trip_name = ?")
    .bind(userId, trip_name)
    .first();

  if (existing) {
    return Response.json({ error: "Trip Name already taken." }, { status: 409 });
  }

  const start = new Date(daterange.from);
  const end = new Date(daterange.to);

  const statements = [
    env.DB
      .prepare(
        "INSERT INTO trips (user_id, trip_name, start_date, end_date, image_url) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(userId, trip_name, start.toISOString(), end.toISOString(), image_url),
  ];

  let day = 1;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1), day++) {
    statements.push(
      env.DB
        .prepare("INSERT INTO logs (user_id, trip, date, day) VALUES (?, ?, ?, ?)")
        .bind(userId, trip_name, d.toLocaleDateString("en-us"), day)
    );
  }

  await env.DB.batch(statements);

  return Response.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { trip_name, imageURL } = (await req.json()) as { trip_name: string; imageURL: string };
  const { env } = await getCloudflareContext({ async: true });

  await env.DB
    .prepare("UPDATE trips SET image_url = ? WHERE user_id = ? AND trip_name = ?")
    .bind(imageURL, userId, trip_name)
    .run();

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { trip_name } = (await req.json()) as { trip_name: string };
  const { env } = await getCloudflareContext({ async: true });

  await env.DB
    .prepare("DELETE FROM trips WHERE user_id = ? AND trip_name = ?")
    .bind(userId, trip_name)
    .run();

  return Response.json({ ok: true });
}

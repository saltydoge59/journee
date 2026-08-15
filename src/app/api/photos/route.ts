import { auth } from "@clerk/nextjs/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const trip_name = searchParams.get("trip_name");
  const start_day = Number(searchParams.get("start_day"));
  const end_day = Number(searchParams.get("end_day"));
  if (!trip_name) return new Response("trip_name is required", { status: 400 });

  const { env } = await getCloudflareContext({ async: true });

  const query =
    end_day !== -1
      ? env.DB
          .prepare(
            "SELECT day, imageURL, lat, long, area FROM photos WHERE user_id = ? AND trip_name = ? AND day >= ? AND day <= ?"
          )
          .bind(userId, trip_name, start_day, end_day)
      : env.DB
          .prepare(
            "SELECT day, imageURL, lat, long, area FROM photos WHERE user_id = ? AND trip_name = ? AND day = ?"
          )
          .bind(userId, trip_name, start_day);

  const { results } = await query.all();
  return Response.json(results);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { trip_name, day, imageURL, lat, long, area } = (await req.json()) as {
    trip_name: string;
    day: number;
    imageURL: string;
    lat: number | null;
    long: number | null;
    area: string | null;
  };
  const { env } = await getCloudflareContext({ async: true });

  await env.DB
    .prepare(
      "INSERT INTO photos (user_id, day, trip_name, imageURL, lat, long, area) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(userId, day, trip_name, imageURL, lat ?? null, long ?? null, area ?? null)
    .run();

  return Response.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { trip_name, imageURL, lat, long, area } = (await req.json()) as {
    trip_name: string;
    imageURL: string;
    lat: number;
    long: number;
    area: string;
  };
  const { env } = await getCloudflareContext({ async: true });

  await env.DB
    .prepare(
      "UPDATE photos SET lat = ?, long = ?, area = ? WHERE user_id = ? AND trip_name = ? AND imageURL = ?"
    )
    .bind(lat, long, area, userId, trip_name, imageURL)
    .run();

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { trip_name, day, imageURL } = (await req.json()) as {
    trip_name: string;
    day: number;
    imageURL: string;
  };
  const { env } = await getCloudflareContext({ async: true });

  await env.DB
    .prepare(
      "DELETE FROM photos WHERE user_id = ? AND trip_name = ? AND day = ? AND imageURL = ?"
    )
    .bind(userId, trip_name, day, imageURL)
    .run();

  return Response.json({ ok: true });
}

import { auth } from "@clerk/nextjs/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const PUBLIC_BASE = "https://pub-d8966727b726431389106312061035a7.r2.dev";

// Mirrors the old Supabase Storage path shapes so existing R2 keys keep working:
// backgrounds/<userId>/<ts>_<filename>  and  photos/<userId>/<trip>/<day>/<ts>_<filename>
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const bucketName = form.get("bucketName") as string | null; // "backgrounds" | "photos"
  const trip_name = form.get("trip_name") as string | null;
  const day = form.get("day") as string | null;

  if (!file || !bucketName) {
    return new Response("file and bucketName are required", { status: 400 });
  }

  const key =
    bucketName === "photos"
      ? `photos/${userId}/${trip_name}/${day}/${Date.now()}_${file.name}`
      : `backgrounds/${userId}/${Date.now()}_${file.name}`;

  const { env } = await getCloudflareContext({ async: true });
  await env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return Response.json({ imageURL: `${PUBLIC_BASE}/${key}` });
}

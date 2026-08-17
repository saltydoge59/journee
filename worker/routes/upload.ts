import { Hono } from "hono";
import { getAuth } from "@clerk/hono";
import type { CloudflareBindings } from "../env";

const PUBLIC_BASE = "https://pub-d8966727b726431389106312061035a7.r2.dev";

const upload = new Hono<{ Bindings: CloudflareBindings }>();

// Mirrors the old Supabase Storage path shapes so existing R2 keys keep working:
// backgrounds/<userId>/<ts>_<filename>  and  photos/<userId>/<trip>/<day>/<ts>_<filename>
upload.post("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const form = await c.req.formData();
  const file = form.get("file") as File | null;
  const bucketName = form.get("bucketName") as string | null; // "backgrounds" | "photos"
  const trip_name = form.get("trip_name") as string | null;
  const day = form.get("day") as string | null;

  if (!file || !bucketName) {
    return c.text("file and bucketName are required", 400);
  }

  const key =
    bucketName === "photos"
      ? `photos/${userId}/${trip_name}/${day}/${Date.now()}_${file.name}`
      : `backgrounds/${userId}/${Date.now()}_${file.name}`;

  await c.env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return c.json({ imageURL: `${PUBLIC_BASE}/${key}` });
});

export default upload;

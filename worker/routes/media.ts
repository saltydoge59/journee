import { Hono } from "hono";
import type { CloudflareBindings } from "../env";

// ponytail: local-only R2 passthrough so MEDIA_PUBLIC_BASE=/media renders
// uploads against the Miniflare-emulated bucket in `npm run dev`. Prod
// serves R2 directly via the journee-media.curteisyang.uk custom domain,
// so this route is unused there.
const media = new Hono<{ Bindings: CloudflareBindings }>();

media.get("/*", async (c) => {
  const key = c.req.path.replace(/^\/media\//, "");
  const object = await c.env.MEDIA.get(key);
  if (!object) return c.text("Not found", 404);

  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
    },
  });
});

export default media;

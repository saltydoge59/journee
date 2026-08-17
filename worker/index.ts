import { Hono } from "hono";
import { clerkMiddleware } from "@clerk/hono";
import type { CloudflareBindings } from "./env";
import users from "./routes/users";
import trips from "./routes/trips";
import logs from "./routes/logs";
import photos from "./routes/photos";
import upload from "./routes/upload";
import geo from "./routes/geo";
import media from "./routes/media";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("/api/*", (c, next) =>
  clerkMiddleware({
    secretKey: c.env.CLERK_SECRET_KEY,
    publishableKey: c.env.CLERK_PUBLISHABLE_KEY,
  })(c, next)
);

app.route("/api/users", users);
app.route("/api/trips", trips);
app.route("/api/logs", logs);
app.route("/api/photos", photos);
app.route("/api/upload", upload);
app.route("/api/geo", geo);
app.route("/media", media);

app.all("/api/*", (c) => c.text("Not found", 404));

// SPA fallback — anything not matched above is a client route, served from static assets.
app.get("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;

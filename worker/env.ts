export type CloudflareBindings = {
  DB: D1Database;
  MEDIA: R2Bucket;
  AI: Ai;
  ASSETS: Fetcher;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  MEDIA_PUBLIC_BASE: string;
};

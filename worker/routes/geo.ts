import { Hono } from "hono";
import { getAuth } from "@clerk/hono";
import type { CloudflareBindings } from "../env";

const geo = new Hono<{ Bindings: CloudflareBindings }>();

// Llama models often wrap JSON in prose ("Sure, here's the location: {...}") despite
// instructions not to, unlike Gemini. Pull out the first {...} object rather than
// assuming the whole response is JSON.
function cleanJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  return (match ? match[0] : text).trim();
}

// Workers AI text/vision models can return a plain string, or an object whose `response`
// is either a string (parse as JSON below) or already a parsed JSON object/array (use as-is).
function extractResponseJson(result: unknown): unknown {
  const response =
    typeof result === "string"
      ? result
      : result && typeof result === "object" && "response" in result
        ? (result as { response: unknown }).response
        : undefined;

  if (typeof response === "string") return JSON.parse(cleanJson(response));
  if (response && typeof response === "object") return response;
  throw new Error("Unexpected Workers AI response shape");
}

// mode "photo": locate a place from an uploaded image + location hint (day/editlog.tsx)
// mode "text":  geocode a place name to coordinates (snapspot/page.tsx)
geo.post("/", async (c) => {
  const { userId } = getAuth(c) ?? {};
  if (!userId) return c.text("Unauthorized", 401);

  const form = await c.req.formData();
  const mode = form.get("mode") as string | null;

  if (mode === "text") {
    const location = form.get("location") as string;
    const prompt = `Give me the lattitude and longitude of ${location}. Provide the most accurate coordinates possible. Respond with ONLY a JSON object in the format {"coordinates":[lattitude,longitude]}. No other text.`;
    try {
      const result = await c.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      return c.json(extractResponseJson(result));
    } catch (error) {
      console.error("Error generating content:", error);
      return c.text("Failed to process the location data.", 500);
    }
  }

  if (mode === "photo") {
    const location = form.get("location") as string;
    const photo = form.get("photo") as File;
    const imageBytes = await photo.arrayBuffer();
    const image = [...new Uint8Array(imageBytes)];
    const prompt = `This is an image of somewhere in ${location}.
    Use any landmarks, signs, languages, mountain ranges or hints in each image to tell me where this photo is likely to be taken.
    You may use any metadata that the photo provides as well.
    Give me the name of the area which is easily understandable, and also the lattitude and longitude of the area.
    Provide the most accurate coordinates possible.
    Respond with ONLY a JSON object in the format {"area":string,"coordinates":[lattitude,longitude]}.
    Do not include any other text, explanation, or commentary in the reply.`;
    try {
      const result = await c.env.AI.run("@cf/meta/llama-3.2-11b-vision-instruct", {
        prompt,
        image,
      });
      return c.json(extractResponseJson(result));
    } catch (error) {
      console.error("Error generating content:", error);
      return c.text("Failed to process the location data.", 500);
    }
  }

  return c.text("mode must be 'photo' or 'text'", 400);
});

export default geo;

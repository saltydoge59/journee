import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function cleanJson(text: string) {
  return text
    .replace(/```json\s*/i, "")
    .replace(/```$/, "")
    .trim()
    .replace(/\r?\n|\r/g, "");
}

// mode "photo": locate a place from an uploaded image + location hint (day/editlog.tsx)
// mode "text":  geocode a place name to coordinates (snapspot/page.tsx)
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { env } = await getCloudflareContext({ async: true });
  const genAI = new GoogleGenerativeAI(env.NEXT_PUBLIC_Gemini_API);

  const form = await req.formData();
  const mode = form.get("mode") as string | null;

  if (mode === "text") {
    const location = form.get("location") as string;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Give me the lattitude and longitude of ${location}. Provide the most accurate coordinates possible. Structure the response in the following format:{"coordinates":[lattitude,longitude]}.Do not include backticks in the result nor the json opening.`;
    try {
      const result = await model.generateContent([prompt]);
      return Response.json(JSON.parse(cleanJson(result.response.text())));
    } catch (error) {
      console.error("Error generating content:", error);
      return new Response("Failed to process the location data.", { status: 500 });
    }
  }

  if (mode === "photo") {
    const location = form.get("location") as string;
    const photo = form.get("photo") as File;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const imageBytes = await photo.arrayBuffer();
    const base64Image = Buffer.from(imageBytes).toString("base64");
    const prompt = `This is an image of somewhere in ${location}.
    Use any landmarks, signs, languages, mountain ranges or hints in each image to tell me where this photo is likely to be taken.
    You may use any metadata that the photo provides as well.
    Give me the name of the area which is easily understandable, and also the lattitude and longitude of the area.
    Provide the most accurate coordinates possible.
    Structure the response in the following format:{"area":string,"coordinates":[lattitude,longitude]}.
    DO NOT have any other responses in the reply.`;
    try {
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Image, mimeType: photo.type } },
      ]);
      return Response.json(JSON.parse(cleanJson(result.response.text())));
    } catch (error) {
      console.error("Error generating content:", error);
      return new Response("Failed to process the location data.", { status: 500 });
    }
  }

  return new Response("mode must be 'photo' or 'text'", { status: 400 });
}

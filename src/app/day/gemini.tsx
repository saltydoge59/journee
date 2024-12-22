"use client"

import { GoogleGenerativeAI } from "@google/generative-ai";


export default async function getLocation(photo:File,location:string) {
    const apiKey = process.env.NEXT_PUBLIC_Gemini_API || "";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const imageBytes = await photo.arrayBuffer();
    const base64Image = Buffer.from(imageBytes).toString('base64');
    
    const prompt = `This is an image of somewhere in ${location}. Use any landmarks, signs, languages, mountain ranges or hints in each image to tell me where this photo is likely to be taken. You may use any metadata that the photo provides as well. Give me the name of the area which is easily understandable, and also the lattitude and longitude of the area. Provide the most accurate coordinates possible. Structure the response in the following format:{"area":string,"coordinates":[lattitude,longitude]}`;
    try{
        const result = await model.generateContent([
            prompt,
            {
                inlineData:{
                    data:base64Image,
                    mimeType: photo.type,
                }
            }
        ]);
        // console.log(result.response.text());
        const cleanedJsonString = result.response.text()
        .replace(/```json\s*/, '') // Remove opening ```json
        .replace(/```$/, '');      // Remove closing 
        console.log(cleanedJsonString);
        const info = JSON.parse(cleanedJsonString);
        return info
    }
    catch(error){
        console.error("Error generating content:", error);
        throw new Error("Failed to process the location data.");
    }

    
}
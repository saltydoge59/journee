"use client"

import { GoogleGenerativeAI } from "@google/generative-ai";


export default async function getCoords(location:string) {
    const apiKey = process.env.NEXT_PUBLIC_Gemini_API || "";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Give me the lattitude and longitude of ${location}. Provide the most accurate coordinates possible. Structure the response in the following format:{"coordinates":[lattitude,longitude]}.Do not include backticks in the result nor the json opening.`;
    try{
        const result = await model.generateContent([
            prompt
        ]);
        // console.log(result.response.text());
        const cleanedJsonString = result.response.text()
        .replace(/```json\s*/i, '') // Remove opening ```json
        .replace(/```$/, '')      // Remove closing 
        .trim()
        .replace(/\r?\n|\r/g, '') // Remove newlines
        // console.log(cleanedJsonString);
        const info = JSON.parse(cleanedJsonString);
        return info
    }
    catch(error){
        console.error("Error generating content:", error);
        throw new Error("Failed to process the location data.");
    }

    
}
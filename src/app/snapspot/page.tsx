"use client";

import { useTheme } from "next-themes";
import BlurFade from "@/components/ui/blur-fade";
import { FileUpload2 } from "@/components/ui/file-upload2";
import { Label } from "@/components/ui/label";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useState, useRef } from "react";
import {
  GeoapifyContext,
  GeoapifyGeocoderAutocomplete,
} from "@geoapify/react-geocoder-autocomplete";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import RingLoader from "react-spinners/ClipLoader";
import "./round-borders.dark.css"

export default function Snapspot() {
    const { resolvedTheme } = useTheme();

    const { toast } = useToast();
    const geoapify_key = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "";
    const [selectedPlace, setSelectedPlace] = useState<string>("");

    const fileUploadRef = useRef<{ resetFiles: () => void }>(null);
    const handlePlaceSelect = (place: any) => {
        setSelectedPlace(place.properties.formatted);
        // You can access the selected place details here
        console.log("Selected place:", place.properties.formatted);
    };
    const [photos,setPhotos] = useState<File[]>([]);
    const [previewURL, setPreviewURL] = useState<string>("");

    const apiKey = process.env.NEXT_PUBLIC_Gemini_API || "";
    // Handle file selection
    const handlePhotoUpload = (files:File[]) => {
        const uploadedFiles = files;
        setPhotos(uploadedFiles); 
        setSelectedPlace("");
        setPreviewURL(URL.createObjectURL(files[0]));
        console.log(uploadedFiles);
    };
    const handleReset = () => {
        fileUploadRef.current?.resetFiles(); // Call the resetFiles function
      };


    const findPlace = async ()=>{
        toast({duration:2000,
            title:"Finding location...Please wait",
            action:<RingLoader loading={true} color={'green'}/>
          })
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const imageBytes = await photos[0].arrayBuffer();
        const base64Image = Buffer.from(imageBytes).toString('base64');
        let country = selectedPlace===""?"the world":selectedPlace;

        const prompt = `This is an image of somewhere in ${country}. Use any landmarks, signs, languages, mountain ranges or hints in the image to tell me where this photo is likely to be taken. You may use any metadata that the photo provides as well. Do not give me the coordinates of the location, give me the name of the area which is easily understandable. Structure the response in the following format:{"location":string}`;
        const result = await model.generateContent([
            prompt,
            {
            inlineData:{
                data: base64Image,
                mimeType: photos[0].type,
            }
        }]);
        // console.log(result.response.text());
        const cleanedJsonString = result.response.text()
        .replace(/```json\s*/, '') // Remove opening ```json
        .replace(/```$/, '');      // Remove closing 
        console.log(cleanedJsonString);

        const loc = JSON.parse(cleanedJsonString);
        setLocation(loc.location);
        
    }

    function resetSelection(){
        setLocation("");
        setPreviewURL("");
        setPhotos([]);
        handleReset();
    }

    const targetRef = useRef<HTMLDivElement | null>(null);
    const [location, setLocation] = useState<string>("");

    useEffect(()=>{
        if(targetRef.current){
            targetRef.current.scrollIntoView({behavior:"smooth"});
        }
    },[location])

    
  return (
    <div>
      <div className="flex flex-col justify-center items-center h-full pt-10 pb-28 md:pt-20 lg:pt-28 gap-10">
        <BlurFade inView delay={0.25}>
          <h1 className="text-6xl lg:text-8xl text-center font-bold">
            Snapspot
          </h1>
          <BlurFade
            inView
            delay={0.25 * 2}
            className="w-screen flex justify-center items-center mt-5"
          >
            <span className="text-center text-xl">
              Your personal spot finder.
            </span>
          </BlurFade>
        </BlurFade>
        <BlurFade inView delay={0.25 * 3}>
          <div className="flex flex-col w-screen justify-center items-center gap-4">
            <FileUpload2 ref={fileUploadRef} onChange={handlePhotoUpload}/>
            <div className="w-96">
              <Label className="text-start font-bold" htmlFor="location">
                Country (Optional)
              </Label>
              <GeoapifyContext apiKey={geoapify_key} className="w-full">
                <GeoapifyGeocoderAutocomplete
                  placeholder="e.g. Niseko, Japan"
                  placeSelect={handlePlaceSelect}
                />
              </GeoapifyContext>
            </div>
            <Button onClick={findPlace} className="bg-gradient-to-r from-indigo-500 to-purple-500 font-bold text-white hover:brightness-90 w-36" disabled={photos.length==0}>Go!</Button>
          </div>
        </BlurFade>
      </div>

      <div ref={targetRef} className={`h-screen w-screen flex flex-col ${location==""?"hidden":""}`}>
        <div className="my-auto">
            <BlurFade inView delay={0.25*2} className="w-full h-full flex justify-center items-center flex-col pb-20 md:pb-0">
                <img src={previewURL} className="rounded-lg mx-auto w-1/2"/>
                <h1 className="text-3xl lg:text-6xl text-center font-bold p-5">{location}</h1>
                <Button onClick={resetSelection} className="bg-gradient-to-r from-indigo-500 to-purple-500 font-bold text-white hover:brightness-90">Reset</Button>  
            </BlurFade>
        </div>
  
      </div>
    </div>
  );
}

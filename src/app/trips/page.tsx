"use client"

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getTrips, insertUser } from "../../../utils/supabaseRequest";
import Link from "next/link";
import BlurFade from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import RingLoader from "react-spinners/ClipLoader";


export default function Trips() {
    const { toast } = useToast();
    const { userId, getToken } = useAuth(); // Destructure userId and getToken from useAuth
    const { user } = useUser(); // Destructure user object from useUser to access user details
    const username = user?.username;
    const [trips, setTrips] = useState<{ trip_name:string;image_url:string,start_date:string,end_date:string}[]>([]);

    useEffect(() => {
        const initializeUserAndFetchTrips = async () => {
          try {
            const token = await getToken({ template: "supabase" }); // Fetch the token
            if (userId && token) {
              if (username) {
                const error = await insertUser({ userId, token, username }); // Insert user
                if (error) {
                  console.error("Error inserting user:", error);
                  return; // Exit if user insertion fails
                }
                console.log("User inserted successfully");
              }
      
              const trips = await getTrips({ userId, token }); // Fetch trips
              if (trips) {
                setTrips(trips);
                console.log(trips);
              } else {
                console.error("No trips found.");
              }
            } else {
              console.error("User ID or token is missing.");
            }
          } catch (error) {
            console.error("Error during initialization:", error);
          }
        };
      
        initializeUserAndFetchTrips();
      }, [userId, getToken, username]); // Dependencies
      
    function handleClick(){
      toast({
        title:"Redirecting...Please Wait",
        action:<RingLoader loading={true} color={'green'}/>
      })
    }

    return (
    
    <div className="h-screen w-screen">
        <BlurFade delay={0.25} inView className={`${trips.length!==0?`hidden`:""} h-screen`}>
            <div className="h-screen w-full flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <span className="text-4xl">😴</span>
                    <h4 className="mt-1">No Trips yet...</h4>
                    <button className="p-[3px] relative mt-4 block mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
                        <div className="px-8 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent md:text-lg text-md">
                            <Link href="/add_trip">
                                Add Trip
                            </Link>
                        </div>
                    </button>
                </div>
            </div>
        </BlurFade>
        <BlurFade delay={0.25} inView className={`${trips.length!==0?"":"hidden"} h-screen`}>
            <div className="flex flex-wrap justify-center h-screen pb-24 sm:pb-0">
              {trips.map((trip, index) => (
              <Link href={{
              pathname:"/dates",
              query:{
                name:trip.trip_name,
                start:trip.start_date,
                end:trip.end_date,
              }
              }} key={index} className="mx-auto rounded-full w-11/12 sm:w-5/6 mt-3 h-1/2">
                <div style={{backgroundImage:`url(${trip.image_url})`}}
                className={cn(
                    "group w-full cursor-pointer overflow-hidden relative card h-full rounded-md shadow-xl mx-auto flex flex-col justify-end p-4 border",
                    `bg-cover`
                )}
                >
                  <div className="text relative z-50 h-full flex items-center">
                    <h1 className="font-black text-4xl text-white drop-shadow-2xl relative">
                        {trip.trip_name}
                    </h1>
                  </div>
                </div>
              </Link>
              ))}
            </div>
        </BlurFade>
        <button onClick={handleClick} className={`fixed bottom-16 sm:bottom-3 right-2 sm:right-6 px-5 p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-3xl font-bold text-white tracking-widest transform hover:scale-105 hover:bg-[#21e065] transition-colors duration-200 ${trips.length===0?"hidden":""}`}>
          <Link href="/add_trip">
            +
          </Link>
        </button>
    </div>
    )
}
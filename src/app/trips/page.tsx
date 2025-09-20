"use client"

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getTrips, insertUser } from "../../../utils/supabaseRequest";
import BlurFade from "@/components/ui/blur-fade";
import { useToast } from "@/hooks/use-toast";
import RingLoader from "react-spinners/ClipLoader";
import EmptyState from "@/components/EmptyState";
import TripCard from "@/components/TripCard";
import FloatingActionButton from "@/components/FloatingActionButton";


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
            if(!userId || !token) return;
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
        <EmptyState
          emoji="😴"
          title="No Trips yet..."
          actionText="Add Trip"
          actionHref="/add_trip"
          className={trips.length !== 0 ? "hidden" : ""}
        />
        <BlurFade delay={0.25} inView className={`${trips.length!==0?"":"hidden"} h-screen`}>
            <div className="flex flex-wrap justify-center h-screen pb-24 sm:pb-0">
              {trips.map((trip, index) => (
                <TripCard
                  key={index}
                  trip={trip}
                  href={{
                    pathname: "/dates",
                    query: {
                      name: trip.trip_name,
                      start: trip.start_date,
                      end: trip.end_date,
                    }
                  }}
                />
              ))}
            </div>
        </BlurFade>
        <FloatingActionButton
          href="/add_trip"
          onClick={handleClick}
          visible={trips.length !== 0}
        >
          +
        </FloatingActionButton>
    </div>
    )
}
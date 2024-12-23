"use client"

import { Map } from "@/components/map";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@clerk/nextjs"
import { getAllLogs, getPhotos, getTrips } from "../../../utils/supabaseRequest";
import { useState, useEffect } from "react";
import MinimumDistanceSlider from "@/components/ui/slider";


function MyPage() {
    const { userId, getToken } = useAuth();
    const [trips, setTrips] = useState<{ trip_name:string;image_url:string,start_date:string,end_date:string}[]>([]);
    const [selectedTrip, setSelectedTrip] = useState("");
    const[startDay, setStartDay] = useState(1);
    const[endDay, setEndDay] = useState(30);
    const [selectedStart, setSelectedStart] = useState(startDay);
    const [selectedEnd, setSelectedEnd] = useState(endDay);
    const [pins, setPins] = useState<{day:number,imageURL:string,lat:number,long:number,area:string}[]>([]);


    const retrieveTrips = async ()=>{
        if(!userId) return;
        try{
            const token = await getToken({ template: "supabase" }) || "";
            if(userId){
                const trips = await getTrips({userId,token});
                if (trips) {
                    setTrips(trips);
                    console.log(trips);
                    
                } else {
                console.error("No trips found.");
                }
            }
            else{
                console.error("User ID or token missing.")
            }
        }
        catch(error){
            console.error('Failed to retrieve trips.', error )
        }
    }

    const retrievePhotos = async () =>{
        if(!userId || !selectedTrip) return;
        try{
            const token = await getToken({ template: "supabase" }) || "";
            if(userId){
                const photoInfo = await getPhotos({userId,token,trip_name:selectedTrip,start_day:selectedStart,end_day:selectedEnd})||[];
                setPins(photoInfo);
                console.log(photoInfo);
            }
            else{
                console.error("User ID or token missing.")
            }
        }
        catch(error){
            console.error('Failed to retrieve photos.', error )
        }
    }

    const retrieveDays = async()=>{
        if(!userId || !selectedTrip) return;
        try{
            const token = await getToken({ template: "supabase" }) || "";
            if(userId){
                const logs = await getAllLogs({userId,token,trip_name:selectedTrip})||[];
                console.log(logs)
                setStartDay(logs[0].day);
                setEndDay(logs[logs.length -1].day);
            }
            else{
                console.error("User ID missing.")
            }
        }
        catch(error){
            console.error('Failed to retrieve selected trip logs.', error )
        }
    }

    useEffect(()=>{
        if(userId){
            retrieveTrips();
        }
    },[userId])

    useEffect(()=>{
        retrieveDays();
    },[selectedTrip])

    useEffect(()=>{
        retrievePhotos()
    },[selectedStart,selectedEnd,selectedTrip])

    const handleValueChange = (values: number[]) => {
        console.log('Selected values:', values);
        setSelectedStart(values[0]);
        values[0]===values[1]?setSelectedEnd(-1):setSelectedEnd(values[1]);
      };

    const handleTripChange = (value:string)=>{
        console.log(value);
        setSelectedTrip(value);
    }

  return (
    <div>
        <div className="m-3 font-bold flex sm:flex-row flex-col gap-5">
            <div>
                <h1>Trips</h1>
                <Select onValueChange={handleTripChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Trip"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Trips</SelectLabel>
                            {trips.map((trip,index)=>(
                                <SelectItem value={trip.trip_name}>{trip.trip_name}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select> 
            </div>
            <div>
                <h1>Day Selector</h1>
                <MinimumDistanceSlider min={startDay} max={endDay} onValueChange={handleValueChange}/>
            </div>
        </div>
        <Map trip_name={selectedTrip} pins={pins}/>
    </div>
  );
}
export default MyPage;
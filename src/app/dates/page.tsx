"use client";

import { cn } from "@/lib/utils";
import BlurFade from "@/components/ui/blur-fade";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs"
import { getAllLogs } from "../../../utils/supabaseRequest";

function DatesContent() {
  const searchParams = useSearchParams();

  // Safely extract query parameters
  const trip_name = searchParams.get("name") || "Unnamed Trip";
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";

  if (!start || !end) {
    return <div>Error: Missing required date parameters.</div>;
  }

  // Parse dates
  const start_date = new Date(start.split(" ")[0]);
  const end_date = new Date(end.split(" ")[0]);

  // Generate days array
  const daysArray = [];
  let temp_date = new Date(start_date);

  while (temp_date <= end_date) {
    daysArray.push(new Date(temp_date));
    temp_date.setDate(temp_date.getDate() + 1);
  }

  const { userId, getToken } = useAuth();
  const [logs, setLogs] = useState<{entry:any,title:any, day:any}[]>([])
  useEffect(()=>{
    const fetchLog = async () => {
        try{
            const token = await getToken({ template: "supabase" });
            if(userId && token){
                const res = await getAllLogs({userId,token,trip_name})||[];
                setLogs(res);
                console.log(res);
            }
            else{
                console.error("User ID or token is missing.")
            }
        }
        catch (error){
            console.error("Error fetching log from page.")
        }
    };
    fetchLog();
},[getToken, userId, trip_name])


  return (
    <div>
      <BlurFade inView delay={0.25}>
        <h1 className="text-4xl text-center">{trip_name}</h1>
        <h3 className="text-xl text-center text-slate-400">
          {start_date.toLocaleDateString("en-us", {
            month: "long",
            year: "numeric",
            day: "numeric",
          })}{" "}
          -{" "}
          {end_date.toLocaleDateString("en-us", {
            month: "long",
            year: "numeric",
            day: "numeric",
          })}
        </h3>
        <div className="h-screen w-full">
          <BlurFade inView delay={0.5}>
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 mt-10 mx-2" key={1}>
              {daysArray.map((day, index) => (
                <Link href={{
                    pathname:'/day',
                    query:{
                        day:day.toLocaleDateString("en-us"),
                        trip:trip_name,
                        num:Number(index)+1,
                    }
                }} className={cn(
                    "group cursor-pointer overflow-hidden relative card h-full rounded-md shadow-xl mx-auto flex flex-row justify-center items-center border bg-cover w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44",
                    `${logs[index]?.entry==null ? "bg-slate-100 text-zinc-300":""}`
                )}>
                    <div
                    key={index}
                    style={{ backgroundImage: "" }}
                    >
                      <h1 className="font-black text-lg sm:text-xl md:text-2xl drop-shadow-2xl">
                          {index+1}
                      </h1>
                    </div>
                </Link>
              ))}
            </div>
          </BlurFade>
        </div>
      </BlurFade>
    </div>
  );
}

export default function Dates() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DatesContent />
    </Suspense>
  );
}

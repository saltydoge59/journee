"use client";

import { cn } from "@/lib/utils";
import BlurFade from "@/components/ui/blur-fade";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DatesContent() {
  const searchParams = useSearchParams();

  // Safely extract query parameters
  const name = searchParams.get("name") || "Unnamed Trip";
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
    daysArray.push(temp_date.getDate());
    temp_date.setDate(temp_date.getDate() + 1);
  }

  return (
    <div>
      <BlurFade inView delay={0.25}>
        <h1 className="text-4xl text-center">{name}</h1>
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
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 mt-5 mx-2">
              {daysArray.map((day, index) => (
                <div
                  key={index}
                  style={{ backgroundImage: "" }}
                  className={cn(
                    "group cursor-pointer overflow-hidden relative card h-full rounded-md shadow-xl mx-auto flex flex-row justify-end p-4 sm:p-8 md:p-12 lg:p-14 border bg-cover"
                  )}
                >
                  <div className="text relative z-50 h-full flex items-center">
                    <h1 className="font-black text-lg drop-shadow-2xl relative">
                      {day}
                    </h1>
                  </div>
                </div>
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

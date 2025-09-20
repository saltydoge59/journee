import Link from "next/link";
import { cn } from "@/lib/utils";
import BlurFade from "@/components/ui/blur-fade";

interface DayGridProps {
  daysArray: Date[];
  tripName: string;
  logs: {entry: any, title: any, day: any}[];
}

export default function DayGrid({ daysArray, tripName, logs }: DayGridProps) {
  return (
    <BlurFade inView delay={0.5}>
      <div className="grid grid-cols-4 md:grid-cols-5 xl:grid-cols-7 gap-4 mt-10 mx-2">
        {daysArray.map((day, index) => (
          <Link
            key={index}
            href={{
              pathname: '/day',
              query: {
                day: day.toLocaleDateString("en-us"),
                trip: tripName,
                num: Number(index) + 1,
              }
            }}
            className={cn(
              "group cursor-pointer overflow-hidden relative card h-full rounded-md shadow-xl mx-auto flex flex-row justify-center items-center border bg-cover w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44",
              `${logs[index]?.entry == null ? "bg-slate-100 text-zinc-300" : ""}`
            )}
          >
            <div style={{ backgroundImage: "" }}>
              <h1 className="font-black text-lg sm:text-xl md:text-2xl drop-shadow-2xl">
                {index + 1}
              </h1>
            </div>
          </Link>
        ))}
      </div>
    </BlurFade>
  );
}
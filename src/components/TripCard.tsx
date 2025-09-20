import Link from "next/link";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: {
    trip_name: string;
    image_url: string;
    start_date: string;
    end_date: string;
  };
  href: string | {
    pathname: string;
    query: Record<string, string>;
  };
  className?: string;
}

export default function TripCard({ trip, href, className = "" }: TripCardProps) {
  return (
    <Link href={href} className={cn("mx-auto rounded-full w-11/12 sm:w-5/6 mt-3 h-1/2", className)}>
      <div
        style={{backgroundImage:`url(${trip.image_url})`}}
        className={cn(
          "group w-full cursor-pointer overflow-hidden relative card h-full rounded-md shadow-xl mx-auto flex flex-col justify-end p-4 border",
          "bg-cover"
        )}
      >
        <div className="text relative z-50 h-full flex items-center">
          <h1 className="font-black text-4xl text-white drop-shadow-2xl relative">
            {trip.trip_name}
          </h1>
        </div>
      </div>
    </Link>
  );
}
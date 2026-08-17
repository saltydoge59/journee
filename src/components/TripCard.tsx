import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: {
    trip_name: string;
    image_url: string;
    start_date: string;
    end_date: string;
  };
  href: string;
  className?: string;
}

export default function TripCard({ trip, href, className = "" }: TripCardProps) {
  return (
    <Link to={href} className={cn("mx-auto w-11/12 sm:w-5/6 mt-3 h-1/2 block", className)}>
      <div
        style={{backgroundImage:`url(${trip.image_url})`}}
        className="group relative flex h-full w-full cursor-pointer flex-col justify-end overflow-hidden rounded-sm border border-border bg-cover shadow-md"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="relative z-10 flex h-full items-end p-5">
          <h1 className="font-serif-display text-3xl italic text-white drop-shadow-md">
            {trip.trip_name}
          </h1>
        </div>
      </div>
    </Link>
  );
}
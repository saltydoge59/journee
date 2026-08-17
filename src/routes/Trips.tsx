import { useUser } from "@clerk/react";
import { useEffect, useState } from "react";
import { getTrips, insertUser } from "@/api";
import BlurFade from "@/components/ui/blur-fade";
import { useToast } from "@/hooks/use-toast";
import RingLoader from "react-spinners/ClipLoader";
import EmptyState from "@/components/EmptyState";
import TripCard from "@/components/TripCard";
import FloatingActionButton from "@/components/FloatingActionButton";

export default function Trips() {
    const { toast } = useToast();
    const { user } = useUser(); // Destructure user object from useUser to access user details
    const username = user?.username;
    const [trips, setTrips] = useState<{ trip_name:string;image_url:string,start_date:string,end_date:string}[]>([]);

    useEffect(() => {
        const initializeUserAndFetchTrips = async () => {
          try {
              if (username) {
                await insertUser({ username }); // Insert user
                console.log("User inserted successfully");
              }
              const trips = await getTrips(); // Fetch trips
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
      }, [username]); // Dependencies

    function handleClick(){
      toast({
        title:"Redirecting...Please Wait",
        action:<RingLoader loading={true} color={'green'}/>
      })
    }

    return (

    <div className="h-full w-full">
        <EmptyState
          title="No trips recorded yet."
          actionText="Add Trip"
          actionHref="/add_trip"
          className={trips.length !== 0 ? "hidden" : ""}
        />
        <BlurFade delay={0.25} inView className={`${trips.length!==0?"":"hidden"} h-full`}>
            <div className="flex h-full flex-wrap content-start justify-center">
              {trips.map((trip, index) => (
                <TripCard
                  key={index}
                  trip={trip}
                  href={`/dates?${new URLSearchParams({
                    name: trip.trip_name,
                    start: trip.start_date,
                    end: trip.end_date,
                  })}`}
                />
              ))}
              <div className="h-[70px] w-full shrink-0 sm:hidden" />
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

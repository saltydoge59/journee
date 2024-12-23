"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { IconPencil } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createRoot } from "react-dom/client";
import { updateLatLong } from "../../utils/supabaseRequest";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { useLoadScript } from "@react-google-maps/api";
import {
    GeoapifyContext,
    GeoapifyGeocoderAutocomplete,
  } from "@geoapify/react-geocoder-autocomplete";
import "../app/snapspot/round-borders.dark.css";
import getCoords from "@/app/map/gemini";

interface Pin {
  day: number;
  imageURL: string;
  lat: number;
  long: number;
  area: string;
}

interface MapProps {
  pins: Pin[];
  trip_name: string;
}

export function Map({ pins, trip_name }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { userId, getToken } = useAuth();
  const { toast } = useToast();
  const geoapify_key = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "";

const { isLoaded, loadError} = useLoadScript({
    googleMapsApiKey:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries:['places',"maps","marker"],
})
  useEffect(() => {
    const initMap = async () => {
      if(!isLoaded || loadError){
        return(
          <div>Loading Map...</div>
        )
      };
      try {
        const position = {
          lat: pins.length > 0 ? pins[0].lat : 0,
          lng: pins.length > 0 ? pins[0].long : 0,
        };

        const mapOptions: google.maps.MapOptions = {
          center: position,
          zoom: pins.length > 0 ? 12 : 2,
          mapId: "MY_NEXTJS_MAPID",
        };

        const map = new google.maps.Map(mapRef.current as HTMLDivElement, mapOptions);

        const InfoWindowContent = ({ pin }: { pin: Pin }) => {
          const [location, setLocation] = useState(pin.area);

          const handlePlaceSelect=(place:any)=>{
                setLocation(place.properties.formatted);
                console.log(place.properties.formatted)
            };

          const updateCoord = async () => {
            try {
                const coords = await getCoords(location);
              if (!coords) throw new Error("Failed to fetch coordinates.");
                console.log(coords);
              const lat = coords.coordinates[0];
              const long = coords.coordinates[1];
              const token = await getToken({ template: "supabase" }) || "";
              if (userId) {
                const error = await updateLatLong({
                  userId,
                  token,
                  trip_name,
                  imageURL: pin.imageURL,
                  lat,
                  long,
                  area: location,
                });
                if (error) {
                  console.error("Failed to update coordinates.");
                  toast({
                    variant: "destructive",
                    title: "Failed to update. Please try again.",
                  });
                } else {
                    setDialogOpen(false)
                    console.log("Coordinates updated successfully!");
                    toast({duration:1000,
                      title: "Location updated successfully!" });
                  }
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
              } else {
                console.error("User ID missing.");
              }
            } catch (error) {
              console.error("Failed to update coordinates.", error);
              toast({
                variant: "destructive",
                title: "Failed to update. Please try again.",
              });
            }
          };

          const [dialogOpen, setDialogOpen] = useState(false);

          return (
            <div className="w-auto sm:w-96 h-auto">
              <div className="flex flex-row justify-between items-center mb-2">
                <h1 className="text-xl font-bold text-black w-3/4">{pin.area}</h1>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <IconPencil className="text-black bg-slate-200 rounded-full p-1 w-7 h-7" />
                  </DialogTrigger>
                  <DialogContent className="w-full">
                    <DialogHeader className="overflow-hidden">
                      <DialogTitle>Edit Location</DialogTitle>
                    </DialogHeader>
                    <div>
                    <GeoapifyContext apiKey={geoapify_key} className="w-full">
                        <GeoapifyGeocoderAutocomplete
                        placeholder="e.g. Niseko, Japan"
                        placeSelect={handlePlaceSelect}
                        value={location}
                        />
                    </GeoapifyContext>
                      <Button className="mt-2" onClick={updateCoord}>Save</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <img
                src={pin.imageURL}
                className="w-full h-auto"
                alt={pin.area}
              />
            </div>
          );
        };

        pins.forEach((pin) => {
          const container = document.createElement("div");
          const root = createRoot(container);
          root.render(<InfoWindowContent pin={pin} />);

          const infowindow = new google.maps.InfoWindow({ content: container });

          const marker = new google.maps.Marker({
            map,
            position: { lat: pin.lat, lng: pin.long },
            title: pin.area,
            clickable: true,
            label: `${pin.day}`,
          });

          marker.addListener("click", () => {
            infowindow.open({ anchor: marker, map });
          });
        });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();
  }, [pins, isLoaded, loadError]);

  return <div style={{ height: "100vh" }} ref={mapRef} />;
}

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
import axios from "axios";
import { updateLatLong } from "../../utils/supabaseRequest";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { useLoadScript } from "@react-google-maps/api";

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

const { isLoaded, loadError} = useLoadScript({
    googleMapsApiKey:process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries:['places',"maps","marker"],
})
  useEffect(() => {
    const initMap = async () => {
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
          const placesAutoCompleteRef = useRef(null);
          const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);


          const handleChange = (event:any) =>{
            console.log(event.target.value);
            setLocation(event.target.value)
          }

          function handlePlaceChanged (){
            if(!autocomplete) return;
            
            const place = autocomplete.getPlace();
            console.log(place);

            if(place && place.geometry){
                console.log('here');
            }
            };

          const refCallback = (node: HTMLInputElement | null) => {
            if (node && !autocomplete) {
              const options = { fields: ["geometry", "formatted_address"] };
              const autocompleteInstance = new google.maps.places.Autocomplete(node, options);
              autocompleteInstance.addListener('place_changed', handlePlaceChanged);
              setAutocomplete(autocompleteInstance);
              console.log(autocompleteInstance);
            }
          };

          const updateCoord = async () => {
            try {
              let coords = await getCoords(location);
              if (!coords) throw new Error("Failed to fetch coordinates.");

              const lat = coords.lat;
              const long = coords.long;
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
                  toast({ title: "Location updated successfully!" });
                }
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

          async function getCoords(address: string) {
            try {
              const url = "https://maps.googleapis.com/maps/api/geocode/json";
              const params = {
                key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
                address: encodeURIComponent(address),
              };
              console.log(params);
              const response = await axios.get(url, { params });
              if (
                response.data.status === "OK" &&
                response.data.results.length > 0
              ) {
                const { lat, lng } =
                  response.data.results[0].geometry.location;
                console.log("Coordinates:", lat, lng);
                return { lat, long: lng };
              } else {
                console.error("No results or error:", response.data.status);
                return null;
              }
            } catch (error) {
              console.error("Error fetching coordinates:", error);
              return null;
            }
          }

          const [dialogOpen, setDialogOpen] = useState(false);

          return (
            <div className="w-80 h-80">
              <div className="flex flex-row justify-between items-center mb-2">
                <h1 className="text-xl font-bold text-black">{pin.area}</h1>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <IconPencil className="text-black bg-slate-200 rounded-full p-1 w-7 h-7" />
                  </DialogTrigger>
                  <DialogContent className="w-full">
                    <DialogHeader>
                      <DialogTitle>Edit Location</DialogTitle>
                    </DialogHeader>
                    <div>
                      <Input
                        ref={refCallback}
                        onChange={handleChange}
                        value={location}
                      />
                      <Button onClick={updateCoord}>Save</Button>
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
  }, [pins]);

  return <div style={{ height: "100vh" }} ref={mapRef} />;
}

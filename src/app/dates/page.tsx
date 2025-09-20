"use client";

import BlurFade from "@/components/ui/blur-fade";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs"
import { deleteTrip, getAllLogs, updateTrip, uploadBackgroundToSupabase } from "../../../utils/supabaseRequest";
import { Button } from "@/components/ui/button";
import { IconDots, IconDotsCircleHorizontal, IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import * as React from "react";
import RingLoader from "react-spinners/ClipLoader";
import PageHeader from "@/components/PageHeader";
import DayGrid from "@/components/DayGrid";

function DatesContent() {
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false)

  // Handle file selection
  const [selectedFile, setSelectedFile] = React.useState<File[]>([]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(Array.from(event.target.files));
    }
  };

  async function onSubmit(){
    try{
      const token = await getToken({ template: "supabase" });
      if (userId && token) {
        if (selectedFile.length > 0) {
          const imageURL = await uploadBackgroundToSupabase(token, userId, selectedFile[0], "backgrounds");
          const error = await updateTrip({
            userId,
            token,
            trip_name,
            imageURL
          });
          if(error){
            console.error("Error updating URL in database.",error);
            toast({
              variant:"destructive",
              title:"Failed to update cover photo. Try again."
            })
          }
          else{
            console.log("Cover photo updated.")
            toast({
              duration:2000,
              title:"Cover photo updated successfully!",
            })}
            setEditOpen(false);
        }
      }
    }
  catch(error){
    console.error("Could not upload to supabase");
    toast({
      variant:"destructive",
      title:"Database error. Please try again."})
    }
  }

  async function removeTrip(){
    try{
      const token = await getToken({ template: "supabase" });
      if(userId && token){
        const error = await deleteTrip({
        userId,
        token,
        trip_name
        })
        if(error){
          console.error("Error from supabase:",error);
          toast({
            variant:"destructive",
            title:"Failed to delete trip. Try again."
          })
        }
        else{
          console.log("Trip deleted successfully!")
          toast({
            duration:2000,
            title:"Trip deleted successfully! Redirecting...",
            action:<RingLoader loading={true} color={'green'}/>
          })
          setTimeout(()=>{
            router.push("/trips")
          },2000)
        }
      }

    }
    catch(error){
      console.error("Unexpected error occurred here.")
      toast({
        variant:"destructive",
        title:"An unexpected error occurred. Please wait..."
      })
    }
  }

  return (
    <div className="w-screen h-screen">
      <BlurFade inView delay={0.25} className="w-screen h-screen">
        <PageHeader
          title={trip_name}
          subtitle={`${start_date.toLocaleDateString("en-us", {
            month: "long",
            year: "numeric",
            day: "numeric",
          })} - ${end_date.toLocaleDateString("en-us", {
            month: "long",
            year: "numeric",
            day: "numeric",
          })}`}
        />
        <div>
          <DayGrid daysArray={daysArray} tripName={trip_name} logs={logs} />
        </div>
      </BlurFade>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>              
            <DialogTrigger asChild>
              <Button className={`fixed right-16 bottom-20 sm:bottom-4 w-9 h-9 rounded-full drop-shadow-lg ${resolvedTheme==='dark'?"outline outline-slate-200 bg-black":"bg-white"}`}>
                <IconPencil className={`${resolvedTheme==='dark'?"text-white":"text-black"}`}/>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[80vw] lg:w-[50vw] rounded-lg">
              <DialogHeader>
                <DialogTitle>Edit Cover Picture</DialogTitle>
                <DialogDescription>
                    Change your trip's cover picture.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 flex-col">
                  <input type="file" className="w-full" onChange={handleFileChange} />
                  <Button onClick={onSubmit} className={`mt-3 bg-gradient-to-r from-indigo-500 to-purple-500 font-bold text-white hover:brightness-90 ${!selectedFile?"disabled":""}`}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>              
            <DialogTrigger asChild>
              <Button className={`fixed right-4 bottom-20 sm:bottom-4 w-9 h-9 rounded-full drop-shadow-lg ${resolvedTheme==='dark'?"outline outline-slate-200 bg-black":"bg-white"}`}>
                <IconTrash className="text-red-500"/>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[80vw] lg:w-[25vw] rounded-lg">
            <DialogHeader>
              <DialogTitle>Delete Trip</DialogTitle>
              <DialogDescription>
                  Are you sure you want to delete this trip? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
                <Button onClick={()=>{setDeleteOpen(false)}} className="p-2 rounded bg-slate-300 font-bold w-full">Close</Button>
                <Button onClick={()=>{removeTrip()}} className="p-2 rounded bg-red-400 font-bold w-full">Delete</Button>
            </div>
            </DialogContent>
          </Dialog>
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

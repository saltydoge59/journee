"use client";

import BlurFade from "@/components/ui/blur-fade";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs"
import { deleteTrip, getAllLogs, updateTrip, uploadBackground } from "../../../utils/api";
import { Button } from "@/components/ui/button";
import { IconDots, IconDotsCircleHorizontal, IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import * as React from "react";
import RingLoader from "react-spinners/ClipLoader";
import PageHeader from "@/components/PageHeader";
import DayGrid from "@/components/DayGrid";
import { CoverPhotoPicker } from "@/components/ui/cover-photo-picker";

function DatesContent() {
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

  const { userId } = useAuth();
  const [logs, setLogs] = useState<{entry:any,title:any, day:any}[]>([])
  useEffect(()=>{
    const fetchLog = async () => {
        try{
            if(userId){
                const res = await getAllLogs({trip_name})||[];
                setLogs(res);
                console.log(res);
            }
            else{
                console.error("User ID is missing.")
            }
        }
        catch (error){
            console.error("Error fetching log from page.")
        }
    };
    fetchLog();
},[userId, trip_name])

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false)

  // Handle file selection
  const [selectedFile, setSelectedFile] = React.useState<File[]>([]);
  const handleFileChange = (files: File[]) => {
    setSelectedFile(files);
  };

  async function onSubmit(){
    try{
      if (userId) {
        if (selectedFile.length > 0) {
          const imageURL = await uploadBackground(selectedFile[0], "backgrounds");
          await updateTrip({ trip_name, imageURL });
          console.log("Cover photo updated.")
          toast({
            duration:2000,
            title:"Cover photo updated successfully!",
          })
          setEditOpen(false);
        }
      }
    }
  catch(error){
    console.error("Error updating cover photo.", error);
    toast({
      variant:"destructive",
      title:"Failed to update cover photo. Try again."})
    }
  }

  async function removeTrip(){
    try{
      if(userId){
        await deleteTrip({ trip_name })
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
              <Button className="fixed right-16 bottom-20 sm:bottom-4 w-9 h-9 rounded-full border border-border bg-card shadow-md hover:bg-secondary">
                <IconPencil className="text-foreground"/>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[80vw] lg:w-[50vw] rounded-sm">
              <DialogHeader>
                <DialogTitle className="font-serif-display italic">Edit Cover Picture</DialogTitle>
                <DialogDescription>
                    Change your trip's cover picture.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 flex-col">
                  <CoverPhotoPicker onChange={handleFileChange} />
                  <Button onClick={onSubmit} className={`font-mono-label mt-3 rounded-sm bg-primary text-xs uppercase text-primary-foreground hover:brightness-95 ${!selectedFile?"disabled":""}`}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button className="fixed right-4 bottom-20 sm:bottom-4 w-9 h-9 rounded-full border border-border bg-card shadow-md hover:bg-secondary">
                <IconTrash className="text-[hsl(var(--seal))]"/>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[80vw] lg:w-[25vw] rounded-sm">
            <DialogHeader>
              <DialogTitle className="font-serif-display italic">Delete Trip</DialogTitle>
              <DialogDescription>
                  Are you sure you want to delete this trip? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3">
                <Button onClick={()=>{setDeleteOpen(false)}} className="font-mono-label w-full rounded-sm border border-border bg-secondary text-xs uppercase text-foreground">Close</Button>
                <Button onClick={()=>{removeTrip()}} className="font-mono-label w-full rounded-sm bg-[hsl(var(--seal))] text-xs uppercase text-[hsl(var(--seal-foreground))]">Delete</Button>
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

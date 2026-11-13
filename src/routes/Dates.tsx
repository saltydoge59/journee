import BlurFade from "@/components/ui/blur-fade";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react"
import { deleteTrip, getAllLogs, updateTrip, updateTripDates, uploadBackground } from "@/api";
import { resizeImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import * as React from "react";
import RingLoader from "react-spinners/ClipLoader";
import PageHeader from "@/components/PageHeader";
import DayGrid from "@/components/DayGrid";
import { CoverPhotoPicker } from "@/components/ui/cover-photo-picker";
import { DatePicker } from "@/components/daterange/date-picker";

export default function Dates() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Safely extract query parameters
  const trip_name = searchParams.get("name") || "Unnamed Trip";
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";

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
},[userId, trip_name, start, end])

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false)

  // Handle file selection
  const [selectedFile, setSelectedFile] = React.useState<File[]>([]);
  const handleFileChange = (files: File[]) => {
    setSelectedFile(files);
  };

  const [startInput, setStartInput] = useState<Date | undefined>(start ? new Date(start) : undefined);
  const [endInput, setEndInput] = useState<Date | undefined>(end ? new Date(end) : undefined);
  const datesValid = !!startInput && !!endInput && startInput <= endInput;
  const datesChanged =
    datesValid && (startInput.getTime() !== new Date(start).getTime() || endInput.getTime() !== new Date(end).getTime());

  async function onSubmit(){
    try{
      if (userId) {
        if (datesChanged) {
          const res = await updateTripDates({ trip_name, daterange: { from: startInput, to: endInput } });
          navigate(`/dates?${new URLSearchParams({ name: trip_name, start: res.start_date, end: res.end_date })}`, { replace: true });
        }
        if (selectedFile.length > 0) {
          const imageURL = await uploadBackground(await resizeImage(selectedFile[0]), "backgrounds");
          await updateTrip({ trip_name, imageURL });
        }
        if (datesChanged || selectedFile.length > 0) {
          toast({
            duration:2000,
            title:"Trip updated successfully!",
          })
          setEditOpen(false);
        }
      }
    }
  catch(error){
    console.error("Error updating trip.", error);
    toast({
      variant:"destructive",
      title: error instanceof Error && error.message ? error.message : "Failed to update trip. Try again."})
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
          navigate("/trips")
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

  return (
    <div className="w-full">
      <BlurFade inView delay={0.25} className="w-full">
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
                <DialogTitle className="font-serif-display italic">Edit Trip</DialogTitle>
                <DialogDescription>
                    Change your trip's dates or cover picture.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 flex-col">
                  <div className="flex gap-3">
                    <div className="flex w-full flex-col gap-1">
                      <span className="font-mono-label text-xs uppercase text-muted-foreground">Start date</span>
                      <DatePicker value={startInput} onChange={setStartInput} disabled={endInput && { after: endInput }} />
                    </div>
                    <div className="flex w-full flex-col gap-1">
                      <span className="font-mono-label text-xs uppercase text-muted-foreground">End date</span>
                      <DatePicker value={endInput} onChange={setEndInput} disabled={startInput && { before: startInput }} />
                    </div>
                  </div>
                  <CoverPhotoPicker onChange={handleFileChange} />
                  <Button onClick={onSubmit} disabled={!datesValid} className={`font-mono-label mt-3 rounded-sm bg-primary text-xs uppercase text-primary-foreground hover:brightness-95 ${!selectedFile?"disabled":""}`}>Save</Button>
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

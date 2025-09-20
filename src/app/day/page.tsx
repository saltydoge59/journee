"use client"

import BlurFade from "@/components/ui/blur-fade"
import { IconArrowLeft, IconDotsVertical, IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useMediaQuery } from "@custom-react-hooks/use-media-query"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, } from "@/components/ui/drawer"
import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { deletePhotos, editLog, getLog,getPhotos } from "../../../utils/supabaseRequest"
import { useToast } from "@/hooks/use-toast";
import EditLog from "./editlog";
import RingLoader from "react-spinners/ClipLoader";
import EmptyState from "@/components/EmptyState";

function DaysContent() {
    const { userId, getToken } = useAuth();
    const searchParams = useSearchParams();
    const trip_name = searchParams.get('trip')||"";
    const datestring = searchParams.get('day') || ""; //rmb to convert to timestamptz
    const day = Number(searchParams.get('num'));
    const router = useRouter();
    const handleBackClick = () => {
        router.back();
    }
    const [dialogueOpen, setDialogueOpen] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const isDesktop = useMediaQuery("(min-width: 640px)")
    const [log, setLog] = useState<{entry:any,title:any,location:any}|null>();
    const [logPresent,setLogPresent] = useState(true);
    const { toast } = useToast();
    const [photos, setPhotos] = useState<string[] | null>(null);
    const [deleteOpen, setDeleteOpen] = useState<boolean[]>([]);

    const handleDialogOpen = (idx: number, isOpen: boolean) => {
        setDeleteOpen((prev) => {
            const newState = [...prev];
            newState[idx] = isOpen; // Set the open state for the specific dialog
            return newState;
        });
    };

    const fetchLog = useCallback(async()=> {
        const token = await getToken({ template: "supabase" });
        if(!userId || !token) return;
        try{
            const res = await getLog({userId,token,day,trip_name})||{entry:"",title:"",location:""};
            setLog({ ... res});
            setLogPresent(true);
            if(res.entry==null || res.title==null){
                setLogPresent(false);
            }
            console.log(res);
        }
        catch (error){
            console.error("Error fetching log from page.")
        }
    },[getToken, userId, day, trip_name]);

    const fetchPhotos = useCallback(async()=>{
        try{
            const token = await getToken({ template: "supabase" });
            if(userId && token){
                const photoInfo = await getPhotos({token,userId,trip_name,start_day:day,end_day:-1})||[];
                console.log(photoInfo);
                let photos:string[] = [];
                for(let p of photoInfo){
                    photos.push(p.imageURL);
                }
                setPhotos([...photos]);
                console.log('Photos preloaded:',photos)
            }
        }
        catch(error){
            console.error("Error fetching photos:", error);
        }
    },[getToken, userId, trip_name, day, deleteOpen]);

    useEffect(()=>{
        fetchLog();
        fetchPhotos();
    },[fetchLog,fetchPhotos])


    const handleSubmit = useCallback(
        async (entry: string, loc:string, title: string) => {
          console.log("submitted");
          try {
            const token = await getToken({ template: "supabase" });
            if(token){
                await editLog({ userId, token, trip_name, day, entry, title, loc});
                await fetchLog();
                await fetchPhotos();
                toast({ duration: 2000, title: "Log edited successfully! Redirecting...",action:<RingLoader loading={true} color={'green'}/> });
                setTimeout(() => {
                setDrawerOpen(false);
                setDialogueOpen(false);
                }, 2000); 
            }

          } catch (error) {
            console.error("Error in updating log:", error);
            toast({ variant: "destructive", title: "Failed to edit log. Try again." });
          }
        },
        [userId, getToken, trip_name, day, fetchLog, fetchPhotos]
      );

    async function deleteImage(imageURL:string,idx:number) {
        // console.log(imageURL);
        try{
            const token = await getToken({ template: "supabase" });
            if(token && userId){
                const error = await deletePhotos({userId,token,trip_name,day,imageURL});
                if(error){
                    console.error("Error in deleting photo.",error);
                    toast({ variant: "destructive", title: "Failed to delete photo. Try again." });
                }
                else{
                    console.log("Photo deleted")
                    toast({ duration: 2000, title: "Photo deleted successfully!" });
                    handleDialogOpen(idx, false);
                    fetchPhotos();
                }
            }
        }
        catch(error){
            console.error("Unexpected Error:", error);
            toast({ variant: "destructive", title: "An unexpected error occurred." });
        }

    }

    return(
        <div className="h-screen w-screen">
            <BlurFade delay={0.25} inView>
                <div className="sm:p-3" style={{height:"calc(100vh - 90px)"}}>
                    <button className="fixed flex flex-row pl-2" onClick={handleBackClick}>
                        <IconArrowLeft className="inline"/>
                        <span>Back</span>
                    </button>
                    {!logPresent ? (
                    <div>
                        <h1 className="text-xl text-center font-bold">{new Date(datestring).toDateString()}</h1>
                        <EmptyState
                          emoji="😴"
                          title="Nothing to see yet..."
                          className=""
                        />
                    </div>
                    ) :
                    (
                    <div>
                        <h1 className="text-3xl font-bold text-center">{log?.title}</h1>
                        <h4 className="text-md text-center">{new Date(datestring).toDateString()}</h4>
                        <div className="p-2" dangerouslySetInnerHTML={{__html:`${log?.entry}`}}/>
                        <div className="columns-2 gap-4 p-2">
                            {photos?.map((photo,idx)=>{
                                console.log(photo,idx);
                                return (
                                <BlurFade key={idx} inView delay={0.25+ idx * 0.05}>
                                    <div className="relative">
                                        <img src={photo} className="mb-4 size-full rounded-lg object-contain" key={`Picture ${idx}`}/>
                                    </div>
                                    <Dialog key={`Dialog ${idx}`} open={deleteOpen[idx]||false} onOpenChange={(isOpen) => handleDialogOpen(idx, isOpen)}>
                                        <DialogTrigger asChild>
                                            <button className="fixed top-2 right-2 bg-slate-300/50 rounded drop-shadow-xl"><IconDotsVertical/></button>
                                        </DialogTrigger>
                                        <DialogContent className="w-[80vw] lg:w-[25vw] rounded-lg">
                                            <DialogHeader>
                                                <DialogTitle>Delete Picture {idx+1}</DialogTitle>
                                                <DialogDescription>
                                                    Are you sure you want to delete this picture? This action cannot be undone.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex gap-3">
                                                <Button onClick={()=>{deleteImage(photo,idx);console.log(photo)}}  className="p-2 rounded bg-red-400 font-bold w-full">Delete</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </BlurFade>
                                );
                            })}
                        </div>
                        {/* <button className="ml-2 text-sm p-2 rounded bg-gradient-to-r from-indigo-500 to-purple-500 font-bold text-white tracking-widest transform hover:scale-105 transition-colors duration-200">Edit Photos</button> */}
                        <div className="pb-20"></div>
                    </div> 
                    )}



                </div>
            </BlurFade>
            <div className={isDesktop?"":"hidden"}>
                <Dialog open={dialogueOpen} onOpenChange={setDialogueOpen}>
                    <DialogTrigger asChild className={`fixed bottom-20 sm:bottom-7 right-4 sm:right-6 px-3 p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-3xl font-bold text-white tracking-widest transform hover:scale-105 transition-colors duration-200`}>
                        <Link href="#">
                            <IconPencil/>
                        </Link>
                    </DialogTrigger>
                    <DialogContent className="h-7/12 max-w-[80vw]" aria-describedby="content">
                        <DialogHeader>
                            <DialogTitle className="mb-3">Edit Log</DialogTitle>
                            <EditLog
                                day={day}
                                trip_name={trip_name}
                                logContent={log?.entry||""}
                                title={log?.title|| `Day ${day}`}
                                loc={log?.location}
                                onSubmit={handleSubmit}
                                onUpload={fetchPhotos}
                                />
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
            <div className={isDesktop?"hidden":""}>
                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <DrawerTrigger asChild className={`fixed bottom-20 sm:bottom-7 right-4 sm:right-6 px-3 p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-3xl font-bold text-white tracking-widest transform hover:scale-105 transition-colors duration-200`}>
                        <Link href="#">
                            <IconPencil/>
                        </Link>
                    </DrawerTrigger>
                    <DrawerContent className="h-full w-full">
                        <DrawerHeader>
                            <DrawerTitle >Edit Log</DrawerTitle>
                            <EditLog
                                day={day}
                                trip_name={trip_name}
                                logContent={log?.entry||""}
                                title={log?.title|| `Day ${day}`}
                                loc={log?.location}
                                onSubmit={handleSubmit}
                                onUpload={fetchPhotos}
                                />
                        </DrawerHeader>
                    </DrawerContent>
                </Drawer>
            </div>
        </div>
    )
}


export default function Day(){
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <DaysContent/>
        </Suspense>
    )
}


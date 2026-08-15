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
import { deletePhotos, getLog,getPhotos } from "../../../utils/api"
import { useToast } from "@/hooks/use-toast";
import EditLog from "./editlog";
import EmptyState from "@/components/EmptyState";
import PhotoViewer from "@/components/PhotoViewer";

function DaysContent() {
    const { userId } = useAuth();
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
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);

    const handleDialogOpen = (idx: number, isOpen: boolean) => {
        setDeleteOpen((prev) => {
            const newState = [...prev];
            newState[idx] = isOpen; // Set the open state for the specific dialog
            return newState;
        });
    };

    const fetchLog = useCallback(async()=> {
        if(!userId) return;
        try{
            const res = await getLog({day,trip_name})||{entry:"",title:"",location:""};
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
    },[userId, day, trip_name]);

    const fetchPhotos = useCallback(async()=>{
        try{
            if(userId){
                const photoInfo = await getPhotos({trip_name,start_day:day,end_day:-1})||[];
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
    },[userId, trip_name, day, deleteOpen]);

    useEffect(()=>{
        fetchLog();
        fetchPhotos();
    },[fetchLog,fetchPhotos])


    // The editor autosaves title/location/entry text and photos as the user
    // works, so "Done" only needs to refresh this page's view and close —
    // no redundant save call, no artificial delay before closing.
    const handleSubmit = useCallback(
        async () => {
          await fetchLog();
          await fetchPhotos();
          setDrawerOpen(false);
          setDialogueOpen(false);
        },
        [fetchLog, fetchPhotos]
      );

    async function deleteImage(imageURL:string,idx:number) {
        // console.log(imageURL);
        try{
            if(userId){
                await deletePhotos({trip_name,day,imageURL});
                console.log("Photo deleted")
                toast({ duration: 2000, title: "Photo deleted successfully!" });
                handleDialogOpen(idx, false);
                fetchPhotos();
            }
        }
        catch(error){
            console.error("Unexpected Error:", error);
            toast({ variant: "destructive", title: "An unexpected error occurred." });
        }

    }

    return(
        <div className="min-h-screen w-screen pb-24">
            <BlurFade delay={0.25} inView>
                <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6" style={{minHeight:"calc(100vh - 90px)"}}>
                    <button className="font-mono-label flex flex-row items-center gap-1 text-xs uppercase text-muted-foreground hover:text-foreground" onClick={handleBackClick}>
                        <IconArrowLeft className="inline h-4 w-4"/>
                        <span>Back</span>
                    </button>
                    {!logPresent ? (
                    <div className="mt-10 text-center">
                        <p className="font-mono-label text-xs uppercase text-muted-foreground">{new Date(datestring).toDateString()}</p>
                        <EmptyState
                          title="Nothing recorded for this day."
                          className=""
                        />
                    </div>
                    ) :
                    (
                    <div className="mt-8">
                        <div className="text-center">
                            <p className="font-mono-label text-xs uppercase text-muted-foreground">{new Date(datestring).toDateString()}</p>
                            <h1 className="mt-2 font-serif-display text-3xl italic">{log?.title}</h1>
                        </div>
                        <div className="ruled font-entry mt-8 leading-[1.85rem]" dangerouslySetInnerHTML={{__html:`${log?.entry}`}}/>

                        {photos && photos.length > 0 && (
                        <div className="mt-10 flex flex-wrap justify-center gap-6 border-t border-border pt-8">
                            {photos?.map((photo,idx)=>{
                                return (
                                <BlurFade key={idx} inView delay={0.25+ idx * 0.05}>
                                    <div className="relative w-40 border border-border bg-card p-2 shadow-sm">
                                        <span className="absolute -left-1 -top-1 h-3 w-3 border-l border-t border-accent" />
                                        <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-accent" />
                                        <img
                                            src={photo}
                                            className="aspect-square w-full cursor-zoom-in object-cover"
                                            key={`Picture ${idx}`}
                                            onClick={() => setViewerIndex(idx)}
                                        />
                                        <Dialog key={`Dialog ${idx}`} open={deleteOpen[idx]||false} onOpenChange={(isOpen) => handleDialogOpen(idx, isOpen)}>
                                            <DialogTrigger asChild>
                                                <button className="absolute right-1 top-1 rounded-sm bg-card/80 p-0.5 text-muted-foreground"><IconDotsVertical className="h-4 w-4"/></button>
                                            </DialogTrigger>
                                            <DialogContent className="w-[80vw] lg:w-[25vw] rounded-sm">
                                                <DialogHeader>
                                                    <DialogTitle className="font-serif-display italic">Delete Picture {idx+1}</DialogTitle>
                                                    <DialogDescription>
                                                        Are you sure you want to delete this picture? This action cannot be undone.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex gap-3">
                                                    <Button onClick={()=>{deleteImage(photo,idx)}} className="font-mono-label w-full rounded-sm bg-[hsl(var(--seal))] text-xs uppercase text-[hsl(var(--seal-foreground))]">Delete</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </BlurFade>
                                );
                            })}
                        </div>
                        )}
                    </div>
                    )}



                </div>
            </BlurFade>
            <PhotoViewer
                photos={photos || []}
                index={viewerIndex}
                onClose={() => setViewerIndex(null)}
                onNavigate={setViewerIndex}
            />
            <div className={isDesktop?"":"hidden"}>
                <Dialog open={dialogueOpen} onOpenChange={setDialogueOpen}>
                    <DialogTrigger asChild className="fixed bottom-20 sm:bottom-7 right-4 sm:right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--seal))] text-[hsl(var(--seal-foreground))] shadow-lg transition-transform hover:scale-105">
                        <Link href="#">
                            <IconPencil/>
                        </Link>
                    </DialogTrigger>
                    <DialogContent className="h-7/12 max-w-[80vw]" aria-describedby="content">
                        <DialogHeader>
                            <DialogTitle className="mb-3 font-serif-display italic">Edit Log</DialogTitle>
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
                    <DrawerTrigger asChild className="fixed bottom-20 sm:bottom-7 right-4 sm:right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--seal))] text-[hsl(var(--seal-foreground))] shadow-lg transition-transform hover:scale-105">
                        <Link href="#">
                            <IconPencil/>
                        </Link>
                    </DrawerTrigger>
                    <DrawerContent className="h-full w-full">
                        <DrawerHeader>
                            <DrawerTitle className="font-serif-display italic">Edit Log</DrawerTitle>
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


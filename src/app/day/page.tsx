"use client"

import BlurFade from "@/components/ui/blur-fade"
import { IconArrowLeft, IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { useMediaQuery } from "@custom-react-hooks/use-media-query"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, } from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import * as React from "react";
import Tiptap from "@/components/Tiptap"
import { useAuth } from "@clerk/nextjs"
import { editLog, getLog } from "../../../utils/supabaseRequest"
import { useToast } from "@/hooks/use-toast";

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
    const [log, setLog] = useState<{entry:any,title:any}|null>();
    const [logPresent,setLogPresent] = useState(true);
    const [submit,setSubmit] = useState(false);
    const { toast } = useToast();
    let files:File[] = [];

    useEffect(()=>{
        const fetchLog = async () => {
            try{
                const token = await getToken({ template: "supabase" });
                if(userId && token){
                    const res = await getLog({userId,token,day,trip_name});
                    setLog(res);
                    setSubmit(false);
                    if(res===null || res.entry===null || res.title===null){
                        setLogPresent(false);
                    }
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
    },[getToken, userId, day, trip_name, submit])

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        files = Array.from(event.target.files);
        console.log(files);
      }
    };
    const handleSubmit = async ( userId: string|undefined|null, getToken: any, trip_name:string, day:number, entry:string, title:string ) => {
        console.log('submitted')
        setSubmit(true);
        try{
            const token = await getToken({ template: "supabase" });
            await editLog({userId, token, trip_name, day, entry, title });
            toast({duration:2000,
                title:"Log edited successfully! Redirecting..."
              });
            setTimeout(() => {
                setDrawerOpen(false);
                setDialogueOpen(false);
              }, 2000);
        }
        catch(error){
            console.error('Error in updating log:',error)
            toast({
                variant:"destructive",
                title:"Failed to edit log. Try again."
              })
        }
    }

    let content = `${log?.entry===null?"":log?.entry}`;
    const handleContentChange = (reason:any)=>{
        content=reason;
    }


    function EditLog({className}:React.ComponentProps<"form">){
        const title = `Day ${day}`;
        return (
            <div className={cn("grid items-start gap-5",className)}>
                <div className="grid gap-2">
                    <Label className="text-start" htmlFor="title">Title</Label>
                    <input className="border p-2 rounded" type="text" id="title" defaultValue={title} />
                </div>
                <div className="grid gap-2">
                    <Label className="text-start" htmlFor="Entry">Entry</Label>
                    <Tiptap content={content} onChange={(newContent:string)=>handleContentChange(newContent)}/>
                </div>
                <div className="grid gap-2">
                    <Label className="text-start" htmlFor="Photos">Photos</Label>
                    <Input multiple type="file" onChange={handleFileChange} />
                </div>

                <Button onClick={()=>handleSubmit(userId,getToken,trip_name,day,content,title)} type="submit" className=" bg-gradient-to-r from-indigo-500 to-purple-500 font-bold text-white hover:brightness-90">Save Changes</Button>
            </div>
        )
    }

    return(
        <div>
            <BlurFade delay={0.25} inView>
                <div className="sm:p-3" style={{height:"calc(100vh - 90px)"}}>
                    <button className="fixed flex flex-row pl-2" onClick={handleBackClick}>
                        <IconArrowLeft className="inline"/>
                        <span>Back</span>
                    </button>
                    {!logPresent ?(
                    <div>
                        <h1 className="text-xl text-center font-bold">{new Date(datestring).toDateString()}</h1>
                        <div className="h-full w-full flex justify-center items-center" style={{height:"calc(100vh - 90px)"}}>
                            <div className="flex flex-col items-center">
                                <span className="text-4xl">😴</span>
                                <h4 className="mt-1">Nothing to see yet...</h4>
                            </div>
                        </div>
                    </div>
                    ):
                    (
                    <div>
                        <h1 className="text-3xl font-bold text-center">{log?.title}</h1>
                        <h4 className="text-md text-center">{new Date(datestring).toDateString()}</h4>
                        <div className="p-2" dangerouslySetInnerHTML={{__html:`${log?.entry}`}}/>
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
                    <DialogContent className="h-3/4 max-w-[80vw]" aria-describedby="content">
                        <DialogHeader>
                            <DialogTitle className="mb-3">Edit Log</DialogTitle>
                            <EditLog/>
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
                            <EditLog/>
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


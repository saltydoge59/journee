import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Tiptap from "@/components/Tiptap";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { insertPhotos, uploadPhotosToSupabase } from "../../../utils/supabaseRequest";
import { useToast } from "@/hooks/use-toast";
import RingLoader from "react-spinners/ClipLoader";
import { FileUpload } from "@/components/ui/file-upload";
import getLocation from "./gemini";


interface EditLogProps {
  day: number;
  trip_name: string;
  logContent: string;
  title: string;
  loc: string;
  onSubmit: (entry: string, loc:string, title: string) => void;
  // handleFileUpload:(files:File[])=>void;
}

const EditLog = ({
  day,
  trip_name,
  logContent,
  title,
  loc,
  onSubmit,
  // handleFileUpload,
}: EditLogProps) => {
  const [titleValue, setTitleValue] = useState(title);
  const [locValue, setLocValue] = useState(loc);
  const [entryContent, setEntryContent] = useState(logContent);
  const { userId, getToken } = useAuth();
  const { toast } = useToast();
  const [saveDisabled,setSaveDisabled] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const uploadFiles = async ()=>{
    setSaveDisabled(true);
    let count=1;
    console.log("Files selected:", files); // Debugging
    try{
      if(userId){
        for(let f of files){
          toast({duration:Infinity,
            title:`Analyzing images ${count}/${files.length}...This may take awhile...`,
            action:<RingLoader loading={true} color={'green'}/>
          })
          const result = await getLocation(f,locValue);
          const lat = result.coordinates[0];
          const long = result.coordinates[1];
          const area = result.area;
          let imageURL = null;
          toast({duration:Infinity,
            title:`Uploading images ${count}/${files.length}...This may take awhile...`,
            action:<RingLoader loading={true} color={'green'}/>
          })
          const token = await getToken({ template: "supabase" }) || "";
          imageURL = await uploadPhotosToSupabase(token, userId, day, trip_name, f, "photos");
          if(!imageURL) throw new Error(`Failed to upload ${f.name} to Supabase Storage.`);
          const error = await insertPhotos({userId,token,trip_name,day,imageURL,lat,long,area});
          if(error){
            toast({
              variant:"destructive",
              title:`Failed to upload image ${f.name}. Try again.`
            })
          }
          else{
            console.log(`Image ${f.name} uploaded successfully.`)
            count++;
          }
        }
        toast({duration:2000,
          title:"All images uploaded successfully!"
        })
      }
      else{
        console.error("User ID or token is missing.")
      }
      setSaveDisabled(false);
    }
    catch(error){
      console.error("Unexpected error:",error);
      toast({
        variant:"destructive",
        title:"Failed to upload images. Try again."
      })
      setSaveDisabled(false);
    }
  }

  // const onFilesUpload = async (files:any)=>{
  //   console.log(files);
  //   handleFileUpload(files);
  // }

  return (
    <div className={cn("grid items-start gap-5")}>
      <div className="grid gap-2">
        <Label className="text-start" htmlFor="title">
          Title
        </Label>
        <input
          className="border p-2 rounded"
          type="text"
          id="title"
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label className="text-start" htmlFor="location">
          Area/Country
        </Label>
        <input
          className="border p-2 rounded"
          type="text"
          id="location"
          value={locValue}
          onChange={(e) => setLocValue(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label className="text-start" htmlFor="entry">
          Entry
        </Label>
        <Tiptap content={entryContent} onChange={(newContent:any) => setEntryContent(newContent)} />
      </div>
      <div className="grid gap-2">
        <Label className="text-start" htmlFor="photos">
          Photos
        </Label>
        {/* <Input multiple type="file" onChange={handleFileChange} /> */}
        <FileUpload onChange={(files:any)=>{setFiles(files)}}/>
        
      </div>

      <div className="w-full">
        <Button className="w-1/2 font-bold" onClick={uploadFiles} disabled={files.length==0}>Upload</Button>
        <Button
        onClick={() => onSubmit(entryContent, locValue, titleValue)}
        className="w-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 font-bold text-white hover:brightness-90" disabled={saveDisabled}
        >
        Save Changes
        </Button>
      </div>

    </div>
  );
};

export default EditLog;

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Tiptap from "@/components/Tiptap";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { insertPhotos, uploadPhotosToSupabase } from "../../../utils/supabaseRequest";
import { useToast } from "@/hooks/use-toast";
import RingLoader from "react-spinners/ClipLoader";
import { FileUpload } from "@/components/ui/file-upload";
import getLocation from "./gemini";
import { useAutosave } from 'react-autosave';
import { editLog } from "../../../utils/supabaseRequest";


interface EditLogProps {
  day: number;
  trip_name: string;
  logContent: string;
  title: string;
  loc: string;
  onSubmit: (entry: string, loc:string, title: string) => void;
  onUpload:() => void;
}

const EditLog = ({
  day,
  trip_name,
  logContent,
  title,
  loc,
  onSubmit,
  onUpload
}: EditLogProps) => {
  const [titleValue, setTitleValue] = useState(title);
  const [locValue, setLocValue] = useState(loc);
  const [entryContent, setEntryContent] = useState(logContent);
  const { userId, getToken } = useAuth();
  const { toast } = useToast();
  const [saveDisabled,setSaveDisabled] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const autosaveLog = async () => {
    const token = await getToken({ template: "supabase" });
    if(!userId || !token) return;
    try {
      await editLog({ userId, token, trip_name, day, entry:entryContent, title, loc});
    }catch (error) {
      console.error("Error in updating log:", error);
    }
  }
  useAutosave({data:entryContent, onSave:autosaveLog});

  const uploadFiles = async ()=>{
    setSaveDisabled(true);
    const token = await getToken({ template: "supabase" }) || "";
    if(!userId || !token) return;
    let count=1;
    for(let f of files){
      toast({duration:Infinity,
        title:`Uploading images ${count}/${files.length}...Please wait 🥰`,
        action:<RingLoader loading={true} color={'green'}/>
      })
      try{
        console.log("Invoking Gemini API...");
        const result = await getLocation(f,locValue);          
        const lat = result.coordinates[0];
        const long = result.coordinates[1];
        const area = result.area;
        console.log("Gemini result:",result);

        console.log("Uploading to Supabase blob...");
        let imageURL = await uploadPhotosToSupabase(token, userId, day, trip_name, f, "photos");
        console.log("Supabase blob result:",imageURL);

        console.log("Inserting photo data into database...");
        const error = await insertPhotos({userId,token,trip_name,day,imageURL,lat,long,area});
        count++;
      }
      catch(error){
        console.error("Error handling location for photo:", error);
      }
    }
    toast({duration:3000,
      title:`${count-1}/${files.length} images uploaded!`,
    });
    onUpload();
    setSaveDisabled(false);
    }

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

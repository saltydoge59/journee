import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Tiptap from "@/components/Tiptap";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { insertPhotos, uploadPhotosToSupabase } from "../../../utils/supabaseRequest";
import { useToast } from "@/hooks/use-toast";
import { IconX } from "@tabler/icons-react";
import RingLoader from "react-spinners/ClipLoader";
import { FileUpload } from "@/components/ui/file-upload";


interface EditLogProps {
  day: number;
  trip_name: string;
  logContent: string;
  title: string;
  onSubmit: (entry: string, title: string) => void;
  handleFileUpload:(files:File[])=>void;
}

const EditLog = ({
  day,
  trip_name,
  logContent,
  title,
  onSubmit,
  handleFileUpload,
}: EditLogProps) => {
  const [titleValue, setTitleValue] = useState(title);
  const [entryContent, setEntryContent] = useState(logContent);
  const { userId, getToken } = useAuth();
  const { toast } = useToast();
  const [disabled,setDisabled] = useState(false);

  const onFilesUpload = async (files:any)=>{
    setDisabled(true);
    console.log(files);
    handleFileUpload(files);
    toast({duration:Infinity,
      title:"Uploading images...Please Wait",
      action:<RingLoader loading={true} color={'green'}/>
    })
    console.log("Files selected:", files); // Debugging
    try{
      const token = await getToken({ template: "supabase" });
      if(userId && token){
        for(let f of files){
          let imageURL = null;
          imageURL = await uploadPhotosToSupabase(token, userId, day, trip_name, f, "photos");
          if(!imageURL) throw new Error(`Failed to upload ${f.name} to Supabase Storage.`);
          const error = await insertPhotos({userId,token,trip_name,day,imageURL});
          if(error){
            toast({
              variant:"destructive",
              title:`Failed to upload image ${f.name}. Try again.`
            })
          }
          else{
            console.log(`Image ${f.name} uploaded successfully.`)
          }
        }
        toast({duration:2000,
          title:"Images uploaded successfully!"
        })
      }
      else{
        console.error("User ID or token is missing.")
      }
      setDisabled(false);
    }
    catch(error){
      console.error("Unexpected error:",error);
      toast({
        variant:"destructive",
        title:"Failed to upload images. Try again."
      })
      setDisabled(false);
    }
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
        <FileUpload onChange={onFilesUpload}/>
      </div>

      <Button
        onClick={() => onSubmit(entryContent, titleValue)}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 font-bold text-white hover:brightness-90" disabled={disabled}
      >
        Save Changes
      </Button>
    </div>
  );
};

export default EditLog;

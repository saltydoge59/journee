import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Tiptap from "@/components/Tiptap";
import { useEffect, useRef, useState } from "react";
import { FileUpload } from "primereact/fileupload";
import { useAuth } from "@clerk/nextjs";
import { insertPhotos, uploadPhotosToSupabase } from "../../../utils/supabaseRequest";
import { useToast } from "@/hooks/use-toast";
import { IconX } from "@tabler/icons-react";
import RingLoader from "react-spinners/ClipLoader";


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
  const fileUploadRef = useRef<FileUpload>(null);


  const itemTemplate = (file:any, props:any) => {
    return (
        <div className="flex-row flex justify-between">
            <div className="flex items-center">
                <img alt={file.name} role="presentation" src={file.objectURL} width={100} />
                <span className="mx-3">{file.name}</span>
            </div>
            <div className="flex items-center">
              <IconX className="mx-3" onClick={() => onTemplateRemove(file, props.onRemove)}/>
            </div>
        </div>
    );
};

const onTemplateRemove = (file:any, callback:any) => {
  callback();
};

  // Custom Header Template
  const headerTemplate = (options:any) => {
    const { chooseButton, uploadButton, cancelButton } = options;

    return (
      <div
        className="flex items-center p-3 border rounded"
        style={{ gap: "1rem" }}
      >
        <div>{chooseButton}</div> {/* Custom Choose Button */}
        <div>{uploadButton}</div> {/* Custom Upload Button */}
        <div>{cancelButton}</div> {/* Custom Cancel Button */}
      </div>
    );
  };
  // Custom Choose Button Options
  const chooseOptions = {
    icon: "pi pi-images", // Custom icon
    label: "Browse", // Custom label
    className: "bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600", // Custom classes
  };

  // Custom Upload Button Options
  const uploadOptions = {
    icon: "pi pi-cloud-upload", // Custom icon
    label: "Upload", // Custom label
    className: "bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600", // Custom classes
  };

  // Custom Cancel Button Options
  const cancelOptions = {
    icon: "pi pi-times", // Custom icon
    label: "Clear", // Custom label
    className: "bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600", // Custom classes
  };


  const onFilesSelect = (event: any) => {
    
    console.log("Files selected in EditLog:", event.files); // Debugging
    if (event.files) {
      handleFileUpload(event.files); // Pass files to the parent
    } else {
      console.error("No files received in onFilesSelect.");
    }
  };

  const onFilesUpload = async (event:any)=>{
    toast({duration:Infinity,
      title:"Uploading images...Please Wait",
      action:<RingLoader loading={true} color={'green'}/>
    })

    console.log("Files uploaded in EditLog:", event.files); // Debugging
    try{
      const token = await getToken({ template: "supabase" });
      if(userId && token){
        for(let f of event.files){
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
    }
    catch(error){
      console.error("Unexpected error:",error);
      toast({
        variant:"destructive",
        title:"Failed to upload images. Try again."
      })
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
        <FileUpload
          ref={fileUploadRef}
          mode="advanced"
          chooseOptions={chooseOptions} // Custom Choose Button
          uploadOptions={uploadOptions} // Custom Upload Button
          cancelOptions={cancelOptions} // Custom Cancel Button
          headerTemplate={headerTemplate}
          name="photo_selector"
          multiple
          accept="image/*"
          onSelect={onFilesSelect} // Trigger on file selection
          customUpload
          uploadHandler={onFilesUpload}
          emptyTemplate={
            <p className="p-5 border border-dashed rounded-b-lg text-gray-400">Drag and drop photos here to upload.</p>
          }
          itemTemplate={itemTemplate}
        />
      </div>

      <Button
        onClick={() => onSubmit(entryContent, titleValue)}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 font-bold text-white hover:brightness-90"
      >
        Save Changes
      </Button>
    </div>
  );
};

export default EditLog;

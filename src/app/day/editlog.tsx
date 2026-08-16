import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Tiptap from "@/components/Tiptap";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { insertPhotos, uploadPhotos, getPhotoLocation, editLog } from "@/api";
import { useToast } from "@/hooks/use-toast";
import RingLoader from "react-spinners/ClipLoader";
import { FileUpload, type SpecimenStatus } from "@/components/ui/file-upload";
import { useAutosave } from 'react-autosave';
import debounce from "lodash.debounce";


interface EditLogProps {
  day: number;
  trip_name: string;
  logContent: string;
  title: string;
  loc: string;
  onSubmit: () => void;
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
  const { userId } = useAuth();
  const { toast } = useToast();
  const [photoStatuses, setPhotoStatuses] = useState<Record<string, SpecimenStatus>>({});
  const [saveStatus, setSavingStatus] = useState<String>("Saved!");

  // Everything on this form autosaves — title, location, and entry text all
  // debounce into the same save, so there is one consistent "it just saves"
  // behavior instead of a separate button to remember.
  const autosaveLog = async () => {
    setSavingStatus("Saving...");
    if(!userId) return;
    try {
      await editLog({ trip_name, day, entry:entryContent, title:titleValue, loc:locValue});
    }catch (error) {
      console.error("Error in updating log:", error);
      setSavingStatus("Error");
    }
    setTimeout(() => {
      setSavingStatus("Saved!");
    }, 2000);
  }
  const debouncedAutosaveLog = debounce(autosaveLog, 1000);
  useAutosave({data:{entryContent, titleValue, locValue}, onSave:debouncedAutosaveLog});

  // Dropping or picking photos mounts them immediately — no separate
  // "Upload" step to remember, matching how the entry text already behaves.
  const handleNewFiles = async (newFiles: File[]) => {
    if(!userId) return;
    for(let f of newFiles){
      const key = `${f.name}-${f.lastModified}`;
      setPhotoStatuses((prev) => ({ ...prev, [key]: "uploading" }));
      try{
        const result = await getPhotoLocation(f, locValue);
        const lat = result.coordinates[0];
        const long = result.coordinates[1];
        const area = result.area;

        const imageURL = await uploadPhotos(day, trip_name, f, "photos");
        await insertPhotos({trip_name,day,imageURL,lat,long,area});

        setPhotoStatuses((prev) => ({ ...prev, [key]: "done" }));
      }
      catch(error){
        console.error("Error handling location for photo:", error);
        setPhotoStatuses((prev) => ({ ...prev, [key]: "error" }));
        toast({ variant: "destructive", duration: 3000, title: `Couldn't mount ${f.name}. Try again.` });
      }
    }
    onUpload();
  }

  return (
    <div className={cn("grid items-start gap-6")}>
      <div className="flex items-baseline justify-end gap-1.5 -mb-2">
        <RingLoader loading={saveStatus=="Saving..."} color={'hsl(150, 28%, 20%)'} size={12}/>
        <p className="font-mono-label text-[11px] uppercase text-muted-foreground">
          {saveStatus === "Saved!" ? "All changes saved" : saveStatus}
        </p>
      </div>
      <div className="grid gap-2">
        <Label className="font-mono-label text-start text-xs uppercase text-muted-foreground" htmlFor="title">
          Title
        </Label>
        <input
          className="font-entry rounded-sm border border-border bg-card p-2"
          type="text"
          id="title"
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label className="font-mono-label text-start text-xs uppercase text-muted-foreground" htmlFor="location">
          Area/Country
        </Label>
        <input
          className="font-entry rounded-sm border border-border bg-card p-2"
          type="text"
          id="location"
          value={locValue}
          onChange={(e) => setLocValue(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label className="font-mono-label text-start text-xs uppercase text-muted-foreground" htmlFor="entry">
          Entry
        </Label>
        <Tiptap content={entryContent} onChange={(newContent:any) => setEntryContent(newContent)} />
      </div>
      <div className="grid gap-2">
        <Label className="font-mono-label text-start text-xs uppercase text-muted-foreground" htmlFor="photos">
          Photos
        </Label>
        <FileUpload onChange={handleNewFiles} statuses={photoStatuses}/>
      </div>

      <Button
        onClick={onSubmit}
        className="font-mono-label w-full rounded-sm bg-primary text-xs uppercase text-primary-foreground hover:brightness-95"
      >
        Done
      </Button>

    </div>
  );
};

export default EditLog;

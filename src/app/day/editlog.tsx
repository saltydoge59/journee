import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Tiptap from "@/components/Tiptap";
import { useState } from "react";

interface EditLogProps {
  day: number;
  logContent: string;
  title: string;
  onSubmit: (entry: string, title: string) => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const EditLog = ({
  day,
  logContent,
  title,
  onSubmit,
  handleFileChange,
}: EditLogProps) => {
  const [titleValue, setTitleValue] = useState(title);
  const [entryContent, setEntryContent] = useState(logContent);

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
        <Input multiple type="file" onChange={handleFileChange} />
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

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload, IconCheck, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import RingLoader from "react-spinners/ClipLoader";


const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

export type SpecimenStatus = "uploading" | "done" | "error";

export const FileUpload = ({
  onChange,
  statuses = {},
}: {
  onChange?: (files: File[]) => void;
  /** Upload status per file, keyed by `${file.name}-${file.lastModified}`. */
  statuses?: Record<string, SpecimenStatus>;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    onChange && onChange(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };


  const { getRootProps, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="group/file relative block w-full cursor-pointer overflow-hidden rounded-sm border border-dashed border-border p-8"
      >
        <input
          multiple
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          <p className="font-mono-label relative z-20 text-xs uppercase text-muted-foreground">
            {isDragActive ? "Release to mount" : "Drop photos to mount and save automatically"}
          </p>
          <div className="relative mx-auto mt-6 w-full">
            {files.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4">
                {files.map((file, idx) => {
                  const status = statuses[`${file.name}-${file.lastModified}`];
                  return (
                  <motion.div
                    key={"file" + idx}
                    layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                    className="relative flex h-24 w-24 flex-col items-center justify-center border border-border bg-card p-2 shadow-sm"
                  >
                    <span className="absolute -left-1 -top-1 h-3 w-3 border-l border-t border-accent" />
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-accent" />
                    <div className="absolute right-1 top-1">
                      {status === "uploading" && <RingLoader loading color="hsl(150, 28%, 20%)" size={11} />}
                      {status === "done" && <IconCheck className="h-3.5 w-3.5 text-[hsl(150,28%,20%)]" />}
                      {status === "error" && <IconX className="h-3.5 w-3.5 text-[hsl(var(--seal))]" />}
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="w-full truncate text-center text-[11px] text-foreground"
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="font-mono-label mt-1 text-[10px] text-muted-foreground"
                    >
                      {status === "uploading" ? "mounting…" : status === "error" ? "failed" : (file.size / (1024 * 1024)).toFixed(2) + " MB"}
                    </motion.p>
                  </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative mx-auto flex h-28 w-28 items-center justify-center border border-border bg-card group-hover/file:border-accent"
              >
                <span className="absolute -left-1 -top-1 h-3 w-3 border-l border-t border-accent" />
                <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-accent" />
                <IconUpload className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}

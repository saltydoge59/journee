"use client"

import React, { useRef, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { IconPhoto, IconX } from "@tabler/icons-react";

export const CoverPhotoPicker = ({
  onChange,
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (newFiles: File[]) => {
    const picked = newFiles[0] ?? null;
    setFile(picked);
    onChange?.(picked ? [picked] : []);
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    onChange?.([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    accept: { "image/*": [] },
    onDrop: handleFile,
  });

  return (
    <div
      {...getRootProps()}
      onClick={() => fileInputRef.current?.click()}
      className="group relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-sm border border-dashed border-border bg-card"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(Array.from(e.target.files || []))}
        className="hidden"
      />
      {previewUrl ? (
        <>
          <img src={previewUrl} className="h-full w-full object-cover" alt="Selected cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
          <button
            type="button"
            onClick={clearFile}
            className="absolute right-2 top-2 rounded-sm bg-card/90 p-1 text-muted-foreground hover:text-foreground"
          >
            <IconX className="h-4 w-4" />
          </button>
          <p className="font-mono-label absolute bottom-2 left-2 truncate text-[11px] text-white/90">
            {file?.name}
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground">
          <IconPhoto className="h-5 w-5" />
          <p className="font-mono-label text-xs uppercase">
            {isDragActive ? "Release to set cover" : "Choose a cover photo"}
          </p>
        </div>
      )}
    </div>
  );
};

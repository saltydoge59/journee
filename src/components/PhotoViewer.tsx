"use client"

import { useEffect, useCallback } from "react";
import { IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";

interface PhotoViewerProps {
  photos: string[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function PhotoViewer({ photos, index, onClose, onNavigate }: PhotoViewerProps) {
  const open = index !== null;

  const goPrev = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + photos.length) % photos.length);
  }, [index, photos.length, onNavigate]);

  const goNext = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % photos.length);
  }, [index, photos.length, onNavigate]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose, goPrev, goNext]);

  return (
    <AnimatePresence>
      {open && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={onClose}
        >
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white"
          >
            <IconX className="h-5 w-5" />
          </button>

          {photos.length > 1 && (
            <button
              aria-label="Previous photo"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 sm:left-4 rounded-sm bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white"
            >
              <IconChevronLeft className="h-6 w-6" />
            </button>
          )}

          <motion.img
            key={index}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            src={photos[index]}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] border border-white/10 object-contain shadow-2xl"
          />

          {photos.length > 1 && (
            <button
              aria-label="Next photo"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 sm:right-4 rounded-sm bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white"
            >
              <IconChevronRight className="h-6 w-6" />
            </button>
          )}

          {photos.length > 1 && (
            <p className="font-mono-label absolute bottom-4 text-xs uppercase text-white/60">
              {index + 1} / {photos.length}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

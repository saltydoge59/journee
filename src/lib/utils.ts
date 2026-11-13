import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shrink phone photos before they leave the device. createImageBitmap applies
// EXIF orientation by default; EXIF itself is dropped (the vision model only sees pixels).
// Anything undecodable (e.g. HEIC in Chrome) or not actually smaller goes up untouched.
export async function resizeImage(file: File, maxEdge = 2048): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale))
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 })
    if (blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]*$/, "") + ".jpg", { type: "image/jpeg" })
  } catch {
    return file
  }
}

"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface MinimumDistanceSliderProps {
  min: number;
  max: number;
  onValueChange?: (values: number[]) => void;
}

export default function MinimumDistanceSlider({ min, max, onValueChange }: MinimumDistanceSliderProps) {
  const [value, setValue] = React.useState<number[]>([min, max]);

  React.useEffect(() => {
    setValue([min, max]);
  }, [min, max]);

  return (
    <div className="w-[300px]">
      <div className="mb-1 text-sm text-muted-foreground">
        Day {value[0]}{value[1] !== value[0] ? ` – Day ${value[1]}` : ""}
      </div>
      <SliderPrimitive.Root
        className={cn("relative flex w-full touch-none select-none items-center")}
        value={value}
        min={min}
        max={max}
        minStepsBetweenThumbs={1}
        onValueChange={(newValue) => {
          setValue(newValue);
          onValueChange?.(newValue);
        }}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  );
}

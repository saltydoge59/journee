"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/daterange/date-picker-with-range";
import { createTrip, uploadBackground } from "../../../utils/api";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import RingLoader from "react-spinners/ClipLoader";
import PageHeader from "@/components/PageHeader";
import { CoverPhotoPicker } from "@/components/ui/cover-photo-picker";


const formSchema = z.object({
  trip_name: z.string().min(1, {
    message: "Please fill in a trip name!",
  }),
  date_range: z.object({
    from: z.date({
      required_error: "Please select a start date!",
    }),
    to: z.date({
      required_error: "Please select an end date!",
    }),
  }),
  image: z.array(z.instanceof(File)).optional(),
});

export default function AddTrip() {
  const { toast } = useToast();
  const { userId } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trip_name: "",
      date_range: { from: undefined, to: undefined },
    },
  });
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const router = useRouter();

  // Handle file selection
  const handleFileChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  function clearToast(){
    toast({
      duration:0.00001
    })
  }
  useEffect(()=>{
    clearToast();
  },[])

  // Define a submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let imageURL = 'https://pub-d8966727b726431389106312061035a7.r2.dev/backgrounds/default.webp';

      if (userId) {
        if (selectedFiles.length > 0) {
          imageURL = await uploadBackground(selectedFiles[0], "backgrounds");
        }

        const result = await createTrip({
          trip_name: values.trip_name,
          daterange: values.date_range,
          image_url: imageURL,
        });

        if (result?.message) {
          form.setError("trip_name", { message: "Failed to create trip. Try again." });
          toast({
            variant:"destructive",
            title:"Failed to create trip. Try again."
          })
        } else {
          form.reset();
          toast({duration:2000,
            title:"Trip created successfully! Redirecting...",
            action:<RingLoader loading={true} color={'green'}/>
          })
          setTimeout(() => {
            router.push("/trips");
          }, 2000);
        }
      } else {
        console.error("User ID is missing.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        variant:"destructive",
        title:"Failed to create trip. Try again."
      })
    }
  }

  return (
    <div className="relative">
      <PageHeader title="New Trip" className="h-auto flex flex-col items-center justify-center pt-8" />
      <div className="mx-auto max-w-md p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Trip Name Field */}
            <FormField
              control={form.control}
              name="trip_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono-label text-xs uppercase text-muted-foreground">Trip Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Japan Family Trip" className="font-entry rounded-sm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Date Range Field */}
            <FormField
              control={form.control}
              name="date_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono-label text-xs uppercase text-muted-foreground">Trip Duration</FormLabel>
                  <FormControl>
                    <DatePickerWithRange
                      value={field.value}
                      onChangeAction={(value: DateRange | undefined) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* File Input Field */}
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel className="font-mono-label block text-xs uppercase text-muted-foreground">Trip Cover Picture (Optional)</FormLabel>
                  <FormControl>
                    <CoverPhotoPicker onChange={handleFileChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="font-mono-label w-full rounded-sm bg-primary text-xs uppercase text-primary-foreground hover:brightness-95">
              Add Trip
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/daterange/date-picker-with-range";
import { createTrip, uploadBackgroundToSupabase } from "../../../utils/supabaseRequest";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

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
  const { userId, getToken } = useAuth();
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
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  // Define a submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const token = await getToken({ template: "supabase" });
      let imageURL = 'https://uurvbdxwneflwgawanud.supabase.co/storage/v1/object/public/backgrounds/default.webp';

      if (userId && token) {
        if (selectedFiles.length > 0) {
          imageURL = await uploadBackgroundToSupabase(token, userId, selectedFiles[0], "backgrounds");
        }

        const error = await createTrip({
          userId,
          token,
          trip_name: values.trip_name,
          daterange: values.date_range,
          image_url: imageURL,
        });

        if (error) {
          form.setError("trip_name", { message: "Failed to create trip. Try again." });
          toast({
            variant:"destructive",
            title:"Failed to create trip. Try again."
          })
        } else {
          form.reset();
          toast({duration:2000,
            title:"Trip created successfully! Redirecting..."
          })
          setTimeout(() => {
            router.push("/trips");
          }, 2000);
        }
      } else {
        console.error("User ID or token is missing.");
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
      <h1 className="justify-center font-bold text-3xl h-[60px] items-center flex">
        New Trip
      </h1>
      <div className="p-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Trip Name Field */}
            <FormField
              control={form.control}
              name="trip_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Japan Family Trip" {...field} />
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
                  <FormLabel>Trip Duration</FormLabel>
                  <FormControl>
                    <DatePickerWithRange
                      value={field.value}
                      onChange={(value: DateRange | undefined) => field.onChange(value)}
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
                  <FormLabel className="block">Trip Cover Picture (Optional)</FormLabel>
                  <FormControl>
                    <input type="file" onChange={handleFileChange} accept="image/*" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-500 font-bold text-white hover:brightness-90 px-5">
              Add
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

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
import { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/daterange/date-picker-with-range";
import { createTrip, uploadImageToSupabase } from "../../../utils/supabaseRequest";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';

const formSchema = z.object({
  trip_name: z.string().min(1, {
    message: "Please fill in a trip name!",
  }),
  date_range: z.object({
      from: z.date({
        required_error:"Please select a start date!"
      }),
      to: z.date({
        required_error:"Please select an end date!"
      }
      ),
    }),
  image: z.instanceof(FileList).optional(),
});

export default function AddTrip() {
  const { userId, getToken } = useAuth(); // Destructure userId and getToken from useAuth
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trip_name: "",
      date_range: { from: undefined, to: undefined }, // Initial date range
    },
  });
  const fileRef = form.register("image");
  const router = useRouter();

  // Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try{
      const token = await getToken({template:"supabase"});

      let imageURL = null;
      
      if(userId && token && values.image?.length){
      const imageFile = values.image[0];
      imageURL = await uploadImageToSupabase(token,userId,imageFile,"backgrounds");

      const error = await createTrip({
        userId, 
        token, 
        trip_name: values.trip_name, 
        daterange: values.date_range,
        image_url: imageURL,
      });
        if(error){
          form.setError("trip_name",{message:"Failed to create trip. Try again."})
          toast.error('Failed to create trip. Try again.')
        } else{
          form.reset()
          console.log('Trip created successfully!');
          toast("Trip created successfully! Redirecting...");
          setTimeout(() => {
            router.push('/trips');
          }, 3000);
        }


      }else{
        console.error("User ID or token is missing.");
        toast.error('Failed to create trip. Try again.')
      }
    } catch (error){
      console.error("Unexpected error:",error);
      toast.error('Failed to create trip. Try again.')

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
                    <Input placeholder="e.g.Japan Family Trip" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Duration</FormLabel>
                  <FormControl>
                  <DatePickerWithRange
                    value={field.value} // Bind form state to the component
                    onChange={(value: DateRange | undefined) => field.onChange(value)} // Update form state
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Cover Picture</FormLabel>
                  <FormControl>
                    <Input type="file" {...fileRef} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="submit">Add</Button>
            </div>
          </form>
        </Form>
      </div>
      <ToastContainer position="bottom-left" />
    </div>
  );
}
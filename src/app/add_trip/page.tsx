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
    })
});

export default function AddTrip() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trip_name: "",
      date_range: { from: undefined, to: undefined }, // Initial date range
    },
  });

  // Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div>
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
                    <Input placeholder="Japan Family Trip" {...field} />
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

            

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface CustomDatePickerProps {
  control: any;
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean; // Disables the trigger button
  dateFormat?: string;
  // ✅ ADDED: New prop to pass a function for disabling specific dates
  disabledDays?: (day: Date) => boolean;
}

export function CustomDatePicker({
  control,
  name,
  label = "Select Date",
  placeholder = "Pick a date",
  disabled = false,
  dateFormat = "PPP",
  disabledDays, // ✅ ADDED: Destructure the new prop
}: Readonly<CustomDatePickerProps>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: any) => (
        <FormItem className="flex flex-col">
          {label && <FormLabel>{label}</FormLabel>}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  disabled={disabled} // This prop disables the button itself
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    format(field.value, dateFormat)
                  ) : (
                    <span>{placeholder}</span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(date) => {
                  if (date) {
                    field.onChange(date);
                    setOpen(false);
                  }
                }}
                // ✅ ADDED: Pass the disabling function to the Calendar component
                disabled={disabledDays}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
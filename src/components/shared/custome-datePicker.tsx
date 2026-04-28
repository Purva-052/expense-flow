/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
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
  disabled?: boolean;
  dateFormat?: string;
  disabledDays?: (day: Date) => boolean;
  defaultMonth?: Date;
  minDate?: Date | string;
  triggerClassName?: string;
}

export function CustomDatePicker({
  control,
  name,
  label = "Select Date",
  placeholder = "Pick a date",
  disabled = false,
  dateFormat = "PPP",
  disabledDays,
  triggerClassName,
  defaultMonth,
  minDate,
}: Readonly<CustomDatePickerProps>) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(defaultMonth || new Date());

  // Update month when defaultMonth changes
  useEffect(() => {
    if (defaultMonth) {
      setMonth(defaultMonth);
    }
  }, [defaultMonth]);

  const handleMonthChange = (offset: number) => {
    const newMonth = new Date(month);
    newMonth.setMonth(month.getMonth() + offset);
    setMonth(newMonth);
  };

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
                  disabled={disabled}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground",
                    triggerClassName
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

            <PopoverContent
              className="w-auto rounded-lg border p-3 shadow-md"
              align="start"
            >
              {/* ✅ Custom Calendar Header */}
              <div className="flex items-center justify-between px-2 pb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleMonthChange(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center space-x-2">
                  <span className="font-medium">{format(month, "MMMM")}</span>

                  <select
                    className="rounded-md border bg-transparent px-1 py-0.5 text-sm focus:outline-none dark:bg-card dark:border-white/20"
                    value={month.getFullYear()}
                    onChange={(e) => {
                      const newYear = parseInt(e.target.value, 10);
                      const newDate = new Date(month);
                      newDate.setFullYear(newYear);
                      setMonth(newDate);
                    }}
                  >
                    {Array.from(
                      { length: new Date().getFullYear() - 1930 + 1 + 10 },
                      (_, i) => 1930 + i
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleMonthChange(1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* ✅ Fixed-height container for calendar */}
              <div className="h-[230px] overflow-hidden">
                <Calendar
                  mode="single"
                  month={month}
                  onMonthChange={setMonth}
                  selected={field.value}
                  onSelect={(date) => {
                    if (date) {
                      field.onChange(date);
                      setOpen(false);
                    }
                  }}
                  disabled={(date) => {
                    // minDate check
                    if (minDate) {
                      const min = new Date(minDate);
                      min.setHours(0, 0, 0, 0);

                      const current = new Date(date);
                      current.setHours(0, 0, 0, 0);

                      if (current < min) return true;
                    }

                    // existing disabledDays logic
                    return disabledDays ? disabledDays(date) : false;
                  }}
                  initialFocus
                  classNames={{
                    month_caption: "hidden",
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

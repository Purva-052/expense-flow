import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      mode="single"
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption_label: cn(
          "text-sm font-medium flex items-center gap-1 select-none pointer-events-none text-foreground dark:text-white",
          // Hide the plain text label only when in non-dropdown layout
          !props.captionLayout || props.captionLayout === "label"
            ? "hidden"
            : ""
        ),
        chevron: cn(
          "opacity-100",
          // Navigation chevrons (left/right) - no fill override needed, they inherit currentColor
          // Dropdown chevrons should be always visible
          "fill-foreground dark:fill-white"
        ),
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 z-10 dark:border-white/20 dark:text-white",
          "absolute left-2 top-3"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 z-10 dark:border-white/20 dark:text-white",
          "absolute right-2 top-3"
        ),
        month_grid: "w-full border-collapse space-x-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : 'aria-selected:rounded-md [&[aria-selected="true"]>button]:hover:bg-foreground [&[aria-selected="true"]>button]:hover:text-background/85'
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected: "opacity-100 bg-yellow-500",
        range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground rounded-md",
        outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "day-range-middle aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_dropdowns: "flex justify-center items-center gap-1 px-8",
        dropdown_root:
          "relative inline-flex h-8 items-center rounded-md border border-border bg-background px-2 text-foreground transition-colors hover:bg-accent dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
        dropdown:
          "absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 bg-background text-foreground [color-scheme:light] dark:bg-slate-900 dark:text-slate-100 dark:[color-scheme:dark]",
        ...classNames,
      }}
      {...props}
    />
  );
}

export { Calendar };

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SingleDateFilterProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SingleDateFilter({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: SingleDateFilterProps) {
  // 1. Create state to control the popover visibility
  const [isOpen, setIsOpen] = React.useState(false);

  // 2. Handle the date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (onChange) {
      onChange(date);
    }
    // 3. Close the popover after selection
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal rounded-3xl",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}

          {/* Clear Button */}
          {value && (
            <div
              className="ml-auto h-4 w-4 opacity-50 hover:opacity-100 z-20"
              onClick={(e) => {
                e.stopPropagation(); // Prevents opening the popover when clearing
                if (onChange) onChange(undefined);
              }}
            >
              <X className="h-4 w-4" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect} // Use our custom handler
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

import { useEffect, useMemo, useState, useCallback } from "react";
import type { SyntheticEvent } from "react";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { format, isSameDay } from "date-fns";
import type { DateRange, Matcher } from "react-day-picker";
import type { PopoverContentProps } from "@radix-ui/react-popover";

export default function DateRangeFilter(props: {
  value?: DateRange | undefined;
  placeholder?: string;
  onChange?: (val: DateRange | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: Matcher | Matcher[] | undefined;
  className?: string;
  popoverAlign?: PopoverContentProps["align"];
  popoverSide?: PopoverContentProps["side"];
  popoverSideOffset?: number;
  popoverClassName?: string;
}) {
  const {
    value,
    placeholder,
    onChange,
    onOpenChange,
    disabled,
    className,
    popoverAlign = "start",
    popoverSide = "bottom",
    popoverSideOffset = 4,
    popoverClassName,
  } = props;
  const isControlled = Object.prototype.hasOwnProperty.call(props, "value");
  const normalizedValue = useMemo(
    () => (value && (value.from || value.to) ? value : undefined),
    [value?.from?.getTime(), value?.to?.getTime()]
  );
  const [date, setDate] = useState<DateRange | undefined>(
    isControlled ? normalizedValue : undefined
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isControlled) {
      setDate(normalizedValue);
    }
  }, [isControlled, normalizedValue]);

  const handleClear = useCallback(
    (e?: SyntheticEvent) => {
      if (e && e.stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
      }
      setDate(undefined);
      if (onChange) onChange(undefined);
      setOpen(false);
    },
    [onChange]
  );

  const atLocalNoon = (d: Date) => {
    const nd = new Date(d);
    nd.setHours(12, 0, 0, 0);
    return nd;
  };

  return (
    <Popover
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (onOpenChange) onOpenChange(val);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[260px] justify-between text-left font-normal rounded-2xl hover:bg-transparent hover:text-inherit",
            !date && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </div>

          {date && (
            <button
              type="button"
              aria-label="Clear date range"
              className="hover:bg-muted ml-2 flex h-6 w-6 items-center justify-center rounded"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleClear();
              }}
            >
              <X className="text-muted-foreground h-4 w-4" />
            </button>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn("w-auto p-0", popoverClassName)}
        align={popoverAlign}
        side={popoverSide}
        sideOffset={popoverSideOffset}
      >
        <Calendar
          className="date-range-calendar"
          mode="range"
          selected={date}
          onSelect={(range) => {
            let next = range;
            if (
              range?.from &&
              range?.to &&
              isSameDay(range.from, range.to) &&
              !date?.from
            ) {
              next = { from: range.from, to: undefined };
            }

            if (next && next.from) {
              next = { ...next, from: atLocalNoon(next.from) };
            }
            if (next && next.to) {
              next = { ...next, to: atLocalNoon(next.to) };
            }

            setDate(next);
            if (onChange) onChange(next);
            if (next?.from && next?.to) {
              setOpen(false);
            }
          }}
          numberOfMonths={2}
          captionLayout="dropdown"
          fromYear={2015}
          toYear={2050}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}

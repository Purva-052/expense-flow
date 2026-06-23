import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthYearPickerProps {
  month: number; // 1-12
  year: number;
  onChange: (month: number, year: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  isLoading?: boolean;
  className?: string;
}

const MONTHS = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  month,
  year,
  onChange,
  onPrev,
  onNext,
  isLoading = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);

  // Sync viewYear when year prop changes
  React.useEffect(() => {
    setViewYear(year);
  }, [year]);

  // Year list for dropdown (e.g., from 2020 to 2035)
  const years = Array.from({ length: 16 }, (_, i) => 2020 + i);

  const handleMonthSelect = (mVal: number) => {
    onChange(mVal, viewYear);
    setOpen(false);
  };

  const handlePrevYear = () => {
    setViewYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setViewYear((prev) => prev + 1);
  };

  const handlePrevMonth = () => {
    if (onPrev) {
      onPrev();
    } else {
      const d = new Date(year, month - 2, 1);
      onChange(d.getMonth() + 1, d.getFullYear());
    }
  };

  const handleNextMonth = () => {
    if (onNext) {
      onNext();
    } else {
      const d = new Date(year, month, 1);
      onChange(d.getMonth() + 1, d.getFullYear());
    }
  };

  const monthLabel = MONTHS[month - 1]?.label || "Jun";

  return (
    <div
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-lg border border-border bg-card shadow-sm h-9",
        className
      )}
    >
      {/* Prev Month Button */}
      <button
        type="button"
        onClick={handlePrevMonth}
        disabled={isLoading}
        aria-label="Previous month"
        className="flex items-center justify-center px-3.5 text-sky-600 dark:text-sky-400 hover:bg-muted/50 transition-colors disabled:opacity-50 border-r border-border font-bold text-base select-none"
      >
        «
      </button>

      {/* Popover / Clickable month-year label */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-5 min-w-[125px] text-sm font-bold text-foreground hover:bg-muted/50 transition-colors border-r border-border"
          >
            <span className="whitespace-nowrap">{`${monthLabel} ${year}`}</span>
            {isLoading ? (
              <RotateCcw className="h-3.5 w-3.5 text-rose-500 animate-spin shrink-0" />
            ) : (
              <span className="text-[10px] text-muted-foreground shrink-0">▼</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[280px] p-4 rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl dark:border-white/10 dark:bg-slate-900"
          align="center"
        >
          <div className="flex flex-col gap-4">
            {/* Header: Prev Year Button («), Year Selector Dropdown, Next Year Button (») */}
            <div className="flex items-center justify-between border-b border-border/50 pb-2 dark:border-white/10">
              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground dark:hover:bg-slate-800 text-lg font-bold transition-colors select-none"
                onClick={handlePrevYear}
              >
                «
              </button>

              {/* Borderless Year select dropdown */}
              <Select
                value={String(viewYear)}
                onValueChange={(val) => setViewYear(Number(val))}
              >
                <SelectTrigger className="h-8 w-fit border-none bg-transparent hover:bg-muted/50 dark:hover:bg-slate-800 text-base font-bold text-foreground focus:ring-0 shadow-none gap-1 px-2.5 rounded-lg [&_svg]:size-3.5">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground dark:bg-slate-900 dark:border-white/10 max-h-[200px]">
                  {years.map((y) => (
                    <SelectItem
                      key={y}
                      value={String(y)}
                      className="text-xs font-semibold focus:bg-accent focus:text-accent-foreground dark:focus:bg-slate-800 dark:focus:text-white"
                    >
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground dark:hover:bg-slate-800 text-lg font-bold transition-colors select-none"
                onClick={handleNextYear}
              >
                »
              </button>
            </div>

            {/* Month Grid (3x4) */}
            <div className="grid grid-cols-4 gap-2">
              {MONTHS.map((m) => {
                const isSelected = month === m.value && year === viewYear;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => handleMonthSelect(m.value)}
                    className={cn(
                      "flex items-center justify-center h-10 text-xs font-semibold rounded-lg transition-all border border-transparent",
                      isSelected
                        ? "bg-rose-500 text-white shadow-sm dark:bg-rose-600"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    )}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Next Month Button */}
      <button
        type="button"
        onClick={handleNextMonth}
        disabled={isLoading}
        aria-label="Next month"
        className="flex items-center justify-center px-3.5 text-sky-600 dark:text-sky-400 hover:bg-muted/50 transition-colors disabled:opacity-50 font-bold text-base select-none"
      >
        »
      </button>
    </div>
  );
};

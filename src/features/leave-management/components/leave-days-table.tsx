import { formatDate } from "date-fns";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface LeaveDaysTableProps {
  form: any;
  fields: any[];
  isViewOnly?: boolean;
  isEdit?: boolean;
  isDateRangeChanged?: boolean;
  mergedTableRows: any[];
  holidayDatesSet: Set<string>;
  watchLeaveDays: any[];
  contextSandwichDays: any[];
  watchFromDate: any;
  watchToDate: any;
  className?: string;
}

export const LeaveDaysTable = ({
  form,
  fields,
  isViewOnly,
  isEdit,
  isDateRangeChanged,
  mergedTableRows,
  holidayDatesSet,
  watchLeaveDays,
  contextSandwichDays,
  watchFromDate,
  watchToDate,
  className,
}: LeaveDaysTableProps) => {
  const getIsHoliday = (dateStr: string) => {
    if (!dateStr) return false;
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
    const formatted = match ? match[0] : dateStr;
    return holidayDatesSet.has(formatted);
  };

  const isDaySandwiched = (leaveDays: any[], idx: number) => {
    const day = leaveDays[idx];
    const isDayOff = day?.isWeekend || getIsHoliday(day?.date);
    if (!isDayOff) return false;

    // If this holiday is listed in contextSandwichDays (e.g. a public holiday
    // at the trailing/leading edge of the selected range with adjacent existing
    // leave), treat it as sandwiched for the UI label as well.
    if (
      day?.date &&
      getIsHoliday(day.date) &&
      contextSandwichDays.some((sd: any) => sd.date === day.date)
    ) {
      return true;
    }

    let prevDay = null;
    for (let j = idx - 1; j >= 0; j--) {
      const d = leaveDays[j];
      const isDOff = d?.isWeekend || getIsHoliday(d?.date);
      if (!isDOff) {
        prevDay = d;
        break;
      }
    }

    let nextDay = null;
    for (let j = idx + 1; j < leaveDays.length; j++) {
      const d = leaveDays[j];
      const isDOff = d?.isWeekend || getIsHoliday(d?.date);
      if (!isDOff) {
        nextDay = d;
        break;
      }
    }

    return !!(
      prevDay &&
      nextDay &&
      prevDay.dayType === "full" &&
      nextDay.dayType === "full"
    );
  };

  if (isEdit && !isDateRangeChanged ? fields.length === 0 : mergedTableRows.length === 0)
    return null;

  const showStaticFields = isViewOnly || (isEdit && !isDateRangeChanged);
  // In view/edit mode we still only render the original fields array (if dates haven't changed)
  const rowsToRender = showStaticFields
    ? fields.map((f, idx) => {
        const fromStr = watchFromDate ? formatDate(new Date(watchFromDate), "yyyy-MM-dd") : "";
        const toStr = watchToDate ? formatDate(new Date(watchToDate), "yyyy-MM-dd") : "";
        const isSandwichOnly = !!(f.isSandwichLeave && (f.date < fromStr || f.date > toStr));
        return {
          id: f.id,
          date: f.date,
          dayName: f.dayName,
          isWeekend: f.isWeekend,
          isHoliday: getIsHoliday(f.date),
          isSandwichOnly,
          fieldIdx: idx,
        };
      })
    : mergedTableRows;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden text-sm shadow-sm bg-white dark:bg-slate-950 flex flex-col flex-1 min-h-0",
        className
      )}
    >
      {/* Header */}
      <div className="grid grid-cols-[1.1fr_1fr_1.4fr_1.1fr] gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 font-semibold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
        <span>Date</span>
        <span>Day</span>
        <span>Half / Full</span>
        <span>1st / 2nd</span>
      </div>

      {/* Rows */}
      <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900 flex-1 min-h-[200px]">
        {rowsToRender.map((row) => {
          // ── Sandwich-only rows (off-days outside the selected range) ──
          if (row.isSandwichOnly) {
            const isDayHoliday = row.isHoliday;
            const isWknd = row.isWeekend;
            return (
              <div
                key={row.id}
                className="grid grid-cols-[1.1fr_1fr_1.4fr_1.1fr] gap-1.5 items-center px-3 py-3 bg-rose-50/50 dark:bg-rose-950/20 border-l-2 border-l-rose-500"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums text-xs">
                  {formatDate(new Date(row.date), "dd MMM yyyy")}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex flex-col">
                  <span className="text-[11px]">{row.dayName}</span>
                  <span className="text-[8px] text-rose-500 font-bold leading-none mt-0.5 animate-pulse">
                    Sandwich Leave
                  </span>
                  {isWknd && !isDayHoliday && (
                    <span className="text-[8px] text-amber-500 opacity-80 leading-none mt-0.5">
                      Weekly Off
                    </span>
                  )}
                  {isDayHoliday && (
                    <span className="text-[8px] text-indigo-500 opacity-80 leading-none mt-0.5 font-semibold">
                      Public Holiday
                    </span>
                  )}
                </span>
                {/* Non-editable — sandwich days are always full-day counted */}
                <span className="text-[10px] text-muted-foreground/60 italic">Full (auto)</span>
                <span className="text-[10px] text-muted-foreground/60">—</span>
              </div>
            );
          }

          // ── Normal field rows ──
          const idx = row.fieldIdx;
          const field = fields[idx];
          if (!field) return null;

          const isWeekend = field.isWeekend;
          const isDayHoliday = getIsHoliday(field.date);
          const isDayOff = isWeekend || isDayHoliday;
          const dayType = form.watch(`leaveDays.${idx}.dayType`);
          const sandwiched =
            `leaveDays.${idx}.isSandwichLeave`
              ? !!field.isSandwichLeave || isDaySandwiched(watchLeaveDays || [], idx)
              : false;
          const hasHalfTypeError =
            !!form.formState.errors.leaveDays?.[idx]?.halfType;

          return (
            <div
              key={field.id}
              className={cn(
                "grid grid-cols-[1.1fr_1fr_1.4fr_1.1fr] gap-1.5 items-center px-3 py-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/20 relative",
                isDayOff && "bg-slate-50 dark:bg-slate-900/40 opacity-60",
                sandwiched &&
                  "bg-rose-50/50 dark:bg-rose-950/20 border-l-2 border-l-rose-500 opacity-100",
                hasHalfTypeError &&
                  "pb-6 pt-2.5 bg-rose-50/10 dark:bg-rose-950/20 border-l-2 border-l-rose-500"
              )}
            >
              {/* Date */}
              <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums text-xs">
                {formatDate(new Date(field.date), "dd MMM yyyy")}
              </span>

              {/* Day name */}
              <span
                className={cn(
                  isDayOff || sandwiched
                    ? "text-amber-600 dark:text-amber-400 font-semibold flex flex-col"
                    : "text-muted-foreground"
                )}
              >
                <span className="text-[11px]">{field.dayName}</span>
                {sandwiched && (
                  <span className="text-[8px] text-rose-500 font-bold leading-none mt-0.5 animate-pulse">
                    Sandwich Leave
                  </span>
                )}
                {!sandwiched && isWeekend && (
                  <span className="text-[8px] text-amber-500 opacity-80 leading-none mt-0.5">
                    Weekly Off
                  </span>
                )}
                {!sandwiched && isDayHoliday && (
                  <span className="text-[8px] text-indigo-500 opacity-80 leading-none mt-0.5 font-semibold">
                    Public Holiday
                  </span>
                )}
              </span>

              {/* Half / Full selector */}
              <FormField
                control={form.control}
                name={`leaveDays.${idx}.dayType`}
                render={({ field: f }) => (
                  <FormItem className="m-0 p-0 space-y-0">
                    <FormControl>
                      <RadioGroup
                        onValueChange={(val) => {
                          f.onChange(val);
                          if (val === "full") {
                            form.setValue(`leaveDays.${idx}.halfType`, null);
                          }
                        }}
                        value={f.value}
                        disabled={isViewOnly || isDayOff}
                        className="flex items-center gap-1.5"
                      >
                        <div className="flex items-center gap-1 cursor-pointer">
                          <RadioGroupItem
                            value="half"
                            id={`half-${idx}`}
                            className="h-3.5 w-3.5"
                          />
                          <Label
                            htmlFor={`half-${idx}`}
                            className={cn(
                              "text-[11px] font-medium cursor-pointer",
                              (isViewOnly || isDayOff) &&
                                "text-muted-foreground/40 cursor-not-allowed"
                            )}
                          >
                            Half
                          </Label>
                        </div>
                        <div className="flex items-center gap-1 cursor-pointer">
                          <RadioGroupItem
                            value="full"
                            id={`full-${idx}`}
                            className="h-3.5 w-3.5"
                          />
                          <Label
                            htmlFor={`full-${idx}`}
                            className={cn(
                              "text-[11px] font-medium cursor-pointer",
                              (isViewOnly || isDayOff) &&
                                "text-muted-foreground/40 cursor-not-allowed"
                            )}
                          >
                            Full
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* 1st / 2nd half selector */}
              <FormField
                control={form.control}
                name={`leaveDays.${idx}.halfType`}
                render={({ field: f }) => (
                  <FormItem className="m-0 p-0 space-y-0 relative">
                    <FormControl>
                      <RadioGroup
                        onValueChange={f.onChange}
                        value={f.value || ""}
                        disabled={
                          isViewOnly || isDayOff || dayType !== "half"
                        }
                        className="flex items-center gap-1.5"
                      >
                        <div className="flex items-center gap-1 cursor-pointer">
                          <RadioGroupItem
                            value="first_half"
                            id={`1st-${idx}`}
                            className="h-3.5 w-3.5"
                            disabled={isDayOff || dayType !== "half"}
                          />
                          <Label
                            htmlFor={`1st-${idx}`}
                            className={cn(
                              "text-[11px] font-medium cursor-pointer",
                              (isViewOnly ||
                                isDayOff ||
                                dayType !== "half") &&
                                "text-muted-foreground/40 cursor-not-allowed"
                            )}
                          >
                            1st
                          </Label>
                        </div>
                        <div className="flex items-center gap-1 cursor-pointer">
                          <RadioGroupItem
                            value="second_half"
                            id={`2nd-${idx}`}
                            className="h-3.5 w-3.5"
                            disabled={isDayOff || dayType !== "half"}
                          />
                          <Label
                            htmlFor={`2nd-${idx}`}
                            className={cn(
                              "text-[11px] font-medium cursor-pointer",
                              (isViewOnly ||
                                isDayOff ||
                                dayType !== "half") &&
                                "text-muted-foreground/40 cursor-not-allowed"
                            )}
                          >
                            2nd
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-[9px] text-rose-500 font-semibold absolute -bottom-3.5 left-0 whitespace-nowrap leading-none" />
                  </FormItem>
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

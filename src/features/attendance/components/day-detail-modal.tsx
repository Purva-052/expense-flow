import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Building2, CalendarDays, RotateCcw } from "lucide-react";

interface DayDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  selectedDayDetails: any;
  isLoadingDayDetails: boolean;
}

const formatMewurkTime = (timeStr: string | null) => {
  if (!timeStr) return "-";
  if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
  try {
    const isoStr = timeStr.endsWith("Z") ? timeStr : `${timeStr}Z`;
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) {
      const parts = timeStr.split(":");
      if (parts.length < 2) return timeStr;
      let hrs = parseInt(parts[0]);
      const mins = parseInt(parts[1]);
      if (isNaN(hrs) || isNaN(mins)) return timeStr;
      const ampm = hrs >= 12 ? "PM" : "AM";
      hrs = hrs % 12;
      if (hrs === 0) hrs = 12;
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${ampm}`;
    }
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeStr;
  }
};

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onOpenChange,
  employeeName,
  selectedDayDetails,
  isLoadingDayDetails,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border-border shadow-2xl p-6 rounded-2xl text-card-foreground">
        <DialogHeader className="pb-4 border-b border-border flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-foreground">
                Clock In/Out Details for {employeeName}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {selectedDayDetails?.policyName || "Devstree Shift Policy"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoadingDayDetails ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <RotateCcw className="h-8 w-8 text-rose-500 animate-spin" />
            <span className="text-xs text-muted-foreground font-semibold">
              Loading clock details...
            </span>
          </div>
        ) : !selectedDayDetails ? (
          <div className="text-center py-12 text-xs text-muted-foreground font-medium">
            No clock details found for this date.
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            {/* Date & Shift Panel */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-muted/45 p-4 border border-border rounded-xl">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-rose-500 shrink-0" />
                <span className="text-xs font-bold text-foreground">
                  {(() => {
                    if (!selectedDayDetails.attendanceDate) return "-";
                    try {
                      const date = new Date(selectedDayDetails.attendanceDate);
                      return date.toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });
                    } catch {
                      return selectedDayDetails.attendanceDate;
                    }
                  })()}
                </span>
              </div>

              <div className="bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-lg text-right">
                <span className="text-[10px] font-bold text-rose-500 block uppercase">
                  {selectedDayDetails.shiftName || "GS01"} - General Shift
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 block">
                  {(() => {
                    const formatTimeOnly = (tStr: string | null) => {
                      if (!tStr) return "-";
                      try {
                        const date = new Date(tStr);
                        if (isNaN(date.getTime())) {
                          const timePart = tStr.split(" ")[1];
                          if (timePart) {
                            const parts = timePart.split(":");
                            return `${parts[0]}:${parts[1]}`;
                          }
                          return tStr;
                        }
                        return date.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                      } catch {
                        return tStr;
                      }
                    };
                    return `${formatTimeOnly(selectedDayDetails.shiftStartTime)} to ${formatTimeOnly(selectedDayDetails.shiftEndTime)}`;
                  })()}
                </span>
              </div>
            </div>

            {/* Punches Table with inline break gaps */}
            {(() => {
              const sorted = [...(selectedDayDetails.clockInDetails || [])].sort(
                (a: any, b: any) => {
                  const da = a.clockTime.endsWith("Z")
                    ? a.clockTime
                    : `${a.clockTime}Z`;
                  const db = b.clockTime.endsWith("Z")
                    ? b.clockTime
                    : `${b.clockTime}Z`;
                  return new Date(da).getTime() - new Date(db).getTime();
                }
              );

              let totalBreakMs = 0;
              for (let i = 0; i < sorted.length - 1; i++) {
                if (
                  sorted[i].inOutType === "OUT" &&
                  sorted[i + 1]?.inOutType === "IN"
                ) {
                  const outIso = sorted[i].clockTime.endsWith("Z")
                    ? sorted[i].clockTime
                    : `${sorted[i].clockTime}Z`;
                  const inIso = sorted[i + 1].clockTime.endsWith("Z")
                    ? sorted[i + 1].clockTime
                    : `${sorted[i + 1].clockTime}Z`;
                  const gap =
                    new Date(inIso).getTime() - new Date(outIso).getTime();
                  if (gap > 0) totalBreakMs += gap;
                }
              }

              const fmtMs = (ms: number) => {
                const mins = Math.floor(ms / 60000);
                return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")} HRS`;
              };
              const totalBreakMins = Math.floor(totalBreakMs / 60000);

              if (sorted.length === 0) {
                return (
                  <div className="text-center py-8 text-xs text-muted-foreground border border-border rounded-xl">
                    No punch records for this date.
                  </div>
                );
              }

              return (
                <>
                  <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background">
                    <div className="overflow-y-auto max-h-[300px]">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-muted border-b border-border text-muted-foreground font-bold sticky top-0 z-10">
                            <th className="px-3 py-2.5 w-8">#</th>
                            <th className="px-3 py-2.5">In/Out</th>
                            <th className="px-3 py-2.5">Time (IST)</th>
                            <th className="px-3 py-2.5">Source</th>
                            <th className="px-3 py-2.5">Device</th>
                          </tr>
                        </thead>
                        <tbody className="font-medium text-foreground">
                          {sorted.map((punch: any, index: number) => {
                            let breakGapMs = 0;
                            const next = sorted[index + 1];
                            if (
                              punch.inOutType === "OUT" &&
                              next?.inOutType === "IN"
                            ) {
                              const outIso = punch.clockTime.endsWith("Z")
                                ? punch.clockTime
                                : `${punch.clockTime}Z`;
                              const inIso = next.clockTime.endsWith("Z")
                                ? next.clockTime
                                : `${next.clockTime}Z`;
                              const gap =
                                new Date(inIso).getTime() -
                                new Date(outIso).getTime();
                              if (gap > 0) breakGapMs = gap;
                            }
                            return (
                              <React.Fragment key={index}>
                                <tr className="border-b border-border hover:bg-muted/10 transition-colors">
                                  <td className="px-3 py-2.5 text-muted-foreground font-semibold">
                                    {index + 1}
                                  </td>
                                  <td className="px-3 py-2.5">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                        punch.inOutType === "IN"
                                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                      }`}
                                    >
                                      {punch.inOutType}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2.5 font-semibold text-foreground tabular-nums">
                                    {formatMewurkTime(punch.clockTime)}
                                  </td>
                                  <td className="px-3 py-2.5 text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <span className="h-4 w-4 bg-muted border border-border rounded flex items-center justify-center text-[9px] font-bold shrink-0">
                                        {punch.sourceName
                                          ? punch.sourceName[0]
                                          : "K"}
                                      </span>
                                      {punch.sourceName || "Kiosk"}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2.5 text-muted-foreground truncate max-w-[110px]">
                                    {punch.deviceName ||
                                      punch.officeName ||
                                      "-"}
                                  </td>
                                </tr>
                                {breakGapMs > 0 && (
                                  <tr className="bg-amber-500/5">
                                    <td colSpan={5} className="px-3 py-1.5">
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 h-px bg-amber-500/20" />
                                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap flex items-center gap-1">
                                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                                          Break: {fmtMs(breakGapMs)}
                                        </span>
                                        <div className="flex-1 h-px bg-amber-500/20" />
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Total Break Summary */}
                  <div className="flex items-center justify-between bg-muted/40 border border-border rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Total Break Time
                      </span>
                    </div>
                    <span
                      className={`text-sm font-extrabold tabular-nums ${
                        totalBreakMins > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {fmtMs(totalBreakMs)}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

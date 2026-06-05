/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeaveDashboardGroup } from "../types/leave-dashboard";
import { normalizeDateStr } from "../utils/leave-helpers";

interface LeaveTodayBoardContentProps {
  groups: LeaveDashboardGroup[];
  totalOnLeave: number;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  loading?: boolean;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return `rgba(148, 163, 184, ${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function LeaveTodayBoardContent({
  groups,
  loading,
}: LeaveTodayBoardContentProps) {


  return (
    <div className="space-y-5">
      {/* Date Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* <p className="text-xs text-muted-foreground">
          Grouped by technology · {dateLabel}
        </p> */}

        {/* <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2 py-1.5 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <button
            type="button"
            onClick={goToday}
            className="text-sm font-semibold text-foreground px-2 min-w-[180px] text-center hover:text-primary transition-colors"
          >
            {dateLabel}
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div> */}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Loading leave board...
          </span>
        </div>
      ) : groups.length === 0 ? (
        <Card className="border-dashed bg-background">
          <CardContent className="py-16 text-center text-muted-foreground text-sm">
            No employees on leave for this date.
          </CardContent>
        </Card>
      ) : (
        /* Horizontal scrollable row of technology group cards */
        <div className="flex gap-4 overflow-x-auto pb-2">
          {groups.map((group) => {
            const techColor = group.technologyColor ?? "#94a3b8";
            return (
              <div
                key={group.technologyId}
                className="flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden shrink-0"
                style={{
                  width: 240,
                  minWidth: 220,
                  maxWidth: 260,
                  minHeight: 280,
                  borderColor: hexToRgba(techColor, 0.4),
                  borderTopWidth: 3,
                  borderTopColor: techColor,
                }}
              >
                {/* Technology header */}
                <div
                  className="px-4 pt-4 pb-3"
                  style={{
                    backgroundColor: hexToRgba(techColor, 0.08),
                  }}
                >
                  <h3
                    className="font-bold text-[15px] leading-tight"
                    style={{ color: techColor }}
                  >
                    {group.technologyName}{" "}
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-full ml-0.5 align-middle"
                      style={{
                        backgroundColor: hexToRgba(techColor, 0.18),
                        color: techColor,
                      }}
                    >
                      {group.count}
                    </span>
                  </h3>
                </div>

                {/* Divider */}
                <div
                  className="h-px w-full"
                  style={{ backgroundColor: hexToRgba(techColor, 0.2) }}
                />

                {/* Scrollable employee list — no View All */}
                <ul
                  className="flex-1 overflow-y-auto divide-y"
                  style={{  
                    maxHeight: 340,
                    minHeight: 220,
                    ["--tw-divide-color" as any]: hexToRgba(techColor, 0.1),
                  }}
                >
                  {group.employees.map((emp) => (
                    <li
                      key={`${emp.employeeId}-${emp.leaveId}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                      {emp.profilePicUrl ? (
                        <img
                          src={emp.profilePicUrl}
                          alt={emp.employeeName}
                          className="h-9 w-9 rounded-full object-cover shrink-0 border border-border/40"
                        />
                      ) : (
                        <div
                          className="h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: techColor }}
                        >
                          {getInitials(emp.employeeName)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate text-foreground leading-tight">
                          {emp.employeeName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {emp.leaveTypeName}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface LeaveTodayBoardModalProps extends LeaveTodayBoardContentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveTodayBoardModal({
  open,
  onOpenChange,
  groups,
  totalOnLeave,
  selectedDate,
  onDateChange,
  loading,
}: LeaveTodayBoardModalProps) {
  const isToday =
    normalizeDateStr(selectedDate) === normalizeDateStr(new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Wide, tall modal — expands to fit multiple tech columns */}
      <DialogContent
        className="flex flex-col gap-0 overflow-hidden p-0"
        style={{
          width: "min(95vw, 1100px)",
          maxWidth: "1100px",
          maxHeight: "85vh",
        }}
      >
        <DialogHeader className="shrink-0 border-b border-border/40 px-6 py-4 text-left">
          <DialogTitle className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {isToday ? "On Leave Today" : "On Leave"} ({totalOnLeave})
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <LeaveTodayBoardContent
            groups={groups}
            totalOnLeave={totalOnLeave}
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            loading={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday,
  getWeek,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { InterviewEvent } from "../types";

interface PremiumCalendarProps {
  events: InterviewEvent[];
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: InterviewEvent) => void;
  onEventEdit: (event: InterviewEvent, e: React.MouseEvent) => void;
  onEventDelete: (event: InterviewEvent, e: React.MouseEvent) => void;
  onMonthChange: (date: Date) => void;
  view?: "month" | "week";
  onViewChange?: (view: "month" | "week") => void;
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const PremiumCalendar = ({
  events,
  currentDate,
  onDateClick,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onMonthChange,
  view = "month",
  onViewChange,
}: PremiumCalendarProps) => {
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, InterviewEvent[]>();
    events.forEach((event) => {
      const eventDate = new Date(event.start);
      const dateKey = format(eventDate, "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [events]);

  const handlePreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    onMonthChange(newDate);
  };

  const handleToday = () => {
    onMonthChange(new Date());
  };

  const getEventsForDate = (date: Date): InterviewEvent[] => {
    const dateKey = format(date, "yyyy-MM-dd");
    return eventsByDate.get(dateKey) || [];
  };

  const renderEvent = (event: InterviewEvent, isCompact = false) => {
    const isHovered = hoveredEvent === event.id;
    const bgColor = event.backgroundColor || "#10B981";

    return (
      <div
        key={event.id}
        className={cn(
          "group relative rounded-md px-2 py-1 text-xs font-medium text-white cursor-pointer transition-all duration-200 mb-1",
          isCompact ? "text-[10px] px-1.5 py-0.5" : "text-xs",
          "hover:shadow-lg hover:scale-[1.02] hover:z-10"
        )}
        style={{
          backgroundColor: bgColor,
          boxShadow: isHovered
            ? `0 4px 12px ${bgColor}40`
            : "0 1px 3px rgba(0,0,0,0.1)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick(event);
        }}
        onMouseEnter={() => setHoveredEvent(event.id)}
        onMouseLeave={() => setHoveredEvent(null)}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="truncate flex-1 font-semibold">{event.title}</span>
          {isHovered && !isCompact && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-0.5 rounded hover:bg-white/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventEdit(event, e);
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-0.5 rounded hover:bg-white/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventDelete(event, e);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (view === "week") {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <Card className="border-2 shadow-xl bg-gradient-to-br from-background via-background to-muted/20">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                  className="h-9 w-9 rounded-full border-2 hover:border-primary/50 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="rounded-full border-2 hover:border-primary/50 transition-all"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  className="h-9 w-9 rounded-full border-2 hover:border-primary/50 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {onViewChange && (
              <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                <Button
                  variant={view === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange("month")}
                  className="rounded-md"
                >
                  Month
                </Button>
                <Button
                  variant={view === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange("week")}
                  className="rounded-md"
                >
                  Week
                </Button>
              </div>
            )}
          </div>

          {/* Week View */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col border-2 rounded-xl p-3 transition-all duration-200",
                    isCurrentDay
                      ? "border-primary bg-primary/5 shadow-lg scale-105"
                      : "border-border/50 bg-card hover:border-primary/30 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {weekDays[day.getDay()]}
                      </span>
                      <span
                        className={cn(
                          "text-lg font-bold",
                          isCurrentDay ? "text-primary" : "text-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                    {isCurrentDay && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                        Today
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 space-y-1 min-h-[100px]">
                    {dayEvents.slice(0, 3).map((event) => renderEvent(event))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground font-medium px-2 py-1 rounded bg-muted/50">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-xl bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {events.length} interview{events.length !== 1 ? "s" : ""}{" "}
                scheduled
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-10 w-10 rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm px-4"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-10 w-10 rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            {onViewChange && (
              <div className="ml-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-lg border border-border/50">
                <Button
                  variant={view === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange("month")}
                  className="rounded-md"
                >
                  Month
                </Button>
                <Button
                  variant={view === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange("week")}
                  className="rounded-md"
                >
                  Week
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center py-3 font-semibold text-sm text-muted-foreground uppercase tracking-wide"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, dayIdx) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={dayIdx}
                className={cn(
                  "min-h-[120px] rounded-xl border-2 p-2 transition-all duration-200 cursor-pointer group",
                  isCurrentMonth
                    ? "bg-card border-border/50 hover:border-primary/50 hover:shadow-md"
                    : "bg-muted/30 border-border/30 opacity-60",
                  isCurrentDay &&
                    "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20",
                  hasEvents && "hover:shadow-lg hover:scale-[1.02]"
                )}
                onClick={() => onDateClick(day)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isCurrentDay
                        ? "text-primary text-lg"
                        : isCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground",
                      isCurrentDay && "bg-primary/10 px-2 py-0.5 rounded-full"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {hasEvents && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/20"
                    >
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  {dayEvents
                    .slice(0, 2)
                    .map((event) => renderEvent(event, true))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted/50">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

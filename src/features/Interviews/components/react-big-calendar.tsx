/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback } from "react";
import { Calendar, momentLocalizer, View, SlotInfo } from "react-big-calendar";
import { format } from "date-fns";
import moment from "moment";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InterviewEvent } from "../types";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface ReactBigCalendarProps {
  events: InterviewEvent[];
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: InterviewEvent) => void;
  onEventEdit: (event: InterviewEvent, e: React.MouseEvent) => void;
  onEventDelete: (event: InterviewEvent, e: React.MouseEvent) => void;
  onNavigate: (date: Date) => void;
  view?: View;
  onViewChange?: (
    view: "month" | "week" | "day" | "work_week" | "agenda"
  ) => void;
}

const formats = {
  dayFormat: (date: Date) => format(date, "EEE"),
  weekdayFormat: (date: Date) => format(date, "EEE"),
  dayHeaderFormat: (date: Date) => format(date, "EEEE, MMMM d"),
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, "EEE, MMM d")} - ${format(end, "EEE, MMM d")}`,
  eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`,
  timeGutterFormat: (date: Date) => format(date, "h:mm a"),
};

export const ReactBigCalendar = ({
  events,
  currentDate,
  onDateClick,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onNavigate,
  view = "month",
  onViewChange,
}: ReactBigCalendarProps) => {
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  // Calculate the date to display in header based on view
  const getHeaderDate = useMemo(() => {
    const today = new Date();

    if (view === "month") {
      // For month view, show today's date if it's in the current month, otherwise first day
      const isCurrentMonth =
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth();

      if (isCurrentMonth) {
        return today;
      } else {
        // Show first day of the month being viewed
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      }
    } else if (view === "week") {
      // For week view, show the start of the week (Sunday)
      const dayOfWeek = currentDate.getDay();
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - dayOfWeek);
      return weekStart;
    } else {
      // For day view, show the current date
      return currentDate;
    }
  }, [currentDate, view]);

  // Calculate week end date for week view
  const getWeekEndDate = useMemo(() => {
    if (view === "week") {
      const weekEnd = new Date(getHeaderDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return weekEnd;
    }
    return null;
  }, [getHeaderDate, view]);

  const calendarEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    return events
      .map((event) => {
        try {
          const startDate = new Date(event.start);
          const endDate = event.end
            ? new Date(event.end)
            : new Date(startDate.getTime() + 60 * 60 * 1000);

          // Validate dates
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return null;
          }

          return {
            id: event.id,
            title: event.title || "Untitled Interview",
            start: startDate,
            end: endDate,
            resource: event,
            backgroundColor: event.backgroundColor || "#10B981",
            borderColor:
              event.borderColor || event.backgroundColor || "#10B981",
          };
        } catch {
          return null;
        }
      })
      .filter((event) => event !== null);
  }, [events]);

  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      onDateClick(slotInfo.start);
    },
    [onDateClick]
  );

  const handleSelectEvent = useCallback(
    (event: any) => {
      if (event && event.resource) {
        onEventClick(event.resource);
      }
    },
    [onEventClick]
  );

  const handleNavigate = useCallback(
    (newDate: Date) => {
      onNavigate(newDate);
    },
    [onNavigate]
  );

  const handleViewChange = useCallback(
    (newView: View) => {
      if (
        onViewChange &&
        (newView === "month" ||
          newView === "week" ||
          newView === "day" ||
          newView === "work_week" ||
          newView === "agenda")
      ) {
        onViewChange(newView);
      }
    },
    [onViewChange]
  );

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    handleNavigate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    handleNavigate(newDate);
  };

  const handleToday = () => {
    handleNavigate(new Date());
  };

  const eventStyleGetter = (event: any) => {
    if (!event) return { style: {} };

    const bgColor =
      event.backgroundColor || event.resource?.backgroundColor || "#10B981";
    const isHovered = hoveredEvent === event.id;

    return {
      style: {
        backgroundColor: bgColor,
        borderColor: bgColor,
        borderLeft: `4px solid ${bgColor}`,
        borderRadius: "6px",
        color: "white",
        padding: "4px 8px",
        fontSize: "13px",
        fontWeight: 600,
        boxShadow: isHovered
          ? `0 4px 12px ${bgColor}40`
          : "0 2px 6px rgba(0,0,0,0.15)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        opacity: 1,
      },
    };
  };

  const CustomEvent = ({ event }: { event: any }) => {
    if (!event || !event.resource) return null;

    const interviewEvent = event.resource as InterviewEvent;
    const isHovered = hoveredEvent === event.id;

    return (
      <div
        className="group relative w-full h-full flex items-center justify-between gap-2 px-2"
        onMouseEnter={() => setHoveredEvent(event.id)}
        onMouseLeave={() => setHoveredEvent(null)}
        onClick={(e) => {
          e.stopPropagation();
          handleSelectEvent(event);
        }}
      >
        <span className="truncate flex-1 font-semibold text-white">
          {event.title || interviewEvent.title || "Untitled Interview"}
        </span>
        {isHovered && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1 rounded hover:bg-white/20 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventEdit(interviewEvent, e);
                  }}
                >
                  <Edit2 className="h-3 w-3 text-white" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Edit Interview</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-1 rounded hover:bg-red-500/50 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventDelete(interviewEvent, e);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-white" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete Interview</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border-2 shadow-xl  pt-0!   overflow-hidden">
      {/* Premium Header */}
      <div className=" border-b-2  p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10 shadow-sm">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {view === "month"
                  ? format(getHeaderDate, "EEEE, MMMM d, yyyy")
                  : view === "week" && getWeekEndDate
                    ? `${format(getHeaderDate, "EEEE, MMMM d")} - ${format(
                        getWeekEndDate,
                        "EEEE, MMMM d, yyyy"
                      )}`
                    : format(getHeaderDate, "EEEE, MMMM d, yyyy")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {format(currentDate, "MMMM yyyy")} • {events.length} interview
                {events.length !== 1 ? "s" : ""} scheduled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrev}
                    className="h-10 w-10 rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous</TooltipContent>
              </Tooltip>

              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm px-4"
              >
                Today
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    className="h-10 w-10 rounded-full border-2 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next</TooltipContent>
              </Tooltip>
            </div>

            {/* View Switcher */}
            {onViewChange && (
              <div className="ml-2 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-lg border border-border/50">
                <Button
                  variant={view === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewChange("month")}
                  className="rounded-md"
                >
                  Month
                </Button>
                <Button
                  variant={view === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewChange("week")}
                  className="rounded-md"
                >
                  Week
                </Button>
                <Button
                  variant={view === "day" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewChange("day")}
                  className="rounded-md"
                >
                  Day
                </Button>
              </div>
            )}

            {/* Add Interview Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => onDateClick(new Date())}
                  className="h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/80"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Schedule New Interview</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="p-6">
        <div className="premium-rbc-calendar" style={{ height: "70vh" }}>
          {calendarEvents.length === 0 && events.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No interviews scheduled</p>
                <p className="text-sm mt-2">
                  Click on a date to schedule an interview
                </p>
              </div>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              view={view}
              onView={handleViewChange}
              date={currentDate}
              onNavigate={handleNavigate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              formats={formats}
              eventPropGetter={eventStyleGetter}
              components={{
                event: CustomEvent,
                header: ({ date }: { date: Date }) => {
                  // Use moment to format since we're using momentLocalizer
                  const dayName = moment(date).format("ddd");
                  return <div className="rbc-header-custom">{dayName}</div>;
                },
              }}
              popup
              showMultiDayTimes
              step={60}
              timeslots={1}
              defaultDate={currentDate}
              className="rbc-calendar-premium"
            />
          )}
        </div>
      </div>

      <style>{`
        .premium-rbc-calendar {
          --rbc-border-color: hsl(var(--border) / 0.5);
          --rbc-selected-bg-color: hsl(var(--primary) / 0.1);
          --rbc-today-bg-color: hsl(var(--primary) / 0.05);
        }
        
        .premium-rbc-calendar .rbc-calendar-premium {
          font-family: inherit;
          background: transparent;
        }
        
        .premium-rbc-calendar .rbc-header {
          padding: 16px 8px;
          background: hsl(var(--muted) / 0.3);
          border-bottom: 2px solid hsl(var(--border) / 0.5);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          color: hsl(var(--muted-foreground));
          text-align: center;
        }
        
        .premium-rbc-calendar .rbc-header-custom {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          color: hsl(var(--muted-foreground));
          text-align: center;
        }
        
        .premium-rbc-calendar .rbc-day-bg {
          border-color: hsl(var(--border) / 0.5);
          transition: all 0.2s ease;
        }
        
        .premium-rbc-calendar .rbc-day-bg:hover {
          background-color: hsl(var(--muted) / 0.2);
        }
        
        .premium-rbc-calendar .rbc-today {
          background-color: hsl(var(--primary) / 0.05) !important;
          border-color: hsl(var(--primary) / 0.3) !important;
        }
        
        .premium-rbc-calendar .rbc-off-range-bg {
          background: hsl(var(--muted) / 0.1);
          opacity: 0.5;
        }
        
        .premium-rbc-calendar .rbc-date-cell {
          padding: 8px;
        }
        
        .premium-rbc-calendar .rbc-date-cell > a {
          font-weight: 600;
          color: hsl(var(--foreground));
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .premium-rbc-calendar .rbc-date-cell.rbc-now > a {
          color: hsl(var(--primary));
          font-weight: 700;
          background: hsl(var(--primary) / 0.1);
        }
        
        .premium-rbc-calendar .rbc-toolbar {
          display: none;
        }
        
        .premium-rbc-calendar .rbc-time-slot {
          border-color: hsl(var(--border) / 0.3);
        }
        
        .premium-rbc-calendar .rbc-time-header-content {
          border-color: hsl(var(--border) / 0.5);
        }
        
        .premium-rbc-calendar .rbc-time-content {
          border-color: hsl(var(--border) / 0.5);
        }
        
        .premium-rbc-calendar .rbc-event {
          border-radius: 6px;
          padding: 0;
          border: none;
        }
        
        .premium-rbc-calendar .rbc-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
        }
        
        .premium-rbc-calendar .rbc-selected {
          background-color: hsl(var(--primary) / 0.1) !important;
        }
        
        .premium-rbc-calendar .rbc-show-more {
          background-color: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .premium-rbc-calendar .rbc-show-more:hover {
          background-color: hsl(var(--primary) / 0.2);
        }
        
        .premium-rbc-calendar .rbc-agenda-view table {
          border-color: hsl(var(--border) / 0.5);
        }
        
        .premium-rbc-calendar .rbc-agenda-date-cell,
        .premium-rbc-calendar .rbc-agenda-time-cell {
          border-color: hsl(var(--border) / 0.5);
          padding: 12px;
        }
        
        .premium-rbc-calendar .rbc-agenda-event-cell {
          border-color: hsl(var(--border) / 0.5);
          padding: 12px;
        }
      `}</style>
    </Card>
  );
};

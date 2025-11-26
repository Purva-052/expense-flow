/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback } from "react";
import { Calendar, momentLocalizer, View, SlotInfo } from "react-big-calendar";
import { format } from "date-fns";
import moment from "moment";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  onViewChange?: (view: View) => void;
}

export const ReactBigCalendar = ({
  events,
  currentDate,
  onDateClick,
  onEventClick,
  onNavigate,
  view = "month",
  onViewChange,
}: ReactBigCalendarProps) => {
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  const calendarEvents = useMemo(() => {
    if (!events) return [];
    return events.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: event.end ? new Date(event.end) : new Date(event.start),
      title: event.title || "Untitled",
    }));
  }, [events]);

  const handleNavigate = useCallback(
    (newDate: Date) => onNavigate(newDate),
    [onNavigate]
  );

  const handleViewChange = useCallback(
    (newView: View) => onViewChange && onViewChange(newView),
    [onViewChange]
  );

  // Navigation handlers
  const onPrevClick = () => {
    const newDate = new Date(currentDate);
    if (view === "month") newDate.setMonth(newDate.getMonth() - 1);
    else if (view === "week") newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    handleNavigate(newDate);
  };

  const onNextClick = () => {
    const newDate = new Date(currentDate);
    if (view === "month") newDate.setMonth(newDate.getMonth() + 1);
    else if (view === "week") newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    handleNavigate(newDate);
  };

  const onTodayClick = () => handleNavigate(new Date());

  // Custom Event Component
  const CustomEvent = ({ event }: { event: any }) => {
    const isHovered = hoveredEvent === event.id;
    return (
      <div
        className="h-full w-full px-2 py-0.5 text-xs font-medium leading-tight overflow-hidden truncate transition-all duration-200"
        onMouseEnter={() => setHoveredEvent(event.id)}
        onMouseLeave={() => setHoveredEvent(null)}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick(event);
        }}
        style={{ opacity: isHovered ? 0.9 : 1 }}
      >
        {view === "month" && (
          <span className="mr-1 text-[10px] opacity-90">
            {format(event.start, "h:mma")}
          </span>
        )}
        {event.title}
      </div>
    );
  };

  // Custom Header Component for Week/Day view columns
  const CustomHeader = ({ date }: { date: Date; label?: string }) => {
    const isToday = new Date().toDateString() === date.toDateString();

    return (
      <div className="flex flex-col items-center justify-center py-3 px-2 min-w-[60px]">
        <span
          className={`text-xs font-medium uppercase mb-2 whitespace-nowrap ${isToday ? "text-blue-600" : "text-gray-500"}`}
        >
          {format(date, "EEE")}
        </span>
        <div
          className={`
            h-10 w-10 flex items-center justify-center rounded-full text-base font-normal shrink-0
            ${
              isToday
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
            }
          `}
          onClick={() => onNavigate(date)}
        >
          {format(date, "d")}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-h-[90vh] bg-white text-slate-900 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Google Calendar Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden lg:flex flex-col w-fit border-r border-gray-200 pr-6 bg-white/50">
            <Button
              className="w-fit pl-3 pr-6 h-12 rounded-full shadow-md bg-white hover:bg-slate-50 text-slate-700 border border-gray-200 flex items-center gap-3 transition-all hover:shadow-lg"
              onClick={() => onDateClick(new Date())}
            >
              <div className="relative">
                <Plus className="h-7 w-7 text-blue-600" />
              </div>
              <span className="font-medium text-base">Create</span>
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onTodayClick}
              className="px-4 py-1.5 h-9 text-sm font-medium border-gray-300 hover:bg-gray-100 text-gray-700 rounded-md"
            >
              Today
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevClick}
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNextClick}
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
            <h2 className="text-xl font-normal text-gray-800 min-w-[160px]">
              {format(currentDate, "MMMM yyyy")}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {onViewChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[90px] justify-between border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                  <ChevronLeft className="h-4 w-4 rotate-270 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleViewChange("day")}>
                  Day
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange("week")}>
                  Week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange("month")}>
                  Month
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Optional Sidebar Placeholder (Hidden on small screens) */}

        {/* Calendar Grid */}
        <div className="flex-1 google-calendar-wrapper">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={handleViewChange}
            date={currentDate}
            onNavigate={handleNavigate}
            onSelectSlot={(slotInfo: SlotInfo) => onDateClick(slotInfo.start)}
            onSelectEvent={(event: any) => onEventClick(event)}
            selectable
            components={{
              event: CustomEvent,
              header:
                view === "month"
                  ? undefined // Default header for month view
                  : CustomHeader, // Custom header for week/day views
            }}
            step={60}
            timeslots={1}
            className="google-calendar"
          />
        </div>
      </div>

      <style>{`
        /* Google Calendar Styles Override */

        /* 1. General Grid & Layout */
        .google-calendar-wrapper .rbc-calendar {
          border: none;
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;
        }
          .google-calendar-wrapper  .rbc-toolbar{
          margin-top: 10px;
          margin-inline: 10px;
        }
        .google-calendar-wrapper .rbc-month-header  {
          border-top: 1px solid #e5e7eb;
        }

        .google-calendar-wrapper .rbc-header {
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 8px;
          font-size: 11px;
          font-weight: 600;
          color: #70757a;
          text-transform: uppercase;
          min-width: 60px;
          overflow: visible;
        }
        
        .google-calendar-wrapper .rbc-time-header-content {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .google-calendar-wrapper .rbc-time-header {
          overflow: visible;
        }

        .google-calendar-wrapper .rbc-month-view {
          border: none;
        }

        .google-calendar-wrapper .rbc-month-row {
          border-bottom: 1px solid #e5e7eb;
          min-height: 100px;
        }

        .google-calendar-wrapper .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #e5e7eb;
        }

        /* 2. Date Cells (Month View) */
        .google-calendar-wrapper .rbc-date-cell {
          padding: 8px;
          text-align: center;
          font-size: 12px;
          font-weight: 500;
          color: #3c4043;
        }

        .google-calendar-wrapper .rbc-now .rbc-button-link {
          background-color: #1a73e8;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .google-calendar-wrapper .rbc-off-range-bg {
          background: transparent; /* Google keeps it white, just lighter text */
        }

        .google-calendar-wrapper .rbc-off-range .rbc-button-link {
          color: #d1d5db;
        }

        /* 3. Events */
        .google-calendar-wrapper .rbc-event {
          background-color: #039be5; /* Google Blue */
          border: none;
          border-radius: 4px;
          box-shadow: none;
          padding: 0;
          margin: 1px 4px;
        }

        .google-calendar-wrapper .rbc-event-content {
          font-size: 12px;
        }

        .google-calendar-wrapper .rbc-selected {
          background-color: #1a73e8 !important; /* Darker blue on select */
        }

        /* 4. Time Grid (Week/Day View) */
        .google-calendar-wrapper .rbc-time-view {
          border: none;
        }

        .google-calendar-wrapper .rbc-time-header {
          border-bottom: 1px solid #e5e7eb;
        }

        .google-calendar-wrapper .rbc-time-content {
          border-top: none;
        }

        .google-calendar-wrapper .rbc-timeslot-group {
          border-bottom: 1px solid #f3f4f6;
          min-height: 48px;
        }

        .google-calendar-wrapper .rbc-time-gutter .rbc-timeslot-group {
          border-bottom: none; /* Cleaner time gutter */
        }

        .google-calendar-wrapper .rbc-label {
          font-size: 11px;
          color: #70757a;
          top: -6px; /* Align label with line */
          position: relative;
        }

        .google-calendar-wrapper .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid transparent; /* Hide internal slot lines for cleaner look */
        }

        /* 5. Current Time Indicator */
        .google-calendar-wrapper .rbc-current-time-indicator {
          background-color: #ea4335;
          height: 2px;
        }

        .google-calendar-wrapper .rbc-current-time-indicator::before {
          content: "";
          position: absolute;
          left: -6px;
          top: -5px;
          width: 12px;
          height: 12px;
          background-color: #ea4335;
          border-radius: 50%;
        }

        /* 6. Scrollbars */
        .google-calendar-wrapper ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .google-calendar-wrapper ::-webkit-scrollbar-track {
          background: transparent;
        }
        .google-calendar-wrapper ::-webkit-scrollbar-thumb {
          background: #dadce0;
          border-radius: 4px;
        }
        .google-calendar-wrapper ::-webkit-scrollbar-thumb:hover {
          background: #bdc1c6;
        }
        .google-calendar-wrapper .rbc-time-view .rbc-row{
         min-height: auto !important;
        }
      `}</style>
    </div>
  );
};

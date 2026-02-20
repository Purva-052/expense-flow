/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Calendar,
  momentLocalizer,
  View,
  DateLocalizer,
} from "react-big-calendar";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/use-auth-store";
import { INTERVIEW_STATUS_LABEL, roles } from "@/utils/constant";

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
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.user?.role === roles.ADMIN;
  console.log("isAdmin", isAdmin);  
  const now = useMemo(() => new Date(), []);

  const calendarEvents = useMemo(() => {
    if (!events) return [];

    return events.map((event: any) => {
      const techColor =
        event?.extendedProps?.technology?.color ||
        event?.extendedProps?.technology?.colour ||
        "#039be5";

      const startDate = new Date(
        event.extendedProps.latestStatusLog.effectiveDate
      );
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

      return {
        ...event,
        interViewer: event.interViewer || "Untitled",
        start: startDate,
        end: endDate,
        title: event.title || "Untitled",
        backgroundColor: techColor,
        borderColor: techColor,
      };
    });
  }, [events]);

  const handleNavigate = useCallback(
    (newDate: Date) => onNavigate(newDate),
    [onNavigate]
  );

  const handleViewChange = useCallback(
    (newView: View) => onViewChange && onViewChange(newView),
    [onViewChange]
  );

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

  const handleDrillDown = useCallback(
    (date: Date, _view: View) => {
      onNavigate(date);
      if (onViewChange) onViewChange("day");
    },
    [onNavigate, onViewChange]
  );

  const onTodayClick = () => handleNavigate(new Date());

  // ✅ 1. Event Component (Styled as Pill)
  const CustomEvent = ({ event }: { event: any }) => {
    const isHovered = hoveredEvent === event.id;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="h-full w-full px-2 py-0.5 flex flex-col justify-center text-white cursor-pointer transition-all duration-200 rounded text-[11px] font-medium"
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
              onClick={(e) => {
                // Important: Stop propagation so we don't trigger onDateClick
                e.stopPropagation();
                onEventClick(event);
              }}
              style={{
                backgroundColor: event.backgroundColor,
                opacity: isHovered ? 0.9 : 1,
                // Ensure pointer events are active for the click
                pointerEvents: "auto",
              }}
            >
              <div className="flex items-center gap-1 leading-tight truncate">
                <span className="truncate">
                  {format(event.start, "h:mm a")} {event.title}
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="p-3 text-sm rounded-md shadow-xl z-[60] bg-white"
          >
            <div className="font-semibold">{event.title}</div>
            <div className="text-gray-600 mt-1">
              Technology: {event.extendedProps?.technology?.name}
            </div>
            <div className="text-gray-600 mt-1">
              Interviewer:{" "}
              <span className="font-medium">{event.interViewer}</span>
            </div>
            <div className="text-gray-600">
              Time: {format(event.start, "hh:mm a")} –{" "}
              {format(event.end, "hh:mm a")}
            </div>
            <div>
              <span className="text-gray-600">Status:</span>{" "}
              {event.extendedProps?.status &&
              INTERVIEW_STATUS_LABEL[event.extendedProps.status] ? (
                <span className="text-gray-600">
                  {INTERVIEW_STATUS_LABEL[event.extendedProps.status]}
                </span>
              ) : (
                <span className="text-gray-600">NA</span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const eventPropGetter = useCallback(() => {
    return {
      style: {
        backgroundColor: "transparent",
        color: "#ffffff",
        borderRadius: "4px",
        border: "none",
        boxShadow: "none",
        padding: "0px",
        marginTop: "1px",
        marginBottom: "1px",
      },
    };
  }, []);

  // ✅ 2. Custom Date Cell Wrapper
  // This ensures clicking the *empty* part of the box triggers onDateClick
  const DateCellWrapper = ({ value, children }: any) => {
    const isToday = moment(value).isSame(moment(now), "day");
    return (
      <div
        onClick={() => {
          if (isAdmin) {
            onDateClick(value);
          }
        }}
        className={`h-full w-full border border-black/6 z-1 ${
          isToday ? "bg-[#e8f0fe]" : "bg-transparent"
        } ${isAdmin ? "cursor-pointer" : "cursor-default"}`}
      >
        {children}
      </div>
    );
  };

  // ✅ 3. Date Formats (01, 02 style)
  const formats = {
    dateFormat: (date: Date, culture: any, localizer: DateLocalizer) =>
      localizer.format(date, "DD", culture),
    weekdayFormat: (date: Date, culture: any, localizer: DateLocalizer) =>
      localizer.format(date, "ddd", culture),
  };

  return (
    <div className="flex flex-col h-screen max-h-[90vh] bg-white text-slate-900 rounded-xl shadow-sm overflow-hidden font-sans border border-slate-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-6">
          {isAdmin && (
            <Button
              className="hidden lg:flex items-center gap-2 pl-3 pr-5 h-12 rounded-full shadow-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all hover:shadow-md"
              onClick={() => onDateClick(new Date())}
            >
              <div className="p-1">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-medium text-base">Create</span>
            </Button>
          )}

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onTodayClick}
              className="px-5 py-2 h-10 text-sm font-medium border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md"
            >
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevClick}
                className="h-9 w-9 rounded-full hover:bg-slate-100 text-slate-600"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNextClick}
                className="h-9 w-9 rounded-full hover:bg-slate-100 text-slate-600"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <h2 className="text-xl font-normal text-slate-800 ml-2">
              {format(currentDate, "MMMM yyyy")}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[100px] justify-between border-slate-200 text-slate-700 hover:bg-slate-50 px-4"
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
                <ChevronLeft className="h-4 w-4 rotate-270 ml-2 opacity-50" />
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
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="flex flex-1 overflow-hidden relative p-4 pb-2">
        <div className="google-calendar-wrapper h-full w-full">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            getNow={() => now}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={handleViewChange}
            date={currentDate}
            onNavigate={handleNavigate}
            onSelectEvent={(event: any) => onEventClick(event)}
            eventPropGetter={eventPropGetter}
            selectable={isAdmin}
            formats={formats as any}
            // ✅ CRITICAL: This enables the popup instead of drilldown on clicking "+2 more"
            onDrillDown={handleDrillDown}
            popup={true}
            components={{
              toolbar: () => null,
              event: CustomEvent,
              dateCellWrapper: DateCellWrapper, // ✅ Restored for empty cell clicks
            }}
            className={`google-calendar ${isAdmin ? "is-admin" : "is-not-admin"}`}
          />
        </div>
      </div>
      <style>{`
  /* ================================= */
  /*     GOOGLE CALENDAR CLONE CSS     */
  /* ================================= */

  .google-calendar-wrapper {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .rbc-calendar {
    border: none;
  }

  /* Toolbar is hidden as we use custom header */
  .rbc-toolbar {
    display: none;
  }

  /* Month View Container */
  .rbc-month-view {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  /* Header Row (Sun, Mon...) */
  .rbc-header {
    padding: 12px 0;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    border-bottom: 1px solid #e2e8f0 !important;
    border-left: none !important;
    text-align: center;
  }
  
  .rbc-header + .rbc-header {
    border-left: none; 
  }

  /* Grid Lines */
  .rbc-day-bg + .rbc-day-bg {
    border-left: 1px solid #e2e8f0;
  }
  .rbc-month-row + .rbc-month-row {
    border-top: 1px solid #e2e8f0;
  }

  /* Date Cells (The actual day numbers) */
  .rbc-date-cell {
    text-align: center;
    padding-top: 8px;
    font-size: 12px;
    font-weight: 500;
    color: #334155;
    pointer-events: auto;
  }

  .is-admin .rbc-date-cell {
    cursor: pointer;
  }

  .is-not-admin .rbc-date-cell {
    cursor: default;
  }
  
  .rbc-date-cell .rbc-button-link {
    pointer-events: auto;
  }

  .is-admin .rbc-date-cell .rbc-button-link {
    cursor: pointer;
  }

  .is-not-admin .rbc-date-cell .rbc-button-link {
    cursor: default;
  }



  
  /* The blue circle for today's date number */
  .rbc-now .rbc-button-link {
      background-color: #1a73e8 !important;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      margin-top: 2px;
  }


  /* Event Styling */
  .rbc-event {
    background: none !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 4px !important;
    margin: 1px 4px !important;
    outline: none !important;
    min-height: 20px;
  }

  .rbc-event:focus {
    outline: none !important;
  }


  /* Functionality Fix: Layering */
  .rbc-row-content {
    z-index: 4; 
    padding-right: 6px;
    pointer-events: none; /* Let clicks pass through to DateCellWrapper by default */
  }
  
  .rbc-row-content .rbc-row {
    pointer-events: none; /* Let clicks pass through to DateCellWrapper */
  }

  /* Allow clicks on events and other interactive elements */
  .rbc-event, .rbc-show-more, .rbc-overlay {
    pointer-events: auto;
  }

  .rbc-date-cell:hover .rbc-button-link {
    // color: #1a73e8;
    text-decoration: underline;
  }

  .rbc-row-bg {
    z-index: 1;
  }

  /* Popup Styling */
  .rbc-overlay {
    z-index: 100 !important;
    background: white;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px;
  }
  
  .rbc-overlay-header {
      border-bottom: 1px solid #f1f5f9;
      padding: 4px 8px 8px;
      margin-bottom: 4px;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
  }

  /* The "+2 more" link styling */
  .rbc-show-more {
      background-color: transparent;
      color: #64748b;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      z-index: 10;
  }
  
  .rbc-show-more:hover {
      background-color: #f1f5f9;
      color: #334155;
  }
`}</style>
    </div>
  );
};

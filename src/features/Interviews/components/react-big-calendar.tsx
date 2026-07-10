/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Calendar,
  momentLocalizer,
  View,
  DateLocalizer,
  SlotInfo,
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
            className="p-3 text-sm rounded-md shadow-xl z-[60] bg-popover text-popover-foreground border-border"
          >
            <div className="font-semibold">{event.title}</div>
            <div className="text-muted-foreground mt-1">
              Technology: {event.extendedProps?.technology?.name}
            </div>
            <div className="text-muted-foreground mt-1">
              Interviewer:{" "}
              <span className="font-medium">{event.interViewer}</span>
            </div>
            <div className="text-muted-foreground">
              Time: {format(event.start, "hh:mm a")} –{" "}
              {format(event.end, "hh:mm a")}
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>{" "}
              {event.extendedProps?.status &&
              INTERVIEW_STATUS_LABEL[event.extendedProps.status] ? (
                <span className="text-muted-foreground">
                  {INTERVIEW_STATUS_LABEL[event.extendedProps.status]}
                </span>
              ) : (
                <span className="text-muted-foreground">NA</span>
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

  // ✅ 3. Date Formats (01, 02 style)
  const formats = {
    dateFormat: (date: Date, culture: any, localizer: DateLocalizer) =>
      localizer.format(date, "DD", culture),
    weekdayFormat: (date: Date, culture: any, localizer: DateLocalizer) =>
      localizer.format(date, "ddd", culture),
  };

  return (
    <div className="flex flex-col h-screen max-h-[90vh] bg-card text-foreground rounded-xl shadow-sm overflow-hidden font-sans border border-border">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
        <div className="flex items-center gap-6">
          {isAdmin && (
            <Button
              className="hidden lg:flex items-center gap-2 pl-3 pr-5 h-12 rounded-full shadow-sm bg-background hover:bg-muted text-foreground border border-border transition-all hover:shadow-md dark:bg-secondary dark:hover:bg-accent"
              onClick={() => onDateClick(new Date())}
            >
              <div className="p-1">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <span className="font-medium text-base">Create</span>
            </Button>
          )}

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onTodayClick}
              className="px-5 py-2 h-10 text-sm font-medium border-border hover:bg-muted text-foreground rounded-md"
            >
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevClick}
                className="h-9 w-9 rounded-full hover:bg-muted text-muted-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNextClick}
                className="h-9 w-9 rounded-full hover:bg-muted text-muted-foreground"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <h2 className="text-xl font-normal text-foreground ml-2">
              {view === "day"
                ? format(currentDate, "MMMM d, yyyy")
                : format(currentDate, "MMMM yyyy")}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[100px] justify-between border-border text-foreground hover:bg-muted px-4"
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
            onSelectSlot={(slotInfo: SlotInfo) => onDateClick(slotInfo.start)}
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
    font-family: var(--font-sans);
  }

  .google-calendar-wrapper .rbc-calendar {
    border: none;
  }

  .google-calendar-wrapper .rbc-month-header {
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }

  /* Toolbar is hidden as we use custom header */
  .google-calendar-wrapper .rbc-toolbar {
    display: none;
  }

  /* Month View Container */
  .google-calendar-wrapper .rbc-month-view {
    border: none;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Header Row (Sun, Mon...) */
  .google-calendar-wrapper .rbc-header {
    padding: 12px 0;
    font-size: 11px;
    font-weight: 600;
    color: var(--muted-foreground);
    text-transform: uppercase;
    border-bottom: 1px solid var(--border) !important;
    border-left: none !important;
    text-align: center;
  }
  
  .google-calendar-wrapper .rbc-header + .rbc-header {
    border-left: none; 
  }

  /* Grid Lines */
  .google-calendar-wrapper .rbc-month-row {
    border-bottom: 1px solid var(--border);
    flex: 1 0 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .google-calendar-wrapper .rbc-month-row .rbc-row-bg {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }

  .google-calendar-wrapper .rbc-month-row .rbc-row-content {
    flex: 1;
    height: 100%;
    position: relative;
    z-index: 4;
  }

  .google-calendar-wrapper .rbc-month-row:last-child {
    border-bottom: none;
  }

  .google-calendar-wrapper .rbc-day-bg + .rbc-day-bg {
    border-left: 1px solid var(--border);
  }

  .google-calendar-wrapper .rbc-off-range-bg {
    background: transparent;
  }

  .google-calendar-wrapper .rbc-off-range .rbc-button-link {
    color: var(--muted-foreground);
    opacity: 0.5;
  }

  .google-calendar-wrapper .rbc-today {
    background-color: hsl(var(--muted) / 0.35);
  }

  .google-calendar-wrapper .rbc-selected-cell {
    background-color: transparent;
  }

  /* Date Cells (The actual day numbers) */
  .google-calendar-wrapper .rbc-date-cell {
    padding: 6px 8px;
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--foreground);
    pointer-events: auto;
  }

  .google-calendar-wrapper.is-admin .rbc-date-cell {
    cursor: pointer;
  }

  .google-calendar-wrapper.is-not-admin .rbc-date-cell {
    cursor: default;
  }
  
  .google-calendar-wrapper .rbc-date-cell .rbc-button-link {
    pointer-events: auto;
  }

  .google-calendar-wrapper.is-admin .rbc-date-cell .rbc-button-link {
    cursor: pointer;
  }

  .google-calendar-wrapper.is-not-admin .rbc-date-cell .rbc-button-link {
    cursor: default;
  }

  /* The blue circle for today's date number */
  .google-calendar-wrapper .rbc-now .rbc-button-link {
      background-color: var(--primary) !important;
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
  .google-calendar-wrapper .rbc-event {
    background: none !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 4px !important;
    margin: 1px 4px !important;
    outline: none !important;
    min-height: 20px;
  }

  .google-calendar-wrapper .rbc-event:focus {
    outline: none !important;
  }
  
  .google-calendar-wrapper .rbc-event-label {
    color: var(--foreground) !important;
  }


  /* Functionality Fix: Layering */
  .google-calendar-wrapper .rbc-row-content {
    z-index: 4; 
    padding-right: 6px;
    pointer-events: none;
  }
  
  .google-calendar-wrapper .rbc-row-content .rbc-row {
    pointer-events: none;
  }

  /* Allow clicks on events and other interactive elements */
  .google-calendar-wrapper .rbc-event, .google-calendar-wrapper .rbc-show-more, .google-calendar-wrapper .rbc-overlay {
    pointer-events: auto;
  }

  .google-calendar-wrapper .rbc-date-cell:hover .rbc-button-link {
    text-decoration: underline;
  }

  .google-calendar-wrapper .rbc-row-bg {
    z-index: 1;
  }

  /* Popup Styling */
  .google-calendar-wrapper .rbc-overlay {
    z-index: 100 !important;
    background: var(--popover);
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px;
  }
  
  .google-calendar-wrapper .rbc-overlay-header {
      border-bottom: 1px solid var(--border);
      padding: 4px 8px 8px;
      margin-bottom: 4px;
      font-size: 13px;
      font-weight: 600;
      color: var(--muted-foreground);
  }

  /* The "+2 more" link styling */
  .google-calendar-wrapper .rbc-show-more {
      background-color: transparent;
      color: var(--primary);
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      z-index: 10;
  }
  
  .google-calendar-wrapper .rbc-show-more:hover {
      background-color: var(--muted);
      color: var(--primary);
  }
`}</style>
    </div>
  );
};

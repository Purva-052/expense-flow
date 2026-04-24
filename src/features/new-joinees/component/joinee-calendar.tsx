/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback } from "react";
import { Calendar, momentLocalizer, View, SlotInfo } from "react-big-calendar";
import { format } from "date-fns";
import moment from "moment";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
// import {
//   // DropdownMenu,
//   // DropdownMenuContent,
//   // DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { JoineeEvent } from "../component/joinee-details-dialog";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";

const localizer = momentLocalizer(moment);

interface JoineeCalendarProps {
  events: JoineeEvent[];
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: JoineeEvent) => void;
  onEventEdit: (event: JoineeEvent, e: React.MouseEvent) => void;
  onNavigate: (date: Date) => void;
  view?: View;
  onViewChange?: (view: View) => void;
}

export const JoineeCalendar = ({
  events,
  currentDate,
  onDateClick,
  onEventClick,
  onNavigate,
  view = "month",
  onViewChange,
}: JoineeCalendarProps) => {
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;

  const calendarEvents = useMemo(() => {
    if (!events) return [];

    return events.map((event) => {
      const defaultColor = "#10b981";

      return {
        ...event,
        start: new Date(event.start),
        end: event.end ? new Date(event.end) : new Date(event.start),
        title: event.title || "Untitled",
        backgroundColor: event.backgroundColor || defaultColor,
        borderColor: event.borderColor || event.backgroundColor || defaultColor,
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

  // Custom Event Component with Joinee-specific tooltip
  const CustomEvent = ({ event }: { event: any }) => {
    const isHovered = hoveredEvent === event.id;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="h-full w-full px-1.5 py-0.5 flex items-center text-white cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
              style={{ opacity: isHovered ? 0.85 : 1 }}
            >
              <div className="flex items-center gap-1 text-[11px] font-medium leading-tight truncate flex-1">
                <span className="truncate font-medium">
                  {event.title} -{" "}
                  {event.extendedProps?.technology?.name ?? "NA"}
                </span>
              </div>
            </div>
          </TooltipTrigger>

          <TooltipContent side="right" className="p-3 text-sm rounded-md bg-popover text-popover-foreground border-border">
            <div className="font-semibold">{event.title}</div>

            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <span>Technology:</span>

              {event.extendedProps?.technology ? (
                <>
                  <span
                    className="h-2 w-2 rounded-full inline-block"
                    style={{
                      backgroundColor: event.extendedProps.technology.color,
                    }}
                  />
                  <span>{event.extendedProps.technology.name || "NA"}</span>
                </>
              ) : (
                <span>NA</span>
              )}
            </div>

            <div className="text-muted-foreground">
              Experience: {event.extendedProps?.experienceInYears || "-"} Years
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const eventPropGetter = useCallback((event: any) => {
    return {
      style: {
        backgroundColor: event.backgroundColor || "#10b981",
        borderColor: event.borderColor || event.backgroundColor || "#10b981",
        color: "#ffffff",
        borderRadius: "4px",
        border: "none",
        boxShadow: "none",
      },
    };
  }, []);

  const EventWrapper = ({ children }: any) => {
    return <div title="">{children}</div>;
  };

  const CustomHeader = ({ date }: { date: Date; label?: string }) => {
    const isToday = new Date().toDateString() === date.toDateString();

    return (
      <div className="flex flex-col items-center justify-center py-3 px-2 min-w-[60px]">
        <span
          className={`text-xs font-medium uppercase mb-2 whitespace-nowrap ${isToday ? "text-primary" : "text-muted-foreground"}`}
        >
          {format(date, "EEE")}
        </span>
        <div
          className={`
            h-10 w-10 flex items-center justify-center rounded-full text-base font-normal shrink-0
            ${
              isToday
                ? "bg-primary text-white shadow-sm"
                : "text-foreground hover:bg-muted cursor-pointer transition-colors"
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
    <div className="flex flex-col h-screen max-h-[90vh] bg-card text-foreground border border-border rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4 lg:gap-6">
          {userRole === roles.ADMIN && (
            <div className="hidden lg:flex flex-col w-fit border-r border-border pr-6">
              <Button
                className="w-fit pl-3 pr-6 h-12 rounded-full shadow-md bg-background hover:bg-muted text-foreground border border-border flex items-center gap-3 transition-all hover:shadow-lg dark:bg-secondary dark:hover:bg-accent"
                onClick={() => onDateClick(new Date())}
              >
                <div className="relative">
                  <Plus className="h-7 w-7 text-primary" />
                </div>
                <span className="font-medium text-base">Create</span>
              </Button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onTodayClick}
              className="px-4 py-1.5 h-9 text-sm font-medium border-border hover:bg-muted text-foreground rounded-md"
            >
              Today
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevClick}
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNextClick}
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>
            <h2 className="text-xl font-normal text-foreground min-w-[160px]">
              {format(currentDate, "MMMM yyyy")}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {onViewChange && (
            <>
              {/* <DropdownMenu> */}
              {/* <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="min-w-[90px] justify-between border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                    <ChevronLeft className="h-4 w-4 rotate-270 ml-2" />
                  </Button>
                </DropdownMenuTrigger> */}
              {/* <DropdownMenuContent align="end" className="w-40"> */}
              {/* <DropdownMenuItem onClick={() => handleViewChange("day")}>
                    Day
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewChange("week")}>
                    Week
                  </DropdownMenuItem> */}
              {/* <DropdownMenuItem onClick={() => handleViewChange("month")}>
                    Month
                  </DropdownMenuItem> */}
              {/* </DropdownMenuContent> */}
              {/* </DropdownMenu> */}
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
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
            eventPropGetter={eventPropGetter}
            selectable={userRole === roles.ADMIN}
            popup
            components={{
              toolbar: () => null,
              event: CustomEvent,
              eventWrapper: EventWrapper,
              header: view === "month" ? undefined : CustomHeader,
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
          font-family: var(--font-sans);
        }
        
        .google-calendar-wrapper .rbc-toolbar {
          margin-top: 10px;
          margin-inline: 10px;
        }

        .google-calendar-wrapper .rbc-month-header {
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }

        .google-calendar-wrapper .rbc-header {
          border-bottom: 1px solid var(--border);
          padding: 12px 8px;
          font-size: 11px;
          font-weight: 600;
          color: var(--muted-foreground);
          text-transform: uppercase;
          min-width: 60px;
          overflow: visible;
        }
        
        /* 2. Month View Layout Fixes */
        .google-calendar-wrapper .rbc-month-view {
          border: none;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

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

        /* 3. Date Cells */
        .google-calendar-wrapper .rbc-date-cell {
          padding: 6px 8px;
          text-align: center;
          font-size: 12px;
          font-weight: 500;
          color: var(--foreground);
        }
          
        
        .google-calendar-wrapper .rbc-now .rbc-button-link {
          background-color: var(--primary);
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
          background: transparent;
        }

        .google-calendar-wrapper .rbc-off-range .rbc-button-link {
          color: var(--muted-foreground);
          opacity: 0.5;
        }

        /* 4. Events */
        .google-calendar-wrapper .rbc-event {
          border: none;
          border-radius: 4px;
          box-shadow: none;
          padding: 0;
          margin: 1px 2px;
          overflow: hidden;
          min-height: 22px;
        }

        .google-calendar-wrapper .rbc-event-content {
          font-size: 11px;
          line-height: 1.2;
        }
        
        .google-calendar-wrapper .rbc-show-more {
          background-color: transparent;
          color: var(--primary);
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          margin: 2px;
          text-align: left;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .google-calendar-wrapper .rbc-show-more:hover {
          background-color: var(--muted);
        }

        .google-calendar-wrapper .rbc-selected {
          opacity: 0.85 !important;
        }

        /* 5. Time Grid (Week/Day View) */
        .google-calendar-wrapper .rbc-time-view {
          border: none;
          display: flex;
          flex-direction: column;
          flex: 1;
          height: 100%;
          min-height: 0;
        }

        .google-calendar-wrapper .rbc-time-header {
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        
        .google-calendar-wrapper .rbc-time-content {
          border-top: none;
          flex: 1;
          overflow-y: auto;
          border-left: 1px solid var(--border);
        }

        .google-calendar-wrapper .rbc-timeslot-group {
          border-bottom: 1px solid var(--border);
          min-height: 48px;
        }

        .google-calendar-wrapper .rbc-time-gutter .rbc-timeslot-group {
          border-bottom: none;
        }

        .google-calendar-wrapper .rbc-label {
          font-size: 11px;
          color: var(--muted-foreground);
          top: -6px;
          position: relative;
        }

        .google-calendar-wrapper .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid transparent;
        }

        .google-calendar-wrapper .rbc-current-time-indicator {
          background-color: var(--primary);
          height: 2px;
        }

        .google-calendar-wrapper .rbc-current-time-indicator::before {
          content: "";
          position: absolute;
          left: -6px;
          top: -5px;
          width: 12px;
          height: 12px;
          background-color: var(--primary);
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
          background: var(--border);
          border-radius: 4px;
        }
        .google-calendar-wrapper ::-webkit-scrollbar-thumb:hover {
          background: var(--muted-foreground);
        }
          .google-calendar-wrapper .rbc-time-view .rbc-row{
          min-height: auto !important;
        }
      `}</style>
    </div>
  );
};

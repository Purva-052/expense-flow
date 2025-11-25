/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InterviewEvent } from "../types";
import { cn } from "@/lib/utils";

interface PremiumCalendarWrapperProps {
  events: InterviewEvent[];
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: InterviewEvent) => void;
  onEventEdit: (event: InterviewEvent, e: React.MouseEvent) => void;
  onEventDelete: (event: InterviewEvent, e: React.MouseEvent) => void;
  onMonthChange: (date: Date) => void;
  view?: "dayGridMonth" | "timeGridWeek" | "timeGridDay";
  onViewChange?: (
    view: "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  ) => void;
}

export const PremiumCalendarWrapper = ({
  events,
  currentDate,
  onDateClick,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onMonthChange,
  view = "dayGridMonth",
  onViewChange,
}: PremiumCalendarWrapperProps) => {
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(currentDate);
      calendarApi.changeView(view);
    }
  }, [currentDate, view]);

  const handleDateClick = (clickInfo: DateClickArg) => {
    onDateClick(clickInfo.date);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event.toPlainObject() as InterviewEvent;
    onEventClick(event);
  };

  const handleDatesSet = (arg: any) => {
    if (arg.start) {
      onMonthChange(arg.start);
    }
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
    }
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
    }
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      onMonthChange(new Date());
    }
  };

  const handleViewChange = (
    newView: "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  ) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(newView);
      if (onViewChange) {
        onViewChange(newView);
      }
    }
  };

  // Attach event handlers to edit/delete buttons
  useEffect(() => {
    const handleEditButtonClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const button = target.closest(".fc-edit-btn") as HTMLElement;
      if (button) {
        e.stopPropagation();
        const eventId = button.getAttribute("data-event-id");
        const event = events.find((ev) => ev.id === eventId);
        if (event) {
          onEventEdit(event, e as any);
        }
      }
    };

    const handleDeleteButtonClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const button = target.closest(".fc-delete-btn") as HTMLElement;
      if (button) {
        e.stopPropagation();
        const eventId = button.getAttribute("data-event-id");
        const event = events.find((ev) => ev.id === eventId);
        if (event) {
          onEventDelete(event, e as any);
        }
      }
    };

    document.addEventListener("click", handleEditButtonClick);
    document.addEventListener("click", handleDeleteButtonClick);

    return () => {
      document.removeEventListener("click", handleEditButtonClick);
      document.removeEventListener("click", handleDeleteButtonClick);
    };
  }, [events, onEventEdit, onEventDelete]);

  return (
    <Card className="border-2 shadow-xl bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10 shadow-sm">
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
                  variant={view === "dayGridMonth" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewChange("dayGridMonth")}
                  className="rounded-md"
                >
                  Month
                </Button>
                <Button
                  variant={view === "timeGridWeek" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewChange("timeGridWeek")}
                  className="rounded-md"
                >
                  Week
                </Button>
                <Button
                  variant={view === "timeGridDay" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewChange("timeGridDay")}
                  className="rounded-md"
                >
                  Day
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="p-6">
        <div className="premium-calendar-wrapper">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={view}
            headerToolbar={false}
            height="auto"
            events={events.map((event) => ({
              id: event.id,
              title: event.title,
              start: event.start,
              end: event.end,
              backgroundColor: event.backgroundColor || "#10B981",
              borderColor:
                event.borderColor || event.backgroundColor || "#10B981",
              extendedProps: event.extendedProps,
            }))}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            weekends={true}
            dayMaxEvents={3}
            moreLinkClick="popover"
            eventClassNames="cursor-pointer fc-interview-event"
            eventContent={(arg) => {
              const event = arg.event.toPlainObject() as InterviewEvent;
              const eventId = `event-${event.id}`;
              const bgColor = arg.event.backgroundColor || "#10B981";

              return {
                html: `
                  <div data-event-id="${eventId}" class="fc-event-content-wrapper group" style="
                    padding: 6px 8px;
                    width: 100%;
                    color: white;
                    font-weight: 500;
                    background: linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 13px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    min-height: 32px;
                    transition: all 0.2s ease;
                    border: 1px solid rgba(255,255,255,0.2);
                  ">
                    <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 4px; font-weight: 600;">
                      ${arg.event.title}
                    </span>
                    <div class="fc-event-actions opacity-0 group-hover:opacity-100 transition-opacity" style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                      <button class="fc-edit-btn" data-event-id="${event.id}" style="
                        padding: 4px;
                        background: rgba(255,255,255,0.25);
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                        color: white;
                        width: 20px;
                        height: 20px;
                      " onmouseover="this.style.background='rgba(255,255,255,0.4)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='scale(1)'" title="Edit">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button class="fc-delete-btn" data-event-id="${event.id}" style="
                        padding: 4px;
                        background: rgba(255,255,255,0.25);
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                        color: white;
                        width: 20px;
                        height: 20px;
                      " onmouseover="this.style.background='rgba(239,68,68,0.8)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='scale(1)'" title="Delete">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                `,
              };
            }}
            dayHeaderFormat={{ weekday: "short" }}
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={true}
            nowIndicator={true}
            editable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEventRows={3}
            moreLinkText={(num) => `+${num} more`}
          />
        </div>
      </div>

      <style>{`
        .premium-calendar-wrapper {
          --fc-border-color: hsl(var(--border));
          --fc-daygrid-event-dot-width: 0;
          --fc-event-border-radius: 6px;
          --fc-today-bg-color: hsl(var(--primary) / 0.05);
          --fc-highlight-color: hsl(var(--primary) / 0.1);
        }
        
        .premium-calendar-wrapper .fc {
          font-family: inherit;
        }
        
        .premium-calendar-wrapper .fc-header-toolbar {
          margin-bottom: 1.5rem;
        }
        
        .premium-calendar-wrapper .fc-daygrid-day {
          border-color: hsl(var(--border) / 0.5);
          transition: all 0.2s ease;
        }
        
        .premium-calendar-wrapper .fc-daygrid-day:hover {
          background-color: hsl(var(--muted) / 0.3);
        }
        
        .premium-calendar-wrapper .fc-day-today {
          background-color: hsl(var(--primary) / 0.05) !important;
          border-color: hsl(var(--primary) / 0.3) !important;
        }
        
        .premium-calendar-wrapper .fc-daygrid-day-number {
          padding: 8px;
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        
        .premium-calendar-wrapper .fc-day-today .fc-daygrid-day-number {
          color: hsl(var(--primary));
          font-weight: 700;
        }
        
        .premium-calendar-wrapper .fc-col-header-cell {
          padding: 12px 8px;
          background: hsl(var(--muted) / 0.3);
          border-color: hsl(var(--border) / 0.5);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          color: hsl(var(--muted-foreground));
        }
        
        .premium-calendar-wrapper .fc-scrollgrid {
          border-color: hsl(var(--border) / 0.5);
          border-radius: 12px;
          overflow: hidden;
        }
        
        .premium-calendar-wrapper .fc-daygrid-day-frame {
          min-height: 120px;
        }
        
        .premium-calendar-wrapper .fc-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
        }
        
        .premium-calendar-wrapper .fc-more-link {
          font-weight: 600;
          color: hsl(var(--primary));
          background: hsl(var(--primary) / 0.1);
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .premium-calendar-wrapper .fc-more-link:hover {
          background: hsl(var(--primary) / 0.2);
        }
        
        .premium-calendar-wrapper .fc-timegrid-slot {
          height: 3em;
        }
        
        .premium-calendar-wrapper .fc-timegrid-col {
          border-color: hsl(var(--border) / 0.5);
        }
        
        .premium-calendar-wrapper .fc-timegrid-now-indicator-line {
          border-color: hsl(var(--primary));
          border-width: 2px;
        }
      `}</style>
    </Card>
  );
};

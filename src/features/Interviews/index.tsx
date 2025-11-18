/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

// FullCalendar Imports
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";

// ShadCN UI Imports
import { Main } from "@/components/layout/main";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Local Imports
import { InterviewForm } from "./components/interview-form";
import { InterviewDetailsDialog } from "./components/interview-details-dialog";
import { InterviewFormValues } from "./schema";
import { InterviewEvent } from "./types";
import { initialEvents } from "./constants";
import { useGetTechnologyDropdownList } from "../technology/services";
import { useGetUsersList } from "../users/services";

// --- MAIN PAGE COMPONENT ---
const InterviewsPage = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<InterviewEvent[]>(initialEvents);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<InterviewEvent | null>(
    null
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const { data: technologyList, isPending: technologyListLoading }: any =
    useGetTechnologyDropdownList();

  const { data: usersList, isPending: usersListLoading } = useGetUsersList({
    pagination: false,
  });

  // Generate years from 2020 to 2030 (you can adjust this range)
  const years = Array.from({ length: 21 }, (_, i) => 2020 + i);

  const handleDateClick = (clickInfo: DateClickArg) => {
    setSelectedDate(clickInfo.date);
    setIsAddDialogOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event.toPlainObject() as InterviewEvent);
    setIsViewDialogOpen(true);
  };

  const handleFormSubmit = (data: InterviewFormValues) => {
    const newEvent: InterviewEvent = {
      id: new Date().toISOString(),
      title: data.candidateName,
      start: format(selectedDate!, "yyyy-MM-dd"),
      extendedProps: { ...data },
    };
    setEvents([...events, newEvent]);
    setIsAddDialogOpen(false);
  };

  const handleYearChange = (year: string) => {
    const selectedYear = parseInt(year, 10);
    setCurrentYear(selectedYear);

    // Get the calendar API and navigate to the selected year
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const currentDate = calendarApi.getDate();
      const newDate = new Date(currentDate);
      newDate.setFullYear(selectedYear);
      calendarApi.gotoDate(newDate);
    }
  };

  // Update current year when calendar view changes
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const updateYear = () => {
        const currentDate = calendarApi.getDate();
        setCurrentYear(currentDate.getFullYear());
      };

      // Listen to date changes
      calendarApi.on("datesSet", updateYear);

      return () => {
        calendarApi.off("datesSet", updateYear);
      };
    }
  }, []);

  return (
    <Main>
      <div className="p-2 sm:p-4">
        {/* Year Selector */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Select Year:
            </span>
            <Select
              value={currentYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          weekends={true}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="80vh"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          eventClassNames="cursor-pointer text-sm p-1 border rounded-md"
          eventColor="#10B981"
        />
      </div>

      {selectedDate && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full sm:max-w-[850px] max-h-[90vh] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>
                Schedule Interview for {format(selectedDate, "PPP")}
              </DialogTitle>
              <DialogDescription>
                Fill in all details to schedule the interview.
              </DialogDescription>
            </DialogHeader>
            <InterviewForm
              selectedDate={selectedDate}
              onClose={() => setIsAddDialogOpen(false)}
              onSubmit={handleFormSubmit}
              technologyList={technologyList}
              technologyListLoading={technologyListLoading}
              usersList={usersList}
              usersListLoading={usersListLoading}
            />
          </DialogContent>
        </Dialog>
      )}

      <InterviewDetailsDialog
        event={selectedEvent}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </Main>
  );
};

export default InterviewsPage;

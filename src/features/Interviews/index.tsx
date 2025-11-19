/* eslint-disable no-console */
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
import { InterviewEvent, InterviewApiResponse } from "./types";
import { useGetTechnologyDropdownList } from "../technology/services";
import { useGetUsersList } from "../users/services";
import { useGetInterview, useCreateInterview } from "./services";

// --- MAIN PAGE COMPONENT ---
const InterviewsPage = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<InterviewEvent | null>(
    null
  );
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [timeZone, setTimeZone] = useState<string>("");

  // Get browser timezone dynamically
  useEffect(() => {
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimeZone(browserTimeZone);
  }, []);

  const { data: technologyList, isPending: technologyListLoading }: any =
    useGetTechnologyDropdownList();

  const { data: usersList, isPending: usersListLoading } = useGetUsersList({
    pagination: false,
  });

  // Format current calendar date as YYYY-MM-DD
  const formatCurrentDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch interviews from API with timezone and current date params
  const { data: interviewsData }: any = useGetInterview({
    time_zone: timeZone,
    current_date: formatCurrentDate(currentCalendarDate),
  });

  const onSuccessCreateInterview = () => {
    setIsAddDialogOpen(false);
    setSelectedDate(null);
  };

  const { mutateAsync: createInterview, isPending: isCreatingInterview } =
    useCreateInterview(onSuccessCreateInterview);

  // Transform API response to FullCalendar events
  const events: InterviewEvent[] = (interviewsData?.data || []).map(
    (interview: InterviewApiResponse) => {
      const startDate = new Date(interview.interviewStart);
      const endDate = new Date(interview.interviewEnd);

      return {
        id: interview.id.toString(),
        title: interview.candidateName,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        backgroundColor: interview.technology?.colour || "#10B981",
        borderColor: interview.technology?.colour || "#10B981",
        extendedProps: interview,
      };
    }
  );

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

  const handleFormSubmit = async (data: InterviewFormValues) => {
    if (!selectedDate) return;

    try {
      // Parse notice period to extract days (e.g., "30 Days" -> 30)
      const noticePeriodMatch = data.noticePeriod.match(/(\d+)/);
      const noticePeriodInDays = noticePeriodMatch
        ? parseInt(noticePeriodMatch[1], 10)
        : 0;

      // Combine selectedDate with startTime and endTime to create ISO datetime strings
      const [startHours, startMinutes] = data.startTime.split(":").map(Number);
      const [endHours, endMinutes] = data.endTime.split(":").map(Number);

      const interviewStart = new Date(selectedDate);
      interviewStart.setHours(startHours, startMinutes, 0, 0);

      const interviewEnd = new Date(selectedDate);
      interviewEnd.setHours(endHours, endMinutes, 0, 0);

      // Transform form data to match API body structure
      const apiBody = {
        candidateName: data.candidateName,
        technology: Number(data.technology),
        email: data.email,
        phoneNumber: data.phoneNumber,
        location: data.location,
        notes: data.notes || "",
        experienceInYears: Number(data.experience),
        resumeLink:
          data.resume instanceof File
            ? "" // File upload to get URL should be handled separately before form submission
            : typeof data.resume === "string"
              ? data.resume
              : "",
        currentCtc: Number(data.currentCtc),
        expectedCtc: Number(data.expectedCtc),
        noticePeriodInDays: noticePeriodInDays,
        interviewType: data.interviewType,
        interviewRound: data.interviewRound,
        interviewerComments: data.interviewerComment || "",
        status: data.interviewStatus,
        interviewerId: Number(data.interviewerName),
        interviewStart: interviewStart.toISOString(),
        interviewEnd: interviewEnd.toISOString(),
      };

      // Call the API
      await createInterview(apiBody);
    } catch (error) {
      console.error("Error submitting interview:", error);
    }
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

  // Update current year and date when calendar view changes
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const updateCalendarState = () => {
        const currentDate = calendarApi.getDate();
        setCurrentYear(currentDate.getFullYear());
        setCurrentCalendarDate(currentDate);
      };

      // Listen to date changes
      calendarApi.on("datesSet", updateCalendarState);
      
      // Initial update
      updateCalendarState();

      return () => {
        calendarApi.off("datesSet", updateCalendarState);
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
          eventClassNames="cursor-pointer"
          eventContent={(arg) => {
            return {
              html: `
        <div style="
          padding: 4px 8px;
          width: 100%;
          color: white;
          font-weight: 500;
          background-color: ${arg.event.backgroundColor};
        ">
        ${arg.event.title}
        </div>
      `,
            };
          }}
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
              isSubmitting={isCreatingInterview}
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

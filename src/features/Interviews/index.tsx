/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

// FullCalendar Imports
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";

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
import { ConfirmDialog } from "@/components/confirm-dialog";

// Local Imports
import { InterviewForm } from "./components/interview-form";
import { InterviewDetailsDialog } from "./components/interview-details-dialog";
import { InterviewFormValues } from "./schema";
import { InterviewEvent, InterviewApiResponse } from "./types";
import { useGetTechnologyDropdownList } from "../technology/services";
import { useGetUsersList } from "../users/services";
import {
  useGetInterview,
  useCreateInterview,
  useUpdateInterview,
  useDeleteInterview,
} from "./services";

// --- MAIN PAGE COMPONENT ---
const InterviewsPage = () => {
  const calendarRef = useRef<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<InterviewEvent | null>(
    null
  );
  const [eventToEdit, setEventToEdit] = useState<InterviewEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<InterviewEvent | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(
    new Date()
  );
  const [timeZone, setTimeZone] = useState<string>("");
  const currentCalenderDateRange =
    calendarRef.current?.getApi()?.currentData?.dateProfile?.activeRange;

  console.log("currentCalenderDateRange", currentCalenderDateRange);

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
  const { data: interviewsData }: any = useGetInterview({
    time_zone: timeZone,
    current_date: formatCurrentDate(currentCalendarDate),
    start_date: formatCurrentDate(new Date(currentCalenderDateRange?.start)),
    end_date: formatCurrentDate(new Date(currentCalenderDateRange?.end)),
  });

  const onSuccessCreateInterview = () => {
    setIsAddDialogOpen(false);
    setSelectedDate(null);
  };

  const onSuccessUpdateInterview = () => {
    setIsEditDialogOpen(false);
    setEventToEdit(null);
  };

  const onSuccessDeleteInterview = () => {
    setIsDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const { mutateAsync: createInterview, isPending: isCreatingInterview } =
    useCreateInterview(onSuccessCreateInterview);

  const { mutateAsync: updateInterview, isPending: isUpdatingInterview } =
    useUpdateInterview(onSuccessUpdateInterview);

  const { mutateAsync: deleteInterview, isPending: isDeletingInterview } =
    useDeleteInterview(onSuccessDeleteInterview);

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

  const handleEventClick = (clickInfo: any) => {
    setSelectedEvent(clickInfo.event.toPlainObject() as InterviewEvent);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, event: InterviewEvent) => {
    e.stopPropagation();
    setEventToEdit(event);
    setIsEditDialogOpen(true);
    setIsViewDialogOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, event: InterviewEvent) => {
    e.stopPropagation();
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
    setIsViewDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (eventToDelete) {
      try {
        await deleteInterview(eventToDelete.extendedProps.id);
      } catch (error) {
        console.error("Error deleting interview:", error);
      }
    }
  };

  const handleFormSubmit = async (data: InterviewFormValues) => {
    const dateToUse = eventToEdit
      ? new Date(eventToEdit.extendedProps.interviewStart)
      : selectedDate;
    if (!dateToUse) return;

    try {
      // Parse notice period to extract days (e.g., "30 Days" -> 30)
      const noticePeriodMatch = data.noticePeriod.match(/(\d+)/);
      const noticePeriodInDays = noticePeriodMatch
        ? parseInt(noticePeriodMatch[1], 10)
        : 0;

      // Combine selectedDate with startTime and endTime to create ISO datetime strings
      const [startHours, startMinutes] = data.startTime.split(":").map(Number);
      const [endHours, endMinutes] = data.endTime.split(":").map(Number);

      const interviewStart = new Date(dateToUse);
      interviewStart.setHours(startHours, startMinutes, 0, 0);

      const interviewEnd = new Date(dateToUse);
      interviewEnd.setHours(endHours, endMinutes, 0, 0);

      const resumeKey = data.resumeS3Key || "";

      // Transform form data to match API body structure
      const apiBody = {
        candidateName: data.candidateName,
        technology: Number(data.technology),
        email: data.email,
        phoneNumber: data.phoneNumber,
        location: data.location,
        notes: data.notes || "",
        experienceInYears: Number(data.experience),
        resumeS3Key: resumeKey,
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

      // Call the appropriate API
      if (eventToEdit) {
        await updateInterview({
          id: eventToEdit.extendedProps.id,
          data: apiBody,
        });
      } else {
        await createInterview(apiBody);
      }
    } catch (error) {
      console.error("Error submitting interview:", error);
    }
  };

  const handleYearChange = (year: string) => {
    const selectedYear = parseInt(year, 10);
    setCurrentYear(selectedYear);

    // Get the calendar API and navigate to the selected year
    const calendarApi = calendarRef.current?.getApi();
    console.log("calendarApi", calendarApi);
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
    console.log("calendarApi", calendarApi);
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
          handleEditClick(e as any, event);
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
          handleDeleteClick(e as any, event);
        }
      }
    };

    document.addEventListener("click", handleEditButtonClick);
    document.addEventListener("click", handleDeleteButtonClick);

    return () => {
      document.removeEventListener("click", handleEditButtonClick);
      document.removeEventListener("click", handleDeleteButtonClick);
    };
  }, [events]);

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
          eventClassNames="cursor-pointer fc-interview-event"
          eventContent={(arg) => {
            const event = arg.event.toPlainObject() as InterviewEvent;
            const eventId = `event-${event.id}`;

            return {
              html: `
        <div data-event-id="${eventId}" class="fc-event-content-wrapper" style="
          padding: 6px 8px;
          width: 100%;
          color: white;
          font-weight: 500;
          background-color: ${arg.event.backgroundColor};
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          min-height: 28px;
        ">
          <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 4px;">
            ${arg.event.title}
          </span>
          <div class="fc-event-actions" style="display: flex; align-items: center; gap: 2px; flex-shrink: 0;">
            <button class="fc-edit-btn" data-event-id="${event.id}" style="
              padding: 2px 4px;
              background: rgba(255,255,255,0.2);
              border: none;
              border-radius: 3px;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              transition: background 0.2s;
              color: white;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'" title="Edit">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="fc-delete-btn" data-event-id="${event.id}" style="
              padding: 2px 4px;
              background: rgba(255,255,255,0.2);
              border: none;
              border-radius: 3px;
              cursor: pointer;
              display: inline-flex;
              align-items: center;
              transition: background 0.2s;
              color: white;
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'" title="Delete">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `,
            };
          }}
        />
      </div>

      {selectedDate && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full sm:max-w-[850px]  p-4 sm:p-6">
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

      {eventToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full sm:max-w-[850px] h-fit!  overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Edit Interview</DialogTitle>
              <DialogDescription>
                Update the interview details below.
              </DialogDescription>
            </DialogHeader>
            <InterviewForm
              selectedDate={new Date(eventToEdit.extendedProps.interviewStart)}
              onClose={() => {
                setIsEditDialogOpen(false);
                setEventToEdit(null);
              }}
              onSubmit={handleFormSubmit}
              technologyList={technologyList}
              technologyListLoading={technologyListLoading}
              usersList={usersList}
              usersListLoading={usersListLoading}
              isSubmitting={isUpdatingInterview}
              initialData={eventToEdit.extendedProps}
            />
          </DialogContent>
        </Dialog>
      )}

      {selectedEvent && isViewDialogOpen && (
        <InterviewDetailsDialog
          event={selectedEvent}
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          onEdit={(event) => {
            setEventToEdit(event);
            setIsEditDialogOpen(true);
            setIsViewDialogOpen(false);
          }}
          onDelete={(event) => {
            setEventToDelete(event);
            setIsDeleteDialogOpen(true);
            setIsViewDialogOpen(false);
          }}
        />
      )}

      {isDeleteDialogOpen && (
        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Delete Interview"
          desc={
            eventToDelete
              ? `Are you sure you want to delete the interview for ${eventToDelete.extendedProps.candidateName}? This action cannot be undone.`
              : "Are you sure you want to delete this interview?"
          }
          confirmText="Delete"
          cancelBtnText="Cancel"
          destructive={true}
          handleConfirm={handleDeleteConfirm}
          isLoading={isDeletingInterview}
        />
      )}
    </Main>
  );
};

export default InterviewsPage;

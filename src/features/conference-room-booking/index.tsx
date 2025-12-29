/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// ShadCN UI Imports
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Main } from "@/components/layout/main";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Local Imports
import { ConferenceRoomDetailsDialog } from "./components/conference-room-details-dialog";
import { ConferenceRoomForm } from "./components/conference-room-form";
import { ReactBigCalendar } from "./components/react-big-calendar";
import { ConferenceRoomFormValues } from "./schema";
import {
  useCreateConferenceRoomBooking,
  useDeleteConferenceRoomBooking,
  useGetConferenceRoomBooking,
  useUpdateConferenceRoomBooking,
} from "./services";
import { ConferenceRoomApiResponse, ConferenceRoomEvent } from "./types";
import { FilterConfig } from "@/components/table/table-toolbar";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { useGetProjectSDropdownList } from "../Project-type/services";
import { Button } from "@/components/ui/button";

// --- MAIN PAGE COMPONENT ---
const ConferenceRoomBookingPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRange, setSelectedRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] =
    useState<ConferenceRoomEvent | null>(null);
  const [eventToEdit, setEventToEdit] = useState<ConferenceRoomEvent | null>(
    null
  );
  const [eventToDelete, setEventToDelete] =
    useState<ConferenceRoomEvent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(
    new Date()
  );
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">(
    "month"
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [timeZone, setTimeZone] = useState<string>("");

  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    projectId: undefined,
  });
  const [headerDate, setHeaderDate] = useState<Date | null>(null);

  const apiParams = {
    page: listParams.currentPage,
    projectId: listParams.projectId,
  };

  // Get browser timezone dynamically
  useEffect(() => {
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimeZone(browserTimeZone);
  }, []);

  const { data: projectsList, isPending: projectsListLoading }: any =
    useGetProjectSDropdownList();

  // Format current calendar date as YYYY-MM-DD
  const formatCurrentDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Calculate date range based on current view for API
  const getDateRange = () => {
    const start = new Date(currentCalendarDate);
    const end = new Date(currentCalendarDate);

    if (calendarView === "month") {
      start.setDate(1);
      const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      end.setDate(lastDay.getDate());
    } else if (calendarView === "week") {
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      end.setDate(start.getDate() + 6);
    } else {
      // day view
      end.setDate(start.getDate());
    }

    return { start, end };
  };

  const dateRange = getDateRange();

  const { data: conferenceRoomsData }: any = useGetConferenceRoomBooking({
    timezone: timeZone,
    startDate: formatCurrentDate(dateRange.start),
    endDate: formatCurrentDate(dateRange.end),
    projectId: apiParams.projectId,
  });

  const onSuccessCreateBooking = () => {
    setIsAddDialogOpen(false);
    setSelectedDate(null);
  };

  const onSuccessUpdateBooking = () => {
    setIsEditDialogOpen(false);
    setEventToEdit(null);
  };

  const onSuccessDeleteBooking = () => {
    setIsDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const { mutateAsync: createBooking, isPending: isCreatingBooking } =
    useCreateConferenceRoomBooking(onSuccessCreateBooking);

  const { mutateAsync: updateBooking, isPending: isUpdatingBooking } =
    useUpdateConferenceRoomBooking(onSuccessUpdateBooking);

  const { mutateAsync: deleteBooking, isPending: isDeletingBooking } =
    useDeleteConferenceRoomBooking(onSuccessDeleteBooking);

  // Transform API response to ConferenceRoomEvent format
  const events: ConferenceRoomEvent[] = useMemo(() => {
    if (!conferenceRoomsData?.data) return [];

    return conferenceRoomsData.data
      .map((booking: ConferenceRoomApiResponse) => {
        // Parse the startDate (YYYY-MM-DD format)
        const startDateOnly = booking.slotStartDate
          ? new Date(booking.slotStartDate)
          : new Date();

        // Parse startTime and endTime (HH:mm:ss format)
        const startTimeParts = booking.startTime?.split(":") || [
          "00",
          "00",
          "00",
        ];
        const endTimeParts = booking.endTime?.split(":") || ["00", "00", "00"];

        // Create start datetime by combining startDate with startTime
        const startDateTime = new Date(startDateOnly);
        startDateTime.setHours(
          parseInt(startTimeParts[0], 10),
          parseInt(startTimeParts[1], 10),
          parseInt(startTimeParts[2], 10),
          0
        );

        // Create end datetime by combining startDate with endTime (same day)
        const endDateTime = new Date(startDateOnly);
        endDateTime.setHours(
          parseInt(endTimeParts[0], 10),
          parseInt(endTimeParts[1], 10),
          parseInt(endTimeParts[2], 10),
          0
        );

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          return null;
        }

        // --- MODIFICATION START: Determine color based on meetingType ---
        // If 'client', use red (#e80339), otherwise use blue (#039be5)
        const eventColor =
          booking.meetingType === "client" ? "#e80339" : "#039be5";
        // --- MODIFICATION END ---

        return {
          id: booking.id.toString(),
          title: booking.meetingName || "Untitled Meeting",
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          backgroundColor: eventColor, // Use derived color
          borderColor: eventColor, // Use derived color
          extendedProps: booking,
        };
      })
      .filter(
        (event: ConferenceRoomEvent | null) => event !== null
      ) as ConferenceRoomEvent[];
  }, [conferenceRoomsData]);

  const handleDateClick = (slotInfo: { start: Date; end: Date }) => {
    setSelectedDate(slotInfo.start);
    setHeaderDate(slotInfo.start);
    // Only use the selected range if NOT in month view
    // In month view, we want to default to 10:00 - 11:00 AM
    if (calendarView !== "month") {
      setSelectedRange(slotInfo);
    } else {
      setSelectedRange(null);
    }
    setIsAddDialogOpen(true);
  };

  const handleEventClick = (event: ConferenceRoomEvent) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, event: ConferenceRoomEvent) => {
    e.stopPropagation();
    setEventToEdit(event);
    setHeaderDate(new Date(event.extendedProps.slotStartDate));
    setIsEditDialogOpen(true);
    setIsViewDialogOpen(false);
  };

  const handleDeleteClick = (
    e: React.MouseEvent,
    event: ConferenceRoomEvent
  ) => {
    e.stopPropagation();
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
    setIsViewDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (eventToDelete) {
      try {
        await deleteBooking(eventToDelete.extendedProps.id);
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };

  const handleFormSubmit = async (data: ConferenceRoomFormValues) => {
    try {
      const formatTimeForAPI = (time: string): string => {
        return `${time}:00`;
      };

      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      let startDateForAPI: string;
      let endDateForAPI: string;

      // --- CHANGE START: Use data.startDate from form ---

      // We prioritize the date selected in the form
      const formStartDate = new Date(data.startDate);

      if (!formStartDate) {
        console.error("Start date is required");
        return;
      }

      startDateForAPI = formatDateForAPI(formStartDate);

      // Handle End Date logic
      if (data.recurringType && data.recurringType !== "none") {
        if (!data.endDate) {
          console.error("End date is required for recurring bookings");
          return;
        }
        endDateForAPI = formatDateForAPI(data.endDate);
      } else {
        // For non-recurring, End Date is the same as Start Date
        endDateForAPI = formatDateForAPI(formStartDate);
      }

      // --- CHANGE END ---

      const apiBody = {
        meetingName: data.meetingName,
        projectId: Number(data.projectId),
        meetingType: data.meetingType,
        startDate: startDateForAPI,
        endDate: endDateForAPI,
        startTime: formatTimeForAPI(data.startTime),
        endTime: formatTimeForAPI(data.endTime),
        recurringType: data.recurringType,
        daysOfWeek: data.daysOfWeek,
      };

      if (eventToEdit) {
        await updateBooking({
          id: eventToEdit.extendedProps.id,
          data: apiBody,
        });
      } else {
        await createBooking(apiBody);
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
    }
  };

  const handleMonthChange = (date: Date) => {
    setCurrentCalendarDate(date);
    setSelectedYear(date.getFullYear());
  };

  const handleYearChange = (direction: "prev" | "next" | "current") => {
    let newYear: number;

    if (direction === "current") {
      newYear = new Date().getFullYear();
    } else if (direction === "prev") {
      newYear = selectedYear - 1;
    } else {
      newYear = selectedYear + 1;
    }

    setSelectedYear(newYear);

    // Update calendar date to selected year with today's month and day
    const today = new Date();
    const newDate = new Date(
      newYear,
      today.getMonth(), // Current month
      today.getDate() // Current day
    );
    setCurrentCalendarDate(newDate);
  };

  const handleProjectChange = (value: any) => {
    setListParams({
      ...listParams,
      projectId: value ?? null,
      currentPage: 1,
    });
  };

  const filters: FilterConfig[] = [
    {
      type: "select",
      key: "projectId",
      placeholder: "Filter by Project",
      options: projectsList?.data?.map((project: any) => {
        return { value: project.id, label: project.name };
      }),
      value: listParams.projectId,
      onChange: handleProjectChange,
      isLoading: projectsListLoading,
    },
  ];

  return (
    <Main>
      <div className="p-4">
        <div className="mb-4 space-y-3">
          {/* Year Selector */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Year:
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleYearChange("prev")}
                  className="h-8 px-3"
                >
                  <ChevronLeft /> {selectedYear - 1}
                </Button>
                <Button
                  variant={
                    selectedYear === new Date().getFullYear()
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleYearChange("current")}
                  className="h-8 px-4 font-semibold"
                >
                  {selectedYear === new Date().getFullYear()
                    ? selectedYear
                    : "Today"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleYearChange("next")}
                  className="h-8 px-3"
                >
                  {selectedYear + 1} <ChevronRight />
                </Button>
              </div>
            </div>
            <GlobalFilterSection filters={filters ?? []} />
          </div>
        </div>

        <ReactBigCalendar
          events={events}
          currentDate={currentCalendarDate}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onEventEdit={(event, e) => handleEditClick(e, event)}
          onEventDelete={(event, e) => handleDeleteClick(e, event)}
          onNavigate={handleMonthChange}
          view={calendarView}
          onViewChange={(view) => {
            if (view === "month" || view === "week" || view === "day") {
              setCalendarView(view);
            }
          }}
        />
      </div>

      {selectedDate && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full sm:max-w-[850px] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>
                Book Conference Room for{" "}
                {headerDate ? format(headerDate, "PPP") : ""}
              </DialogTitle>
              <DialogDescription>
                Fill in all details to book the conference room.
              </DialogDescription>
            </DialogHeader>
            <ConferenceRoomForm
              selectedDate={selectedDate}
              initialStartTime={
                selectedRange ? format(selectedRange.start, "HH:mm") : undefined
              }
              initialEndTime={
                selectedRange ? format(selectedRange.end, "HH:mm") : undefined
              }
              onClose={() => setIsAddDialogOpen(false)}
              onSubmit={handleFormSubmit}
              projectsList={projectsList}
              projectsListLoading={projectsListLoading}
              isSubmitting={isCreatingBooking}
              existingEvents={events}
              onDateChange={setHeaderDate}
            />
          </DialogContent>
        </Dialog>
      )}

      {eventToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full sm:max-w-[850px] h-fit! overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>
                Edit Conference Room Booking for{" "}
                {format(
                  new Date(eventToEdit.extendedProps.slotStartDate),
                  "PPP"
                )}
              </DialogTitle>
              <DialogDescription>
                Update the booking details below.
              </DialogDescription>
            </DialogHeader>
            <ConferenceRoomForm
              selectedDate={new Date(eventToEdit.extendedProps.slotStartDate)}
              onClose={() => {
                setIsEditDialogOpen(false);
                setEventToEdit(null);
              }}
              onSubmit={handleFormSubmit}
              projectsList={projectsList}
              projectsListLoading={projectsListLoading}
              isSubmitting={isUpdatingBooking}
              initialData={eventToEdit.extendedProps}
              existingEvents={events}
              onDateChange={setHeaderDate}
            />
          </DialogContent>
        </Dialog>
      )}

      {selectedEvent && isViewDialogOpen && (
        <ConferenceRoomDetailsDialog
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
          title="Delete Conference Room Booking"
          desc={
            eventToDelete
              ? `Are you sure you want to delete the booking for ${eventToDelete.extendedProps.meetingName}? This action cannot be undone.`
              : "Are you sure you want to delete this booking?"
          }
          confirmText="Delete"
          cancelBtnText="Cancel"
          destructive={true}
          handleConfirm={handleDeleteConfirm}
          isLoading={isDeletingBooking}
        />
      )}
    </Main>
  );
};

export default ConferenceRoomBookingPage;

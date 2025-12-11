/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
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
  
// --- MAIN PAGE COMPONENT ---
const ConferenceRoomBookingPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  const apiParams = {
    page: listParams.currentPage,
    projectId: listParams.projectId,
  };

  const currentYear = new Date().getFullYear();
  const startYear = 2020;

  const years = Array.from(
    { length: currentYear - startYear + 1 + 3 },
    (_, i) => startYear + i
  );

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
        const startDateOnly = booking.startDate
          ? new Date(booking.startDate)
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

        return {
          id: booking.id.toString(),
          title: booking.meetingName || "Untitled Meeting",
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          backgroundColor: "#039be5",
          borderColor: "#039be5",
          extendedProps: booking,
        };
      })
      .filter(
        (event: ConferenceRoomEvent | null) => event !== null
      ) as ConferenceRoomEvent[];
  }, [conferenceRoomsData]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsAddDialogOpen(true);
  };

  const handleEventClick = (event: ConferenceRoomEvent) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, event: ConferenceRoomEvent) => {
    e.stopPropagation();
    setEventToEdit(event);
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
      // Helper to format time as HH:mm:ss
      const formatTimeForAPI = (time: string): string => {
        return `${time}:00`; // Convert HH:mm to HH:mm:ss
      };

      // Helper to format date as YYYY-MM-DD or ISO string
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      let startDateForAPI: string;
      let endDateForAPI: string;

      // For recurring bookings, use selectedDate as startDate and form endDate
      if (data.recurringType && data.recurringType !== "none") {
        const dateToUse = eventToEdit
          ? new Date(eventToEdit.extendedProps.startDate)
          : selectedDate;

        if (!dateToUse) {
          console.error("Selected date is required");
          return;
        }

        if (!data.endDate) {
          console.error("End date is required for recurring bookings");
          return;
        }

        // Use selectedDate (calendar date) as startDate
        startDateForAPI = formatDateForAPI(dateToUse);
        // Use form endDate as endDate
        endDateForAPI = formatDateForAPI(data.endDate);
      } else {
        // For non-recurring bookings, use the selected date for both
        const dateToUse = eventToEdit
          ? new Date(eventToEdit.extendedProps.startDate)
          : selectedDate;

        if (!dateToUse) return;

        startDateForAPI = formatDateForAPI(dateToUse);
        endDateForAPI = formatDateForAPI(dateToUse);
      }

      // Transform form data to match API body structure
      const apiBody = {
        meetingName: data.meetingName,
        projectId: Number(data.projectId),
        startDate: startDateForAPI, // YYYY-MM-DD format
        endDate: endDateForAPI, // YYYY-MM-DD format
        startTime: formatTimeForAPI(data.startTime), // HH:mm:ss format
        endTime: formatTimeForAPI(data.endTime), // HH:mm:ss format
        recurringType: data.recurringType,
        // notes: data.notes || "",
      };

      // Call the appropriate API
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

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year, 10);
    setSelectedYear(newYear);

    const today = new Date();
    const newDate = new Date(newYear, today.getMonth(), today.getDate());
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
                Select Year:
              </span>
              <Select
                value={selectedYear.toString()}
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
                Book Conference Room for {format(selectedDate, "PPP")}
              </DialogTitle>
              <DialogDescription>
                Fill in all details to book the conference room.
              </DialogDescription>
            </DialogHeader>
            <ConferenceRoomForm
              selectedDate={selectedDate}
              onClose={() => setIsAddDialogOpen(false)}
              onSubmit={handleFormSubmit}
              projectsList={projectsList}
              projectsListLoading={projectsListLoading}
              isSubmitting={isCreatingBooking}
            />
          </DialogContent>
        </Dialog>
      )}

      {eventToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] sm:w-full sm:max-w-[850px] h-fit! overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Edit Conference Room Booking</DialogTitle>
              <DialogDescription>
                Update the booking details below.
              </DialogDescription>
            </DialogHeader>
            <ConferenceRoomForm
              selectedDate={new Date(eventToEdit.extendedProps.startDate)}
              onClose={() => {
                setIsEditDialogOpen(false);
                setEventToEdit(null);
              }}
              onSubmit={handleFormSubmit}
              projectsList={projectsList}
              projectsListLoading={projectsListLoading}
              isSubmitting={isUpdatingBooking}
              initialData={eventToEdit.extendedProps}
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

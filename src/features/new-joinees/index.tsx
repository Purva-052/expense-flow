/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNewJoineeStore } from "./stores/useNewJoineeStore";
import { useState } from "react";
import { useGetNewJoineesList } from "./services";
import { useGetTechnologyDropdownList } from "../technology/services";
import { FilterConfig } from "@/components/table/table-toolbar";
import { Main } from "@/components/layout/main";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { ActionFormModal } from "./component/action";
import {
  JoineeDetailsDialog,
  JoineeEvent,
} from "./component/joinee-details-dialog";
import { JoineeCalendar } from "./component/joinee-calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDeleteInterview } from "../Interviews/services";

const NewJoineesPage = () => {
  const { open, setOpen, setCurrentRow } = useNewJoineeStore();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<JoineeEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<JoineeEvent | null>(null);
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

  // Initialize timezone immediately to ensure it's available for first API call
  const [timeZone] = useState<string>(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  const [listParams, setListParams] = useState({
    pageSize: 10,
    currentPage: 1,
    search: "",
    technologyId: null,
    status: undefined,
  });

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

  const apiParams = {
    page: listParams.currentPage,
    limit: listParams.pageSize,
    search: listParams.search,
    pagination: false, // Get all joinees for calendar view
    technologyId: listParams.technologyId,
    status: listParams.status,
    timezone: timeZone,
    startDate: formatCurrentDate(dateRange.start),
    endDate: formatCurrentDate(dateRange.end),
  };

  const { data: listData } = useGetNewJoineesList(apiParams);

  const { data: technologyList, isPending: technologyListLoading }: any =
    useGetTechnologyDropdownList();

  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const years = Array.from(
    { length: currentYear - startYear + 1 + 3 },
    (_, i) => startYear + i
  );

  // Transform joinees data to calendar events
  const events: JoineeEvent[] = ((listData as any)?.data || [])
    .map((joinee: any) => {
      // Use joiningDate if available, otherwise use interviewStart as fallback
      const dateToUse = joinee.joiningDate || joinee.interviewStart;

      // Skip if no valid date is available
      if (!dateToUse) {
        return null;
      }

      const joiningDate = new Date(dateToUse);

      // Skip if date is invalid
      if (isNaN(joiningDate.getTime())) {
        return null;
      }

      return {
        id: joinee.id.toString(),
        title: joinee.candidateName,
        start: joiningDate.toISOString(),
        end: joiningDate.toISOString(),
        backgroundColor: joinee.technology.color || "#10b981",
        borderColor: "#10b981",
        extendedProps: joinee,
      };
    })
    .filter(
      (event: JoineeEvent | null): event is JoineeEvent => event !== null
    );

  const handleTechnologyChange = (value: any) => {
    setListParams({
      ...listParams,
      technologyId: value ?? null,
      currentPage: 1,
    });
  };

  const filters: FilterConfig[] = [
    {
      type: "select",
      key: "technologyId",
      placeholder: "Filter by Technology",
      options: technologyList?.data?.map((technology: any) => {
        return { value: technology.id, label: technology.name };
      }),
      value: listParams.technologyId,
      onChange: handleTechnologyChange,
      isLoading: technologyListLoading,
    },
  ];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentRow(null);
    setOpen("add");
  };

  const handleEventClick = (event: JoineeEvent) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (event: JoineeEvent) => {
    setCurrentRow(event.extendedProps);
    setOpen("edit");
    setIsViewDialogOpen(false);
  };

  const handleDeleteClick = (event: JoineeEvent) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
    setIsViewDialogOpen(false);
  };

  const onSuccessDelete = () => {
    setIsDeleteDialogOpen(false);
    setEventToDelete(null);
  };

  const { mutateAsync: deleteJoinee, isPending: isDeletingJoinee } =
    useDeleteInterview(onSuccessDelete);

  const handleDeleteConfirm = async () => {
    if (eventToDelete) {
      try {
        await deleteJoinee(eventToDelete.extendedProps.id);
      } catch (error) {
        console.error("Error deleting joinee:", error);
      }
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

  return (
    <Main>
      <div className="p-4">
        <div className="mb-4 space-y-3">
          {/* Year Selector and Filters */}
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

        <JoineeCalendar
          events={events as any}
          currentDate={currentCalendarDate}
          onDateClick={handleDateClick}
          onEventClick={(event: any) => handleEventClick(event as JoineeEvent)}
          onEventEdit={(event: any) => handleEditClick(event as JoineeEvent)}
          onNavigate={handleMonthChange}
          view={calendarView}
          onViewChange={(view) => {
            if (view === "month" || view === "week" || view === "day") {
              setCalendarView(view);
            }
          }}
        />
      </div>

      {/* Add Joinee Modal */}
      {open && (
        <ActionFormModal
          technologyList={technologyList}
          technologyListLoading={technologyListLoading}
          selectedDate={selectedDate}
        />
      )}

      {/* View Joinee Details Dialog */}
      {selectedEvent && isViewDialogOpen && (
        <JoineeDetailsDialog
          event={selectedEvent}
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Delete Joinee"
          desc={
            eventToDelete
              ? `Are you sure you want to delete ${eventToDelete.extendedProps.candidateName}? This action cannot be undone.`
              : "Are you sure you want to delete this joinee?"
          }
          confirmText="Delete"
          cancelBtnText="Cancel"
          destructive={true}
          handleConfirm={handleDeleteConfirm}
          isLoading={isDeletingJoinee}
        />
      )}
    </Main>
  );
};

export default NewJoineesPage;

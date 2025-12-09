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
import { InterviewDetailsDialog } from "./components/interview-details-dialog";
import { InterviewForm } from "./components/interview-form";

import { useGetTechnologyDropdownList } from "../technology/services";
import { useGetUsersList } from "../users/services";
import { ReactBigCalendar } from "./components/react-big-calendar";
import { InterviewFormValues } from "./schema";
import {
  useCreateInterview,
  useDeleteInterview,
  useGetInterview,
  useUpdateInterview,
} from "./services";
import { InterviewApiResponse, InterviewEvent } from "./types";
import { FilterConfig } from "@/components/table/table-toolbar";
import GlobalFilterSection from "@/components/table/global-table-filter";
import { roles } from "@/utils/constant";

// --- MAIN PAGE COMPONENT ---
const InterviewsPage = () => {
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
    // search: "",
    // clientId: undefined,
    // priority: undefined,
    // handlerId: undefined,
    // projectTypeId: undefined,
    technologyId: undefined,
  });

  const apiParams = {
    page: listParams.currentPage,
    // limit: listParams.pageSize,
    // search: listParams.search,
    // pagination: true,
    // clientId: listParams.clientId,
    // priority: listParams.priority,
    // handlerId: listParams.handlerId,
    // projectTypeId: listParams.projectTypeId,
    technologyId: listParams.technologyId,
  };

  // const [currentDateRange, setCurrentDateRange] = useState<{
  //   start: Date;
  //   end: Date;
  // } | null>(null);

  // console.log("currentDateRange", currentDateRange);

  const currentYear = new Date().getFullYear();

  // previous years (example: from 1900)
  const startYear = 2020;

  const years = Array.from(
    { length: currentYear - startYear + 1 + 3 }, // total count
    (_, i) => startYear + i
  );

  // Get browser timezone dynamically
  useEffect(() => {
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimeZone(browserTimeZone);
  }, []);

  const { data: technologyList, isPending: technologyListLoading }: any =
    useGetTechnologyDropdownList();

  const { data: usersList, isPending: usersListLoading } = useGetUsersList({
    pagination: false,
    role: [roles.TEAM_LEAD, roles.PROJECT_MANAGER],
  });

  // Format current calendar date as YYYY-MM-DD
  const formatCurrentDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // function toISTISOString(date: Date) {
  //   // convert to IST (UTC+5:30)
  //   const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

  //   return istDate.toISOString().slice(0, 19); // remove Z
  // }

  // Calculate current_date for API: selected year + today's month + today's day
  // const getCurrentDateForAPI = useMemo(() => {
  //   const today = new Date();
  //   return new Date(
  //     selectedYear,
  //     today.getMonth(), // Current month (November = 10)
  //     today.getDate() // Current day (25)
  //   );
  // }, [selectedYear]);

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

  const { data: interviewsData }: any = useGetInterview({
    timezone: timeZone,
    startDate: formatCurrentDate(dateRange.start),
    endDate: formatCurrentDate(dateRange.end),
    technologyId: apiParams.technologyId,
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

  // Transform API response to InterviewEvent format
  const events: InterviewEvent[] = useMemo(() => {
    if (!interviewsData?.data) return [];

    return interviewsData.data
      .map((interview: InterviewApiResponse) => {
        // console.log("interview: ", interview);
        // Parse dates - handle both ISO strings and Date objects
        const startDate = interview.interviewStart
          ? new Date(interview.interviewStart)
          : new Date();
        const endDate = interview.interviewEnd
          ? new Date(interview.interviewEnd)
          : new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration

        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return null;
        }
        // console.log("interview.interviewer.name: ", interview.interviewer.name);

        return {
          id: interview.id.toString(),
          title: interview.candidateName || "Untitled Interview",
          interViewer: interview.interviewer.name,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          backgroundColor: interview.technology?.colour || "#10B981",
          borderColor: interview.technology?.colour || "#10B981",
          extendedProps: interview,
        };
      })
      .filter(
        (event: InterviewEvent | null) => event !== null
      ) as InterviewEvent[];
  }, [interviewsData]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsAddDialogOpen(true);
  };

  const handleEventClick = (event: InterviewEvent) => {
    setSelectedEvent(event);
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
      const noticePeriodMatch = data?.noticePeriod?.match(/(\d+)/);
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
        ...(data.joiningDate && { joiningDate: data.joiningDate }),
        ...(data.interviewType === "video_call" && {
          interviewUrl: data.interviewUrl,
        }),
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

  const handleMonthChange = (date: Date) => {
    setCurrentCalendarDate(date);
    // Update selected year when calendar navigates
    setSelectedYear(date.getFullYear());
  };

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year, 10);
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

  const handleTechnologyChange = (value: any) => {
    setListParams({
      ...listParams,
      technologyId: value ?? null,
      currentPage: 1,
    });
  };

  // const TechnologyLegend = ({ technologies }: { technologies: any }) => {
  //   if (!technologies || technologies.length === 0) return null;

  //   return (
  //     <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-muted/40 rounded-xl border">
  //       <span className="text-sm font-medium text-muted-foreground mr-2">
  //         Technologies:
  //       </span>

  //       {technologies.map((tech: any) => (
  //         <div
  //           key={tech.id}
  //           className="flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border hover:shadow-md transition-all cursor-default"
  //         >
  //           <span
  //             className="h-3 w-3 rounded-full"
  //             style={{ backgroundColor: tech.color }}
  //           ></span>

  //           <span className="text-sm font-medium">{tech.name}</span>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };

  const filters: FilterConfig[] = [
    {
      type: "select",
      key: "technologyId",
      placeholder: "Filter by Technology",
      options: technologyList?.data?.map((technology: any) => {
        return { value: technology.id, label: technology.name };
      }),
      value: listParams.technologyId, // 👈 pre-selects if set
      onChange: handleTechnologyChange,
      isLoading: technologyListLoading,
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
              {/* <span>{interview.technology?.colour}</span> */}
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
          // onRangeChange={(range) => {
          //   console.log("range", range);
          // }}
          onViewChange={(view) => {
            if (view === "month" || view === "week" || view === "day") {
              setCalendarView(view);
            }
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
          onStatusUpdate={(eventId, newStatus) => {
            // Update the selectedEvent state with the new status
            if (selectedEvent && selectedEvent.id === eventId) {
              setSelectedEvent({
                ...selectedEvent,
                extendedProps: {
                  ...selectedEvent.extendedProps,
                  status: newStatus,
                },
              });
            }
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

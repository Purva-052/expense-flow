import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { GlobalTable } from "@/components/table/global-table";
import { MonthYearPicker } from "./month-year-picker";
import { CalendarIcon, CheckCircle, CheckCircle2, Clock, Loader2, MoreVertical, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/use-auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  useGetCompensatoryDates,
  useCreateRegularizationRequest,
  useGetRegularizationRequests,
  useRegularizationAction,
} from "../services";
import { useGetUsersList, useGetUserDropdownList } from "../../users/services";
// import { useGetLeaveAllocations } from "../../leave-management/services";
import { toast } from "sonner";
import { roles } from "@/utils/constant";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import API from "@/config/api/api";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";

const formatToYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDisplayCompensatoryDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return format(new Date(year, month, day), "PPP");
};

interface AttendanceTableProps {
  detailedLogs: any[];
  onRowClick: (rawDateStr: string) => void;
  embedded?: boolean;
  monthNavigator?: {
    label: string;
    month: number;
    year: number;
    onChange: (month: number, year: number) => void;
    onPrev: () => void;
    onNext: () => void;
    isLoading?: boolean;
  };
  employeeId?: number;
}

const isFutureDate = (dateStr: string) => {
  if (!dateStr) return false;
  const parts = dateStr.split("-");
  if (parts.length < 3) return false;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const target = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return target.getTime() > today.getTime();
};

const isTodayOrFutureDate = (dateStr: string) => {
  if (!dateStr) return false;
  const parts = dateStr.split("-");
  if (parts.length < 3) return false;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const target = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return target.getTime() >= today.getTime();
};

// const getWorkingDayBefore = (date: Date, count: number): Date => {
//   const result = new Date(date);
//   let workingDaysFound = 0;
//   while (workingDaysFound < count) {
//     result.setDate(result.getDate() - 1);
//     const day = result.getDay();
//     if (day !== 0 && day !== 6) { // Not Sunday (0) and not Saturday (6)
//       workingDaysFound++;
//     }
//   }
//   return result;
// };

// const getWorkingDayAfter = (date: Date, count: number): Date => {
//   const result = new Date(date);
//   let workingDaysFound = 0;
//   while (workingDaysFound < count) {
//     result.setDate(result.getDate() + 1);
//     const day = result.getDay();
//     if (day !== 0 && day !== 6) { // Not Sunday (0) and not Saturday (6)
//       workingDaysFound++;
//     }
//   }
//   return result;
// };

const getStatusBadge = (
  status: "P" | "A" | "WO" | "AH" | "E" | "L" | "",
  isFuture: boolean = false
) => {
  if (isFuture && status === "A") {
    return (
      <Badge className="bg-muted text-muted-foreground/60 text-[10px] rounded-md px-2 py-0.5">
        -
      </Badge>
    );
  }
  switch (status) {
    case "P":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          PRESENT
        </Badge>
      );
    case "A":
      return (
        <Badge className="bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          ABSENT
        </Badge>
      );
    case "WO":
      return (
        <Badge className="bg-muted text-muted-foreground border border-border hover:bg-muted text-[10px] font-bold rounded-md px-2 py-0.5">
          WEEKLY OFF
        </Badge>
      );
    case "AH":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          HALF DAY
        </Badge>
      );
    case "E":
      return (
        <Badge className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          LATE/EXCUSED
        </Badge>
      );
    case "L":
      return (
        <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          ON LEAVE
        </Badge>
      );
    default:
      return (
        <Badge className="bg-muted text-muted-foreground/60 text-[10px] rounded-md px-2 py-0.5">
          -
        </Badge>
      );
  }
};

const isLessThanEightFifteen = (
  workingHrs: string | null | undefined
): boolean => {
  if (!workingHrs || workingHrs === "-") return false;
  const cleanStr = workingHrs.replace(/HRS/gi, "").trim();
  const parts = cleanStr.split(":");
  if (parts.length < 2) return false;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return false;
  return hours * 60 + minutes < 495; // 8 * 60 + 15 = 495
};

interface AttendanceLogRow {
  day: string;
  date: string;
  rawDateStr: string;
  originalStatus: "P" | "A" | "WO" | "AH" | "E" | "L" | "";
  finalStatus: "P" | "A" | "WO" | "AH" | "E" | "L" | "";
  firstIn: string;
  lastOut: string;
  breakHrs: string;
  workingHrs: string;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  detailedLogs,
  onRowClick,
  embedded = false,
  monthNavigator,
  employeeId,
}) => {
  const user = useAuthStore((state) => state.user);
  const resolvedEmpId = employeeId || Number(user?.user?.id);

  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();
  const isAdmin = roleName === roles.ADMIN;

  const isRegularizingForAnotherEmployee = isAdmin && (Number(resolvedEmpId) !== Number(user?.user?.id));

  // const { data: allocationsResponse } = useGetLeaveAllocations(isAdmin) as any;
  // const allocations = allocationsResponse?.data || {};
  // const workingDaysAllowed = allocations.workingDaysAllowed !== undefined && allocations.workingDaysAllowed !== null
  //   ? Number(allocations.workingDaysAllowed)
  //   : 3;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegDate, _setSelectedRegDate] = useState("");
  const [compensatoryDate, setCompensatoryDate] = useState("");
  const [reason, setReason] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<
    Date | undefined
  >(undefined);

  // Fetch active users list to find the matching employee's code
  const { data: usersResponse } = useGetUsersList({
    pagination: false,
    status: "active",
  });

  const matchedUser = (usersResponse as any)?.data?.find((u: any) => {
    const empId = u.employeeId ?? u.employee?.id;
    return (
      (empId && Number(empId) === Number(resolvedEmpId)) ||
      Number(u.id) === Number(resolvedEmpId) ||
      (u.mewurkEmployeeCode && String(u.mewurkEmployeeCode).trim() === String(resolvedEmpId).trim())
    );
  });

  const employeeCode = matchedUser?.mewurkEmployeeCode || (resolvedEmpId ? String(resolvedEmpId) : "");

  // Fetch available compensatory dates
  const { data: highWorkingHoursData, isPending: isLoadingHighWorkingHours } =
    useGetCompensatoryDates(employeeCode, selectedRegDate, isModalOpen);

  const queryClient = useQueryClient();
  const { mutate: autoApprove } = useRegularizationAction(() => {
    queryClient.invalidateQueries({ queryKey: [API.attendance.regularization_list] });
    queryClient.invalidateQueries({ queryKey: [API.attendance.compensatory_date] });
  });

  const { mutate: createRegularization, isPending: isSubmitting } =
    useCreateRegularizationRequest((data: any) => {
      setIsModalOpen(false);
      setCompensatoryDate("");
      setReason("");
      
      const regId = data?.id;
      if (resolvedEmpId === 4 && regId) {
        autoApprove({ id: regId, status: "approved" });
      }
    });

  const highWorkingHoursDates: string[] = (
    (highWorkingHoursData as any)?.data || []
  )
    .map((item: any) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        return (
          item.attendanceDate ||
          item.date ||
          item.rawDateStr ||
          item.attendance_date
        );
      }
      return null;
    })
    .filter(Boolean);

  useEffect(() => {
    if (selectedRegDate) {
      setCurrentCalendarMonth(new Date(selectedRegDate));
    }
  }, [selectedRegDate]);

  const handleOpenRegularization = (dateStr: string) => {
    _setSelectedRegDate(dateStr);
    setCompensatoryDate("");
    setIsCalendarOpen(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedEmpId) {
      toast.error("Employee ID is missing.");
      return;
    }
    if (!isRegularizingForAnotherEmployee && !compensatoryDate) {
      toast.error("Please select a compensatory date.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please enter a reason.");
      return;
    }

    createRegularization({
      employeeId: Number(resolvedEmpId),
      regularizationDate: selectedRegDate,
      ...(isRegularizingForAnotherEmployee ? {} : { compensatoryDate }),
      reason: reason.trim(),
      ...(Number(resolvedEmpId) === 4 ? { status: "approved" } : {}),
    });
  };

  const columns = useMemo<ColumnDef<AttendanceLogRow>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="font-semibold text-muted-foreground">
            {row.original.date}
          </span>
        ),
      },
      {
        accessorKey: "originalStatus",
        header: "Original Status",
        cell: ({ row }) =>
          getStatusBadge(
            row.original.originalStatus,
            isTodayOrFutureDate(row.original.rawDateStr)
          ),
      },
      {
        accessorKey: "finalStatus",
        header: "Final Status",
        cell: ({ row }) =>
          getStatusBadge(
            row.original.finalStatus,
            isTodayOrFutureDate(row.original.rawDateStr)
          ),
      },
      {
        accessorKey: "firstIn",
        header: "First In",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.firstIn}
          </span>
        ),
      },
      {
        accessorKey: "lastOut",
        header: "Last Out",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.lastOut}
          </span>
        ),
      },
      {
        accessorKey: "breakHrs",
        header: "Break Time",
        cell: ({ row }) => (
          <span className="font-medium text-muted-foreground/85">
            {row.original.breakHrs}
          </span>
        ),
      },
      {
        accessorKey: "workingHrs",
        header: "Working Hours",
        cell: ({ row }) => (
          <span
            className={`font-bold transition-colors ${
              isLessThanEightFifteen(row.original.workingHrs) &&
              !matchedUser?.isSingleCheckInAllowed
                ? "text-rose-600 dark:text-rose-400"
                : "text-sky-600 dark:text-sky-400"
            }`}
          >
            {row.original.workingHrs}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right" />,
        cell: ({ row }) => {
          const future = isFutureDate(row.original.rawDateStr);
          const canApplyRegularization =
            !future &&
            isLessThanEightFifteen(row.original.workingHrs) &&
            !matchedUser?.isSingleCheckInAllowed;

          if (!canApplyRegularization) {
            return <div className="w-full text-right" />;
          }

          return (
            <div className="w-full text-right" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRegularization(row.original.rawDateStr);
                    }}
                  >
                    Apply Regularization
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [matchedUser?.isSingleCheckInAllowed]
  );

  return (
    <div
      className={
        embedded
          ? "flex flex-col min-h-0"
          : "border border-border rounded-xl shadow-lg bg-card overflow-hidden flex flex-col"
      }
    >
      {monthNavigator && (
        <div className="flex justify-center py-3 px-4 border-b border-border bg-card shrink-0">
          <MonthYearPicker
            month={monthNavigator.month}
            year={monthNavigator.year}
            onChange={monthNavigator.onChange}
            onPrev={monthNavigator.onPrev}
            onNext={monthNavigator.onNext}
            isLoading={monthNavigator.isLoading}
          />
        </div>
      )}
      <div className="min-h-0">
        <GlobalTable<AttendanceLogRow>
          data={detailedLogs}
          columns={columns}
          totalCount={detailedLogs.length}
          currentPage={1}
          pageSize={detailedLogs.length || 10}
          onPaginationChange={() => {}}
          isPaginationEnabled={false}
          scrollY="480px"
          onRowClick={(row) => {
            if (!isFutureDate(row.rawDateStr)) {
              onRowClick(row.rawDateStr);
            }
          }}
          getRowClassName={(row) =>
            isFutureDate(row.rawDateStr)
              ? "cursor-not-allowed opacity-80 hover:bg-transparent"
              : "cursor-pointer hover:bg-muted/10"
          }
        />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Apply Attendance Regularization</DialogTitle>
            <DialogDescription>
              Submit a regularization request for{" "}
              <span className="font-semibold text-foreground">
                {detailedLogs.find((log) => log.rawDateStr === selectedRegDate)
                  ?.date || selectedRegDate}
              </span>{" "}
              (working hours below 8:15).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {!isRegularizingForAnotherEmployee && (
              <div className="space-y-2 flex flex-col">
                <Label className="text-sm font-semibold flex items-center gap-1 mb-1">
                  Compensatory Date
                  <span className="text-rose-500">*</span>
                </Label>
                {isLoadingHighWorkingHours ? (
                  <div className="flex flex-col items-center justify-center h-10 border border-dashed rounded-md bg-muted/20">
                    <span className="text-xs text-muted-foreground animate-pulse">
                      Loading available dates...
                    </span>
                  </div>
                ) : (
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal border-border/80 ${
                          !compensatoryDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        {compensatoryDate ? (
                          getDisplayCompensatoryDate(compensatoryDate)
                        ) : (
                          <span>Select compensatory date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          compensatoryDate
                            ? new Date(compensatoryDate)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            setCompensatoryDate(formatToYYYYMMDD(date));
                          } else {
                            setCompensatoryDate("");
                          }
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) => {
                          const dateStr = formatToYYYYMMDD(date);
                          const isDisabled = !highWorkingHoursDates.includes(dateStr);
                          console.log("AttendanceTable Calendar Date:", dateStr, "isDisabled:", isDisabled, "highWorkingHoursDates:", highWorkingHoursDates);
                          return isDisabled;
                        }}
                        month={currentCalendarMonth}
                        onMonthChange={setCurrentCalendarMonth}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label
                htmlFor="reason"
                className="text-sm font-semibold flex items-center gap-1"
              >
                Reason
                <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Forgot to clock in due to an early client meeting"
                required
                rows={3}
              />
            </div>
            <DialogFooter className="pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color:
      "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    icon: <Clock className="h-3 w-3" />,
  },
  approved: {
    label: "Approved",
    color:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  rejected: {
    label: "Rejected",
    color:
      "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
    icon: <XCircle className="h-3 w-3" />,
  },
};

export const RegularizationRequestsPanel: React.FC<{
  employeeId: number;
  statusFilter: "" | "pending" | "approved" | "rejected";
}> = ({ employeeId, statusFilter }) => {
  const user = useAuthStore((state) => state.user);
  const loggedInUserId = Number(user?.user?.id || user?.user_id);

  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();
  const isAdmin = roleName === roles.ADMIN;
  const isPM = roleName === roles.PROJECT_MANAGER;
  const canFilterEmployees = isAdmin || isPM;

  const [currentStatusFilter, setCurrentStatusFilter] = useState<
    "" | "pending" | "approved" | "rejected"
  >(statusFilter);
  const [currentEmployeeFilter, setCurrentEmployeeFilter] = useState<number | null>(
    canFilterEmployees
      ? (employeeId && employeeId !== loggedInUserId ? employeeId : null)
      : (employeeId || null)
  );

  useEffect(() => {
    if (canFilterEmployees) {
      setCurrentEmployeeFilter(employeeId && employeeId !== loggedInUserId ? employeeId : null);
    } else {
      setCurrentEmployeeFilter(employeeId || null);
    }
  }, [employeeId, canFilterEmployees, loggedInUserId]);

  useEffect(() => {
    setCurrentStatusFilter(statusFilter);
  }, [statusFilter]);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const params: Record<string, any> = {};
  if (currentEmployeeFilter) params.employeeId = currentEmployeeFilter;
  if (currentStatusFilter) params.status = currentStatusFilter;

  const {
    data: regularizationData,
    isPending: isLoadingList,
    refetch,
  } = useGetRegularizationRequests(params, true);

  const { data: employeeDropdownData, isPending: isLoadingEmployees } =
    useGetUserDropdownList({ status: "active" });

  const employeeOptions = useMemo(
    () =>
      ((employeeDropdownData as any)?.data || []).map((emp: any) => ({
        value: String(emp.employee?.id || emp.employeeId || emp.id),
        label: emp.fullName,
      })),
    [employeeDropdownData]
  );

  const requests: any[] = (regularizationData as any)?.data || [];
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const { mutate: performAction, isPending: isActioning } =
    useRegularizationAction(() => {
      refetch();
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedRejectId(null);
    });

  const handleApprove = (id: number) => {
    performAction({ id, status: "approved" });
  };

  const handleOpenReject = (id: number) => {
    setSelectedRejectId(id);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedRejectId) return;
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason.");
      return;
    }
    performAction({
      id: selectedRejectId,
      status: "rejected",
      rejectionReason: rejectionReason.trim(),
    });
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const parts = dateStr.split("-");
      if (parts.length < 3) return dateStr;
      return format(
        new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])),
        "dd MMM yyyy"
      );
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-foreground">
              Regularization Requests
            </span>
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold bg-amber-500 text-white rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <SimpleDropDownSearchable
              options={[
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
              value={currentStatusFilter || undefined}
              placeholder="Filter by status"
              className="w-full sm:w-[160px]"
              onChange={(value) =>
                setCurrentStatusFilter((value as any) || "")
              }
              allowClear
            />

            {/* Employee Filter (Admin/PM only) */}
            {canFilterEmployees && (
              <SimpleDropDownSearchable
                options={employeeOptions}
                value={currentEmployeeFilter ? String(currentEmployeeFilter) : undefined}
                placeholder="Filter by employee"
                className="w-full sm:w-[220px]"
                isLoading={isLoadingEmployees}
                onChange={(value) =>
                  setCurrentEmployeeFilter(value ? Number(value) : null)
                }
                allowClear
              />
            )}
          </div>
        </div>

        {isLoadingList ? (
          <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading requests...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-muted border-b border-border text-muted-foreground text-xs font-bold">
                  {canFilterEmployees && (
                    <th className="px-4 py-2.5 bg-muted">Employee</th>
                  )}
                  <th className="px-4 py-2.5 bg-muted">Reg. Date</th>
                  <th className="px-4 py-2.5 bg-muted">Comp. Date</th>
                  <th className="px-4 py-2.5 bg-muted">Working Time</th>
                  <th className="px-4 py-2.5 bg-muted">Prev. Status</th>
                  <th className="px-4 py-2.5 bg-muted">Reason</th>
                  <th className="px-4 py-2.5 bg-muted">Status</th>
                  <th className="px-4 py-2.5 bg-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-foreground">
                {requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canFilterEmployees ? 8 : 7}
                      className="text-center py-10 text-muted-foreground text-xs font-medium"
                    >
                      <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2 opacity-60" />
                      {currentStatusFilter === "pending"
                        ? "All caught up! No pending requests."
                        : "No regularization requests found for the selected filters."}
                    </td>
                  </tr>
                ) : (
                  requests.map((req: any) => {
                    const cfg = statusConfig[req.status] || statusConfig["pending"];
                    const employeeName = req.employee?.fullName || req.requestedByUser?.fullName || req.user?.name || req.user?.fullName || "-";
                  return (
                    <tr key={req.id} className="hover:bg-muted/10 transition-colors">
                      {canFilterEmployees && (
                        <td className="px-4 py-2.5 font-bold text-foreground">
                          {employeeName}
                        </td>
                      )}
                      <td className="px-4 py-2.5 font-semibold text-muted-foreground whitespace-nowrap">
                        {formatDisplayDate(req.regularizationDate)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {formatDisplayDate(req.compensatoryDate)}
                      </td>
                      <td className="px-4 py-2.5 font-medium">
                        {req.workingTime || "-"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-muted-foreground">
                          {req.previousStatus || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 max-w-[200px]">
                        <p
                          className="truncate text-muted-foreground"
                          title={req.reason}
                        >
                          {req.reason || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge
                          className={`flex items-center gap-1 w-fit text-[10px] font-semibold rounded-md px-2 py-0.5 ${cfg.color}`}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </Badge>
                        {req.status === "rejected" && req.rejectionReason && (
                          <p
                            className="text-[10px] text-rose-500 mt-0.5 max-w-[140px] truncate"
                            title={req.rejectionReason}
                          >
                            {req.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {req.status === "pending" && loggedInUserId === 4 ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] gap-1 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                              disabled={isActioning}
                              onClick={() => handleApprove(req.id)}
                            >
                              {isActioning ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] gap-1 border-rose-500/40 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                              disabled={isActioning}
                              onClick={() => handleOpenReject(req.id)}
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground mr-4">-</span>
                        )}
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject reason dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Reject Regularization Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label
              htmlFor="rejection-reason"
              className="text-sm font-semibold flex items-center gap-1"
            >
              Rejection Reason <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
            />
          </div>
          <DialogFooter className="pt-4 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={isActioning}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isActioning || !rejectionReason.trim()}
              onClick={handleConfirmReject}
            >
              {isActioning ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" /> Rejecting...
                </>
              ) : (
                "Confirm Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

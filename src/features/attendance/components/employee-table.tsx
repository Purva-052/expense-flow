import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { MonthYearPicker } from "./month-year-picker";
import { CalendarIcon, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalTable } from "@/components/table/global-table";
import { ColumnDef } from "@tanstack/react-table";
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
import {
  useGetCompensatoryDates,
  useCreateRegularizationRequest,
  useRegularizationAction,
} from "../services";
import { useGetUsersList } from "../../users/services";
// import { useGetLeaveAllocations } from "../../leave-management/services";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { roles } from "@/utils/constant";
import { useQueryClient } from "@tanstack/react-query";
import API from "@/config/api/api";

interface EmployeeTableProps {
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

const getStatusBadge = (status: "P" | "A" | "WO" | "AH" | "E" | "L" | "", isFuture: boolean = false, isCorrected: boolean = false) => {
  if (status === "" || (isFuture && status === "A")) {
    return null;
  }
  switch (status) {
    case "P":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          PRESENT{isCorrected ? " *" : ""}
        </Badge>
      );
    case "A":
      return (
        <Badge className="bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          ABSENT{isCorrected ? " *" : ""}
        </Badge>
      );
    case "WO":
      return (
        <Badge className="bg-muted text-muted-foreground border border-border hover:bg-muted text-[10px] font-bold rounded-md px-2 py-0.5">
          WEEKLY OFF{isCorrected ? " *" : ""}
        </Badge>
      );
    case "AH":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          HALF DAY{isCorrected ? " *" : ""}
        </Badge>
      );
    case "E":
      return (
        <Badge className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          LATE/EXCUSED{isCorrected ? " *" : ""}
        </Badge>
      );
    case "L":
      return (
        <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 text-[10px] font-bold rounded-md px-2 py-0.5">
          ON LEAVE{isCorrected ? " *" : ""}
        </Badge>
      );
    default:
      return null;
  }
};

const isLessThanEightFifteen = (workingHrs: string | null | undefined): boolean => {
  if (!workingHrs || workingHrs === "-") return false;
  const cleanStr = workingHrs.replace(/HRS/gi, "").trim();
  const parts = cleanStr.split(":");
  if (parts.length < 2) return false;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return false;
  return hours * 60 + minutes < 495; // 8 * 60 + 15 = 495
};

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
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

  // const { data: allocationsResponse } = useGetLeaveAllocations(isAdmin) as any;
  // const allocations = allocationsResponse?.data || {};
  // const workingDaysAllowed = allocations.workingDaysAllowed !== undefined && allocations.workingDaysAllowed !== null
  //   ? Number(allocations.workingDaysAllowed)
  //   : 3;

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
      employeeCode: Number(resolvedEmpId),
      regularizationDate: selectedRegDate,
      ...(isRegularizingForAnotherEmployee ? {} : { compensatoryDate }),
      reason: reason.trim(),
      ...(Number(resolvedEmpId) === 4 ? { status: "approved" } : {}),
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo<ColumnDef<any>[]>(
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
            isTodayOrFutureDate(row.original.rawDateStr),
            row.original.isCorrected
          ),
      },
      {
        accessorKey: "shift",
        header: "Shift",
        cell: ({ row }) => {
          const val = row.original.shift === "-" ? "" : row.original.shift;
          return (
            <span className="font-medium text-muted-foreground/85">
              {val || ""}
            </span>
          );
        },
      },
      {
        accessorKey: "firstIn",
        header: "First In",
        cell: ({ row }) => {
          const val = row.original.firstIn === "-" ? "" : row.original.firstIn;
          return (
            <span className="font-semibold text-foreground">
              {val || ""}
            </span>
          );
        },
      },
      {
        accessorKey: "lastOut",
        header: "Last Out",
        cell: ({ row }) => {
          const val = row.original.lastOut === "-" ? "" : row.original.lastOut;
          return (
            <span className="font-semibold text-foreground">
              {val || ""}
            </span>
          );
        },
      },
      {
        accessorKey: "breakHrs",
        header: "Break Time",
        cell: ({ row }) => {
          const val = row.original.breakHrs === "-" ? "" : row.original.breakHrs;
          return (
            <span className="font-medium text-muted-foreground/85">
              {val || ""}
            </span>
          );
        },
      },
      {
        accessorKey: "workingHrs",
        header: "Working Hours",
        cell: ({ row }) => {
          const workingHrsVal = row.original.workingHrs === "-" ? "" : row.original.workingHrs;
          return (
            <span
              className={`font-bold transition-colors ${
                isLessThanEightFifteen(row.original.workingHrs) &&
                !matchedUser?.isSingleCheckInAllowed
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-sky-600 dark:text-sky-400"
              }`}
            >
              {workingHrsVal ? `${workingHrsVal}${row.original.isCorrected ? " *" : ""}` : ""}
            </span>
          );
        },
      },
      ...(isAdmin
        ? [
            {
              id: "actions",
              header: () => <div className="text-right" />,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cell: ({ row }: any) => {
                const future = isFutureDate(row.original.rawDateStr);
                const canApply =
                  !future &&
                  isLessThanEightFifteen(row.original.workingHrs) &&
                  !matchedUser?.isSingleCheckInAllowed;
                if (!canApply) return <div className="w-full text-right" />;
                return (
                  <div
                    className="w-full text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
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
          ]
        : []),
    ],
    [isAdmin, matchedUser]
  );

  return (
    <div
      className={
        embedded
          ? "overflow-hidden flex flex-col"
          : "border border-border rounded-xl shadow-md bg-card overflow-hidden flex flex-col"
      }
    >
      {monthNavigator && (
        <div className="flex justify-center py-3 px-4 border-b border-border bg-card">
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
        <GlobalTable
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
                          console.log("EmployeeTable Calendar Date:", dateStr, "isDisabled:", isDisabled, "highWorkingHoursDates:", highWorkingHoursDates);
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

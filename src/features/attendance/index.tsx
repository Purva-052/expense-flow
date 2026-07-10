import React from "react";
import PageLayout from "@/components/layout/layout-provider";
import TablePageHeader from "@/components/table/table-page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { ClipboardList, Clock, Users, ClockAlert } from "lucide-react";
import { MyAttendance } from "./components/my-attendance";
import { EmployeeAttendance } from "./components/employee-attendance";
import { RegularizationRequestsPanel } from "./components/attendance-table";
import { LateInLeaveDeductions } from "./components/late-in-deductions";
import { MissingHoursDeductions } from "./components/missing-hours-deductions";
import { Card } from "@/components/ui/card";
import { useGetRegularizationRequests } from "./services";
import useFetchData from "@/hooks/use-fetch-data";
import API from "@/config/api/api";

const tabTriggerClass =
  "flex items-center gap-2 rounded-[50px] !px-3 !py-2 transition-all h-[35px] " +
  "text-foreground/70 hover:text-foreground " +
  "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm " +
  "dark:text-muted-foreground dark:hover:text-foreground " +
  "dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white dark:data-[state=active]:shadow-[0_2px_8px_oklch(0_0_0/0.5)]";

const AttendancePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const rawRole = user?.role || user?.user?.role;
  const roleName = String(
    rawRole && typeof rawRole === "object" ? rawRole?.name : rawRole || ""
  ).toLowerCase();

  const isAdmin = roleName === roles.ADMIN;
  const isTeamLead = roleName === roles.TEAM_LEAD;
  const canViewAllRegularizations =
    isAdmin || roleName === roles.PROJECT_MANAGER;

  const { data: pendingRegularizationData } = useGetRegularizationRequests(
    {
      ...(canViewAllRegularizations
        ? {}
        : { employeeId: Number(user?.user?.id || user?.user_id) }),
      page: 1,
      limit: 10,
    },
    true
  );

  const pendingRegularizationCount =
    (pendingRegularizationData as any)?.data?.metadata?.totalCount ??
    (pendingRegularizationData as any)?.metadata?.totalCount ??
    ((pendingRegularizationData as any)?.data?.data || (pendingRegularizationData as any)?.data || []).length;

  const { data: missingHoursData } = useFetchData({
    url: API.attendance.eligible_dates,
    params: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
    enabled: isAdmin,
  });

  const missingHoursCount =
    (missingHoursData as any)?.data?.metadata?.totalCount ??
    (missingHoursData as any)?.metadata?.totalCount ??
    ((missingHoursData as any)?.data?.data || (missingHoursData as any)?.data || []).length;

  return (
    <PageLayout>
      <div className="flex flex-col gap-4">
        {isAdmin ? (
          <TablePageHeader title="Attendance Management" showActionButton={false}>
            Track employee work hours, shifts, breaks, and punches.
          </TablePageHeader>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <TablePageHeader title="Attendance Management" showActionButton={false}>
              Track employee work hours, shifts, breaks, and punches.
            </TablePageHeader>
            <div
              id="attendance-filters-slot"
              className="flex items-center gap-2 shrink-0 sm:pt-1"
            />
          </div>
        )}

        {isAdmin ? (
          <Tabs defaultValue="my-attendance" className="w-full gap-2">
            <div className="flex flex-col xl:flex-row xl:items-center gap-3 w-full">
              <div className="flex-1 min-w-0 overflow-x-auto pb-1 -mb-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border border-rose-100/50 h-9 w-max shrink-0 inline-flex flex-nowrap">
                <TabsTrigger value="my-attendance" className={tabTriggerClass}>
                  <Clock className="h-4 w-4" />
                  Team Attendance
                </TabsTrigger>
                <TabsTrigger value="employee-attendance" className={tabTriggerClass}>
                  <Users className="h-4 w-4" />
                  Monthly Attendance
                </TabsTrigger>
                <TabsTrigger value="regularization" className={tabTriggerClass}>
                  <ClipboardList className="h-4 w-4" />
                  {`Regularization (${pendingRegularizationCount})`}
                </TabsTrigger>
                <TabsTrigger value="late-in-deductions" className={tabTriggerClass}>
                  <ClockAlert className="h-4 w-4" />
                  Late In Deductions
                </TabsTrigger>
                <TabsTrigger value="missing-hours" className={tabTriggerClass}>
                  <ClockAlert className="h-4 w-4" />
                  {`Incomplete Hours (${missingHoursCount})`}
                </TabsTrigger>
              </TabsList>
              </div>
              <div
                id="attendance-filters-slot-admin"
                className="flex items-center gap-2 shrink-0"
              />
            </div>

            <TabsContent
              value="my-attendance"
              className="mt-2 focus-visible:outline-none flex-none"
            >
              <MyAttendance filtersPortalId="attendance-filters-slot-admin" />
            </TabsContent>

            <TabsContent
              value="employee-attendance"
              className="mt-2 focus-visible:outline-none flex-none"
            >
              <EmployeeAttendance />
            </TabsContent>

            <TabsContent
              value="regularization"
              className="mt-2 focus-visible:outline-none flex-none"
            >
              <Card className="w-full overflow-hidden border border-border shadow-sm">
                <RegularizationRequestsPanel
                  employeeId={Number(user?.user?.id || user?.user_id)}
                  statusFilter=""
                />
              </Card>
            </TabsContent>

            <TabsContent
              value="late-in-deductions"
              className="mt-2 focus-visible:outline-none flex-none"
            >
              <Card className="w-full overflow-hidden border border-border shadow-sm">
                <LateInLeaveDeductions />
              </Card>
            </TabsContent>

            <TabsContent
              value="missing-hours"
              className="mt-2 focus-visible:outline-none flex-none"
            >
              <Card className="w-full overflow-hidden border border-border shadow-sm">
                <MissingHoursDeductions />
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="my-attendance" className="w-full gap-2">
            <div className="flex flex-col xl:flex-row xl:items-center gap-3 w-full">
              <div className="flex-1 min-w-0 overflow-x-auto pb-1 -mb-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border border-rose-100/50 h-9 w-max shrink-0 inline-flex flex-nowrap">
                <TabsTrigger value="my-attendance" className={tabTriggerClass}>
                  <Clock className="h-4 w-4" />
                  My Attendance
                </TabsTrigger>
                {isTeamLead && (
                  <TabsTrigger value="employee-attendance" className={tabTriggerClass}>
                    <Users className="h-4 w-4" />
                    Monthly Attendance
                  </TabsTrigger>
                )}
                <TabsTrigger value="regularization" className={tabTriggerClass}>
                  <ClipboardList className="h-4 w-4" />
                  {`Regularization (${pendingRegularizationCount})`}
                </TabsTrigger>
              </TabsList>
              </div>
            </div>

            <TabsContent
              value="my-attendance"
              className="mt-2 focus-visible:outline-none flex-none"
            >
              <MyAttendance filtersPortalId="attendance-filters-slot" />
            </TabsContent>

            <TabsContent
              value="regularization"
              className="mt-2 focus-visible:outline-none flex-none"
            >
              <Card className="w-full overflow-hidden border border-border shadow-sm">
                <RegularizationRequestsPanel employeeId={Number(user?.user?.id || user?.user_id)} statusFilter="" />
              </Card>
            </TabsContent>

            {isTeamLead && (
              <TabsContent
                value="employee-attendance"
                className="mt-2 focus-visible:outline-none flex-none"
              >
                <EmployeeAttendance />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </PageLayout>
  );
};

export default AttendancePage;

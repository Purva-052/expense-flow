import React from "react";
import PageLayout from "@/components/layout/layout-provider";
import TablePageHeader from "@/components/table/table-page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { Clock, Users } from "lucide-react";
import { MyAttendance } from "./components/my-attendance";
import { EmployeeAttendance } from "./components/employee-attendance";

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
            <div className="flex flex-wrap items-center gap-3 w-full">
              <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border border-rose-100/50 h-9 w-fit shrink-0">
                <TabsTrigger value="my-attendance" className={tabTriggerClass}>
                  <Clock className="h-4 w-4" />
                  Team Attendance
                </TabsTrigger>
                <TabsTrigger value="employee-attendance" className={tabTriggerClass}>
                  <Users className="h-4 w-4" />
                  Monthly Attendance
                </TabsTrigger>
              </TabsList>
              <div
                id="attendance-filters-slot-admin"
                className="flex items-center gap-2 sm:ml-auto shrink-0"
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
          </Tabs>
        ) : (
          <MyAttendance filtersPortalId="attendance-filters-slot" />
        )}
      </div>
    </PageLayout>
  );
};

export default AttendancePage;

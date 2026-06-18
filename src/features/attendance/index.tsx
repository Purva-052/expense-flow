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
        <TablePageHeader title="Attendance Management" showActionButton={false}>
          Track employee work hours, shifts, breaks, and punches.
        </TablePageHeader>

        {isAdmin ? (
          <Tabs defaultValue="my-attendance" className="w-full gap-4">
            <TabsList className="bg-[#fdebef] rounded-full dark:bg-muted dark:border-white/10 border border-rose-100/50 h-9 w-fit shrink-0">
              <TabsTrigger value="my-attendance" className={tabTriggerClass}>
                <Clock className="h-4 w-4" />
                My Attendance
              </TabsTrigger>
              <TabsTrigger value="employee-attendance" className={tabTriggerClass}>
                <Users className="h-4 w-4" />
                Employee Attendance
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="my-attendance"
              className="mt-4 focus-visible:outline-none"
            >
              <MyAttendance />
            </TabsContent>

            <TabsContent
              value="employee-attendance"
              className="mt-4 focus-visible:outline-none"
            >
              <EmployeeAttendance />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mt-2">
            <MyAttendance />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AttendancePage;

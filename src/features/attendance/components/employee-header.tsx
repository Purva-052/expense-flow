import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import { ArrowLeft, Network, Mail } from "lucide-react";

interface EmployeeHeaderProps {
  onBackClick: () => void;
  allEmployees: { employeeName: string; employeeCode: string }[];
  activeEmployeeCode: string | undefined;
  isLoadingEmployees: boolean;
  onEmployeeSelect: (code: string) => void;
  resolvedProfilePic: string;
  employeeName: string;
  employeeAvatarFallback: string;
  employeeCode: string;
  employeeRole: string;
  employeeEmail: string;
  onOrgChartClick: () => void;
}

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
  onBackClick,
  allEmployees,
  activeEmployeeCode,
  isLoadingEmployees,
  onEmployeeSelect,
  resolvedProfilePic,
  employeeName,
  employeeAvatarFallback,
  employeeCode,
  employeeRole,
  employeeEmail,
  onOrgChartClick,
}) => {
  return (
    <>
      {/* Back navigation & header section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={onBackClick}
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employee Attendance
        </Button>

        {/* Dropdown Employee Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Employee:
          </span>
          <SimpleDropDownSearchable
            options={allEmployees.map((emp) => ({
              label:
                emp.employeeName ||
                (emp as any).fullName ||
                `${(emp as any).firstName || ""} ${(emp as any).lastName || ""}`.trim() ||
                String(emp.employeeCode),
              value: emp.employeeCode,
            }))}
            value={activeEmployeeCode}
            placeholder="Filter by employee"
            className="w-[220px]"
            isLoading={isLoadingEmployees}
            loadingText="Loading employees..."
            onChange={(val) => onEmployeeSelect(val || "")}
            allowClear={true}
          />
        </div>
      </div>

      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-card p-6 border border-border shadow-lg relative overflow-hidden text-card-foreground">
        <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 z-10">
          <Avatar className="h-16 w-16 text-xl border-2 border-border">
            <AvatarImage src={resolvedProfilePic} alt={employeeName} />
            <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-extrabold text-lg">
              {employeeAvatarFallback}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              {employeeName}
              <span className="text-[10px] px-2 py-0.5 bg-muted border border-border text-muted-foreground rounded font-semibold">
                {employeeCode}
              </span>
            </h2>
            <p className="text-sm text-muted-foreground font-medium mt-0.5">
              {employeeRole}
            </p>
          </div>
        </div>

        {/* User Links / Contacts Info */}
        <div className="flex flex-col sm:flex-row items-center gap-6 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={onOrgChartClick}
            className="border-border bg-background hover:bg-muted text-foreground text-xs gap-1.5 rounded-full"
          >
            <Network className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
            <span>Org Chart</span>
          </Button>

          <a
            href={`mailto:${employeeEmail}`}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            <span>{employeeEmail}</span>
          </a>
        </div>
      </div>
    </>
  );
};

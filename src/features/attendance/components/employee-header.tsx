import React from "react";
import { Button } from "@/components/ui/button";
import SimpleDropDownSearchable from "@/components/shared/custome-simple-dropdown";
import { ArrowLeft } from "lucide-react";

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
  employeeName,
}) => {
  return (
    <>
      {/* Back navigation & header section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <Button
            variant="ghost"
            onClick={onBackClick}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs h-auto p-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employee Attendance
          </Button>
          <span className="select-none">-</span>
          <span className="text-foreground font-bold p-1">{employeeName}</span>
        </div>

        {/* Dropdown Employee Filter */}
        <div className="flex items-center gap-3">
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

          {/* <Button
            variant="outline"
            size="sm"
            onClick={onOrgChartClick}
            className="h-9 border-border bg-background hover:bg-muted text-foreground text-xs gap-1.5 rounded-full px-4"
          >
            <Network className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
            <span>Org Chart</span>
          </Button> */} 
        </div>
      </div>
    </>
  );
};

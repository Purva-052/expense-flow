import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Briefcase,
  Calendar,
  Clock,
  Flag,
  TrendingUp,
  // User,
  Loader2,
  FileText,
  Code,
  Activity,
  Users,
  Building,
} from "lucide-react";
import { useGetProjectsDetailData } from "@/features/projects/services";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeveloperDialog } from "../developer-dialog";
import { useAuthStore } from "@/stores/use-auth-store";
// import { getYearsOfExperience } from "../developer-chip";

export const formatExperience = (
  startDate: string | null | undefined
): string | null => {
  if (!startDate) return null;

  const start = new Date(startDate);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  // Adjust if current date is before start day
  if (
    now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())
  ) {
    years--;
    months += 12;
  }

  if (months < 0) months += 12;

  // 🔹 Less than 1 year → show only months
  if (years < 1) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  }

  // 🔹 1 year or more → show years + months
  const yearLabel = `${years} Year${years !== 1 ? "s" : ""}`;

  if (months === 0) {
    return yearLabel;
  }

  const monthLabel = `${months} month${months !== 1 ? "s" : ""}`;
  return `${yearLabel} ${monthLabel}`;
};

const priorityColorMap: any = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const statusColorMap: any = {
  "active-discovery": "bg-blue-100 text-blue-700",
  running: "bg-green-100 text-green-700",
  slow: "bg-amber-100 text-amber-700",
  stop: "bg-red-100 text-red-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const OverviewProject = ({ projectId }: { projectId?: any }) => {
  const {
    data: projectDetailsResponse,
    isLoading,
    refetch: refetchProjectDetails,
  } = useGetProjectsDetailData(projectId?.toString());

  const { user } = useAuthStore();
  const userRole = String(
    user?.user?.role?.name || user?.user?.role || ""
  ).toLowerCase();
  const isDeveloperView = userRole === "developer";
  const currentUserId = user?.user?.id;

  const [selectedDeveloper, setSelectedDeveloper] = useState<any>(null);
  const [isDeveloperDialogOpen, setIsDeveloperDialogOpen] = useState(false);

  const handleDeveloperClick = (allocation: any) => {
    // Prevent developers from opening other developers' dialogs
    if (isDeveloperView && allocation?.developer?.id !== currentUserId) {
      return;
    }
    setSelectedDeveloper(allocation);
    setIsDeveloperDialogOpen(true);
  };
  // console.log(
  //   "allocation.developer?.profilePic: ",
  //   allocation.developer?.profilePic
  // );

  const project = (projectDetailsResponse as any)?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center p-12 text-muted-foreground">
        No project details found.
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Building size={16} />
                <h3 className="ml-2">Client Name</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <p>{project.client?.name || "-"}</p>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Briefcase size={16} />
                <h3 className="ml-2">Project Type</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <p>{project.projectType?.name || "-"}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] uppercase tracking-wider font-medium text-gray-400">
                Project Coordinator
              </p>

              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={project.projectHandler?.profilePicUrl} />
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-[11px] font-semibold">
                    {project.projectHandler?.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <span className="text-base text-gray-800">
                  {project.projectHandler?.fullName || "—"}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Activity size={16} />
                <h3 className="ml-2">Current Status</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-semibold rounded-full capitalize",
                    statusColorMap[project.currentStatus?.toLowerCase()] ||
                      "bg-gray-100 text-gray-700"
                  )}
                >
                  {project.currentStatus?.replace(/-/g, " ") || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Flag size={16} />
                <h3 className="ml-2">Priority</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-semibold rounded-full capitalize",
                    priorityColorMap[project.priority?.toLowerCase()] ||
                      "bg-gray-100 text-gray-800"
                  )}
                >
                  {project.priority || "low"}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Calendar size={16} />
                <h3 className="ml-2">Start Date</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <p>
                  {project.startDate
                    ? format(new Date(project.startDate), "yyyy-MM-dd")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Clock size={16} />
                <h3 className="ml-2">Expected Completion</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <p>
                  {project.expectedCompletionDate
                    ? format(
                        new Date(project.expectedCompletionDate),
                        "yyyy-MM-dd"
                      )
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Clock size={16} />
                <h3 className="ml-2">Total Hours</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <p>{project.projectMilestoneTotalEstimateHours || "0.00"}</p>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Code size={16} />
                <h3 className="ml-2">Technologies</h3>
              </div>
              <div className="text-base text-gray-800 pl-6">
                <div className="flex flex-wrap gap-2">
                  {project.technologies?.length > 0 ? (
                    project.technologies.map((tech: any) => (
                      <span
                        key={tech.id}
                        className="px-2.5 py-1 text-xs font-medium rounded-md text-white border"
                        style={{
                          backgroundColor: tech.color || "#94a3b8",
                          borderColor: tech.color || "#94a3b8",
                        }}
                      >
                        {tech.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No technologies listed.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-500 flex items-center">
                  <TrendingUp size={16} className="mr-2" />
                  Progress
                </h3>
                <p className="text-sm font-semibold text-gray-600">
                  {project.percentageComplete}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gray-800 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${project.percentageComplete}%` }}
                ></div>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <div className="flex flex-col">
                <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                  <FileText size={16} />
                  <h3 className="ml-2">Description</h3>
                </div>
                <div className="text-base text-gray-800 pl-6">
                  <p className="whitespace-pre-wrap break-words text-gray-700">
                    {project.description || "No description available."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-0">
        <div className="p-4">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-4 border-b pb-2">
            <Users size={16} />
            <h3 className="ml-2 text-lg font-bold text-gray-900">
              Assigned Developers
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.developerAllocations?.length > 0 ? (
              project.developerAllocations.map((allocation: any) => {
                const isWorkingOnCurrentProject =
                  Number(allocation.developer?.currentWorkingProjectId) ===
                  Number(projectId);
                const canClickDeveloper =
                  !isDeveloperView ||
                  allocation?.developer?.id === currentUserId;
                const cursorClass = canClickDeveloper
                  ? "cursor-pointer"
                  : "cursor-not-allowed";

                return (
                  <div
                    key={allocation.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow",
                      cursorClass
                    )}
                    onClick={() => handleDeveloperClick(allocation)}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={allocation.developer.profilePicUrl} />
                        <AvatarFallback
                          className="text-white font-bold"
                          style={{
                            backgroundColor:
                              allocation.developer?.technology?.color ||
                              "#94a3b8",
                          }}
                        >
                          {allocation.developer?.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isWorkingOnCurrentProject && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"
                                aria-label="Working on current project"
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              side="bottom"
                              className="text-[10px]"
                            >
                              Working on current project
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {allocation.developer?.fullName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Exp:{" "}
                        {formatExperience(
                          allocation.developer?.careerStartDate
                        )}{" "}
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="mt-1">
                              <span
                                className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase truncate max-w-full"
                                style={{
                                  backgroundColor:
                                    (allocation.developer?.technology?.color ||
                                      "#94a3b8") + "20",
                                  color:
                                    allocation.developer?.technology?.color ||
                                    "#94a3b8",
                                  border: `1px solid ${
                                    allocation.developer?.technology?.color ||
                                    "#94a3b8"
                                  }40`,
                                }}
                              >
                                {allocation.developer?.technology?.name ||
                                  "Developer"}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {allocation.developer?.technology?.name}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                No developers assigned to this project.
              </div>
            )}
          </div>
        </div>
      </Card>

      <DeveloperDialog
        developer={selectedDeveloper}
        projectId={projectId?.toString()}
        open={isDeveloperDialogOpen}
        onOpenChange={setIsDeveloperDialogOpen}
        afterChange={() => refetchProjectDetails()}
        refetchAvailableDevelopers={() => {}}
      />
    </div>
  );
};

export default OverviewProject;

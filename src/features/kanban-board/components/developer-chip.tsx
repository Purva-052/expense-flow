/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/developer-chip.tsx
import { useSortable } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // 👈 1. Import Tooltip components
import { Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getDaysRemaining = (
  endDate: string | null | undefined
): number | null => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();

  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  if (Number.isNaN(end.getTime())) return null;
  if (end < now) return null;

  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const truncateName = (name: string, maxLength: number = 8): string => {
  if (!name) return "";
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + "...";
};

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

  if (months === 12) {
    years += 1;
    months = 0;
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

export function DeveloperChip({
  developer,
  containerId,
  onClick,
  disabled,
  endDate,
  variant = "default",
}: {
  developer: any;
  containerId: string;
  onClick?: () => void;
  disabled?: boolean;
  endDate?: string | null;
  variant?: "default" | "compact" | "avatar";
}) {
  const profilePic = developer.profilePicUrl || developer.avatarUrl;

  const sortableId = `${containerId}-${developer.id}`;

  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: sortableId,
    data: { containerId, developer },
    disabled,
  });

  const endingAllocations = Array.isArray(developer?.endingAllocations)
    ? developer.endingAllocations
    : [];
  const apiDaysRemainingValues = endingAllocations
    .map((allocation: any) => allocation?.daysRemaining)
    .filter((days: any) => typeof days === "number" && days >= 0);
  const daysRemaining =
    apiDaysRemainingValues.length > 0
      ? Math.min(...apiDaysRemainingValues)
      : getDaysRemaining(endDate);
  const showReleaseWarning = daysRemaining !== null && daysRemaining <= 5;

  const getReleaseText = (): React.ReactNode => {
    if (daysRemaining === 1) return <strong>1</strong>;
    return <strong>{daysRemaining}</strong>;
  };

  const techColor = developer?.technology?.color || "#e2e8f0";
  const experience = formatExperience(developer?.careerStartDate);

  const activeProjects: string[] = developer?.activeProjects || [];

  if (variant === "avatar") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              ref={setNodeRef}
              {...attributes}
              {...listeners}
              onClick={onClick}
              className={cn(
                "relative transition-all duration-200",
                onClick && "cursor-pointer",
                !disabled && "cursor-grab",
                isDragging && "opacity-50 scale-110 z-50"
              )}
            >
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm hover:scale-110 transition-transform">
                <AvatarImage
                  src={
                    profilePic ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${developer.fullName}`
                  }
                  alt={developer.fullName}
                />
                <AvatarFallback>{developer.fullName?.charAt(0)}</AvatarFallback>
              </Avatar>
              {developer.isCurrentProject && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold text-sm">{developer.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {developer?.technology?.name}
              </p>
              {activeProjects.length > 0 && (
                <div className="pt-1 border-t mt-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Assigned To:
                  </p>
                  <ul className="text-[10px] text-muted-foreground">
                    {activeProjects.map((p: any) => (
                      <li key={p.id}>{p.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    // 👇 2. Wrap the component with TooltipProvider for context
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={cn(
              "max-w-[250px] bg-card flex flex-col gap-2 rounded-lg border p-3 text-sm shadow-sm outline-none transition-all duration-200",
              variant === "default" && "bg-secondary/50",
              onClick && "cursor-pointer hover:shadow-md",
              !disabled && "cursor-grab",
              isDragging && "ring-2 opacity-50 ring-offset-2",
              isDragging && { ringColor: techColor }
            )}
          >
            <div className="flex items-start gap-3 justify-between">
              <div className="flex items-center gap-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      profilePic ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${developer.fullName}`
                    }
                    alt={developer.fullName}
                  />
                  <AvatarFallback className="text-xs">
                    {developer.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1 min-w-0">
                    {developer.isCurrentProject && (
                      <span
                        className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shrink-0"
                        title="Currently working on this project"
                      />
                    )}
                    {/* 👇 3. Wrap the developer's name with the Tooltip components */}
                    <span className="truncate font-bold text-card-foreground min-w-0">
                      {truncateName(developer.fullName, 10)}
                    </span>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {/* <Info
                            className="h-4 w-4 cursor-pointer text-muted-foreground"
                            onClick={handleViewTimeline} */}
                          {showReleaseWarning && (
                            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-sm font-semibold animate-pulse shrink-0">
                              <Clock className="h-4 w-4" />
                              {/* <span>{getReleaseText()}</span> */}
                            </div>
                          )}
                          {/* /> */}
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-sm">
                          Available for new projects in {getReleaseText()} days.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {experience && (
                      <span className="text-xs text-muted-foreground text-center">
                        {experience}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {variant === "default" && (
                <Badge
                  className="text-xs text-white shrink-0"
                  style={{ backgroundColor: techColor }}
                >
                  {developer?.technology?.name}
                </Badge>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {activeProjects.length > 0 ? (
            <div className="space-y-2">
              <div>
                <p className="font-semibold text-sm">{developer.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {developer?.technology?.name}
                </p>
              </div>
              <div className="border-t pt-1">
                <p className="font-semibold text-sm mb-1">Assigned Projects:</p>
                <ul className="list-disc list-inside text-xs text-muted-foreground">
                  {activeProjects.map((project: any) => (
                    <li key={project.id}>
                      <span className="font-medium">{project.name}</span>
                      {project.isCurrentProject && (
                        <span className="text-green-600 ml-1">(Current)</span>
                      )}
                      {/* {typeof project.percentageComplete === "number" && (
                        <span className="ml-1 text-[10px] text-gray-500">
                          {project.percentageComplete}%
                        </span>
                      )} */}
                      {project.workingHours && (
                        <span className="ml-1 text-[10px] text-blue-600">
                          • {project.workingHours} hrs
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-semibold text-sm">{developer.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {developer?.technology?.name}
              </p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

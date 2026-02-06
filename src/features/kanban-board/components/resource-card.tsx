// src/components/resource-card.tsx
import { Badge } from "@/components/ui/badge";
import { ProjectChip } from "./project-chip";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase } from "lucide-react";
// import { useUsersStore } from "../../users/stores/useUsersStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ✅ Helper: Calculate years of experience
const getYearsOfExperience = (
  startDate: string | null | undefined
): string | null => {
  if (!startDate) return null;

  const start = new Date(startDate);
  const now = new Date();

  const diffInMs = now.getTime() - start.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  const diffInYears = diffInDays / 365.25;

  // Always show experience in years with one decimal place
  const formattedYears =
    diffInYears < 10 ? diffInYears.toFixed(1) : Math.round(diffInYears);

  return `${formattedYears} Year`;
};

export const ResourceCard = ({
  developer,
  isProjectHandler,
}: {
  developer: any;
  isProjectHandler?: boolean;
}) => {
  const techColor = developer?.technology?.color || "#e2e8f0";

  const { setNodeRef, isOver } = useDroppable({
    id: developer.id,
  });

  const experience = getYearsOfExperience(developer?.careerStartDate);
  const profilePic = developer.profilePicUrl || developer.avatarUrl;

  const joinDate = developer?.careerStartDate
    ? new Date(developer.careerStartDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const allProjects = [
    ...(developer.activeProjects || []),
    ...(developer.handledProjects || []),
  ];

  const PROJECT_LIMIT = isProjectHandler ? 6 : 2;
  const displayedProjects = allProjects.slice(0, PROJECT_LIMIT);
  const overflowCount = allProjects.length - PROJECT_LIMIT;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-white border-l-4 border-b-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 relative h-full flex flex-col",
        "p-4 sm:p-5 md:p-6",
        !developer?.technology?.color && "border-b-gray-300",
        isOver && "ring-2 ring-primary bg-primary/5"
      )}
      style={
        developer?.technology?.color
          ? {
              borderBottomColor: developer.technology.color,
              borderLeftColor: developer.technology.color,
            }
          : undefined
      }
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="flex gap-3 items-center min-w-0">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 border-2 border-white shadow-sm">
            <AvatarImage
              src={
                profilePic ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${developer.fullName}`
              }
              alt={developer.fullName}
            />
            <AvatarFallback>{developer.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <h3 className="text-sm sm:text-md font-semibold text-gray-800 truncate">
              {developer.fullName}
            </h3>

            {experience && (
              <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground font-medium">
                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                <span>{experience}</span>
              </div>
            )}
          </div>
        </div>

        {!isProjectHandler && (
          <div className="flex sm:flex-col items-start sm:items-end gap-1">
            <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">
              Join Date
            </p>
            <p className="text-xs font-semibold text-gray-800">{joinDate}</p>
          </div>
        )}
      </div>

      {/* Technology Badge */}
      {developer?.technology && (
        <div className="mb-3">
          <Badge
            className="text-[10px] text-white px-2.5 py-0.5 rounded uppercase font-bold tracking-wider"
            style={{ backgroundColor: techColor }}
          >
            {developer?.technology?.name}
          </Badge>
        </div>
      )}

      {/* Projects */}
      <div className="mb-4 border-t border-gray-50 pt-4 flex-grow">
        {allProjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {displayedProjects.map((project: any) => (
              <ProjectChip key={project.id} project={project} />
            ))}

            {overflowCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="text-xs cursor-default whitespace-nowrap"
                    >
                      +{overflowCount} more
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <ul className="text-xs space-y-1">
                      {allProjects.slice(PROJECT_LIMIT).map((p: any) => (
                        <li key={p.id} className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              p.isCurrentProject ? "bg-green-500" : "bg-primary"
                            )}
                          />
                          {p.name}
                        </li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No projects assigned.
          </p>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border-t border-gray-100 pt-4 mt-auto">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider mb-1">
            Email
          </p>
          <p
            className="text-xs font-semibold text-gray-800 truncate"
            title={developer.email}
          >
            {developer.email || "N/A"}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider mb-1">
            Role
          </p>
          <p className="text-xs font-semibold text-gray-800 capitalize">
            {developer.role?.replace(/_/g, " ") || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/resource-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectChip } from "./project-chip";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

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
  const diffInMonths = diffInDays / 30.44; // avg days per month

  if (diffInYears < 1) {
    const months = Math.floor(diffInMonths);
    return `${months} month${months !== 1 ? "s" : ""}`;
  } else {
    const years =
      diffInYears < 10 ? diffInYears.toFixed(1) : Math.round(diffInYears);
    return `${years} year${Number(years) > 1 ? "s" : ""}`;
  }
};

export const ResourceCard = ({ developer }: { developer: any }) => {
  const techColor = developer?.technology?.color || "#e2e8f0";

  // --- dnd-kit hook to make the card a drop zone ---
  const { setNodeRef, isOver } = useDroppable({
    id: developer.id, // The unique ID for this droppable area
  });

  // ✅ Calculate developer experience
  const experience = getYearsOfExperience(developer?.careerStartDate);

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "overflow-hidden transition-shadow duration-300 hover:shadow-lg py-0",
        isOver ? "ring-2 ring-pink-500 ring-offset-2" : ""
      )}
    >
      <CardContent className="p-0">
        <div className="grid grid-cols-1 items-start lg:grid-cols-[230px_1fr]">
          {/* Left Side: Developer Details */}
          <div
            className={`flex flex-col gap-3 p-4 bg-secondary/50 h-full ${
              developer?.technology?.color ? "border-l-8" : ""
            }`}
            style={
              developer?.technology?.color
                ? { borderColor: developer.technology.color }
                : undefined
            }
          >
            <div className="flex w-full items-start justify-between">
              <div className="flex justify-between w-full overflow-hidden">
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-card-foreground wrap-break-word leading-tight">
                    {developer.fullName}
                  </h3>

                  {/* ✅ Show Experience under the name */}
                  {experience && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {experience} of experience
                    </p>
                  )}
                </div>

                {developer?.technology && (
                  <div className="mt-auto flex justify-start">
                    <Badge
                      className="text-xs text-white"
                      style={{ backgroundColor: techColor }}
                    >
                      {developer?.technology?.name}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Displays only projects from the initial API fetch */}
          <div className="p-4 min-h-[100px] bg-transparent">
            {developer?.activeProjects?.length > 0 ||
            developer?.handledProjects?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {developer.activeProjects?.map((project: any) => (
                  <ProjectChip
                    key={`assigned-${project.id}`}
                    project={project}
                  />
                ))}
                {developer.handledProjects?.map((project: any) => (
                  <ProjectChip
                    key={`handled-${project.id}`}
                    project={project}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center text-sm text-muted-foreground h-full min-h-[80px]">
                <p>No projects assigned.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

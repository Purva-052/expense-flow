/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/resource-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectChip } from "./project-chip";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Briefcase, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ✅ Helper: Get initials from full name (e.g. "John Doe" → "JD")
const getInitials = (fullName?: string | null): string => {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// ✅ Helper: Calculate years of experience
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

export const ResourceCard = ({
  developer,
  // isProjectHandler,
}: {
  developer: any;
  isProjectHandler?: boolean;
}) => {
  const techColor = developer?.technology?.color || "#e2e8f0";

  // --- dnd-kit hook to make the card a drop zone ---
  const { setNodeRef, isOver } = useDroppable({
    id: developer.id, // The unique ID for this droppable area
  });

  // ✅ Calculate developer experience
  const experience = formatExperience(developer?.careerStartDate);
  const profilePic = developer.profilePicUrl || developer.avatarUrl;

  // const joinDate = developer?.careerStartDate
  //   ? new Date(developer.careerStartDate).toLocaleDateString("en-GB", {
  //       day: "2-digit",
  //       month: "short",
  //       year: "numeric",
  //     })
  //   : "N/A";

  const allProjects = [
    ...(developer.activeProjects || []),
    ...(developer.handledProjects || []),
  ];

  // Show all projects without limiting
  const displayedProjects = allProjects;

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
            {/* Top Section: Avatar, Name, Experience */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0 border-2 border-white shadow-sm">
                <AvatarImage
                  src={profilePic || undefined}
                  alt={developer.fullName}
                />
                <AvatarFallback className="text-xs font-semibold">{getInitials(developer.fullName)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="text-sm font-bold text-card-foreground leading-tight">
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

            {/* Join Date */}
            {/* {!isProjectHandler && (
              <div className="flex items-center justify-between gap-1">
                <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">
                  Join Date
                </p>
                <p className="text-xs font-semibold text-gray-800">
                  {joinDate}
                </p>
              </div>
            )} */}

            {/* Technology Badge */}
            {developer?.technology && (
              <div className="flex justify-start">
                <Badge
                  className="text-xs text-white"
                  style={{ backgroundColor: techColor }}
                >
                  {developer?.technology?.name}
                </Badge>
              </div>
            )}

            {/* Skills/Strengths Section at Bottom of Left Side */}
            {developer?.skills?.length > 0 && (
              <div className="mt-auto pt-3 border-t border-gray-200/30">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="h-3 w-3 text-primary animate-pulse" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    Skills
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {developer.skills.map((s: any) => (
                    <Badge
                      key={s.skill.id}
                      variant="secondary"
                      className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-transparent px-2.5 py-0.5 font-semibold text-[10px] transition-colors duration-200 uppercase"
                    >
                      {s.skill.skillName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Projects */}
          <div className="p-4 flex flex-col min-h-[100px] bg-transparent">
            {displayedProjects?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {displayedProjects.map((project: any) => (
                  <ProjectChip
                    key={`project-${project.id}`}
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

// src/components/resource-card.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectChip } from "./project-chip";

export const ResourceCard = ({ developer }: { developer: any }) => {
  const techColor = developer?.technology?.color || "#e2e8f0";

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg py-0 ">
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
            {/* Header Info */}
            <div className="flex w-full items-start justify-between ">
              <div className="flex justify-between w-full overflow-hidden">
                <h3 className="text-lg font-bold text-card-foreground wrap-break-word leading-tight">
                  {developer.fullName}
                </h3>
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
            {/* Technology Badge (at the bottom) */}
          </div>

          {/* Right Side: Assigned Projects */}
          <div className="p-4 min-h-[100px] bg-transparent">
            {developer?.activeProjects &&
            developer?.activeProjects?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {developer?.activeProjects?.map((project: any) => (
                  <ProjectChip key={project.id} project={project} />
                ))}
              </div>
            ) : developer?.handledProjects &&
              developer?.handledProjects?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {developer?.handledProjects?.map((project: any) => (
                  <ProjectChip key={project.id} project={project} />
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

// src/components/resource-card.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { ProjectChip } from "./project-chip";

export const ResourceCard = ({ developer }: { developer: any }) => {
  const techColor = developer?.technology?.color || "#e2e8f0";

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg py-0">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 items-start lg:grid-cols-[230px_1fr]">
          {/* Left Side: Developer Details */}
          <div
            className="flex flex-col gap-3 p-4 bg-secondary/50 border-l-8 h-full"
            style={{ borderColor: techColor }} // Use tech color for the border
          >
            {/* Header Info */}
            <div className="flex w-full items-start justify-between gap-2">
              <div className="flex flex-1 items-start gap-3 overflow-hidden">
                <div className="flex h-6 items-center shrink-0" title="Developer">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <h3 className="text-lg font-bold text-card-foreground wrap-break-word leading-tight">
                    {developer.fullName}
                  </h3>
                  <span className="text-sm text-muted-foreground capitalize">
                    {developer.role?.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Technology Badge (at the bottom) */}
            <div className="mt-auto flex justify-start">
              <Badge
                className="text-xs text-white"
                style={{ backgroundColor: techColor }}
              >
                {developer?.technology?.name}
              </Badge>
            </div>
          </div>

          {/* Right Side: Assigned Projects */}
          <div className="p-4 min-h-[100px] bg-transparent">
            {developer?.activeProjects?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {developer?.activeProjects?.map((project: any) => (
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
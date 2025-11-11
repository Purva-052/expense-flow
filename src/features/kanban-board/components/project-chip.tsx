/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/project-chip.tsx
import { cn } from '@/lib/utils';
import { Briefcase } from 'lucide-react';

// This component is now PURELY for display. It has no drag-and-drop code.
export const ProjectChip = ({ project }: { project: any }) => {
  const completion = project.percentageComplete ?? 0;

  const getBorderColor = () => {
    if (completion === 100) return 'border-green-500'; // Completed
    if (project.currentStatus === 'active') return 'border-blue-500'; // Active
    return 'border-gray-300'; // Default
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-3 text-sm shadow-sm bg-secondary/50',
        getBorderColor()
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 truncate ">
          {project.isCurrentProject && (
            <span
              className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"
              title="Currently working on this project"
            />
          )}
          <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate text-wrap font-bold text-card-foreground">
            {project.name}
          </span>
          <span className="text-sm font-semibold text-muted-foreground shrink-0">
            ({completion}%)
          </span>
        </div>
      </div>
    </div>
  );
};

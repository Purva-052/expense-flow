// src/components/developer-chip.tsx
import { useSortable } from "@dnd-kit/sortable";
import type { Developer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function DeveloperChip({
  developer,
  containerId,
  onClick,
}: {
  developer: Developer;
  containerId: string;
  onClick?: () => void; // Added optional onClick handler
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: developer.id,
    data: { containerId, developer },
  });

  const techColor = developer?.technology?.color || "#e2e8f0";
  const ringColor = techColor + "50";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick} // Attach the onClick handler
      style={{
        backgroundColor: techColor + "1A",
        borderColor: techColor,
        boxShadow: isDragging ? `0 0 0 3px ${ringColor}` : undefined,
      }}
      className={cn(
        " w-fit flex items-center gap-4 justify-between rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition-all duration-200 cursor-grab",
        onClick && "cursor-pointer", // Make it look clickable if handler is present
        isDragging && "opacity-50"
      )}
    >
      {/* Left side: Developer info */}
      <div className="flex flex-col gap-0.5 truncate w-full">
        <span className="truncate font-medium">{developer.fullName}</span>
        <span className="truncate text-xs text-gray-500">
          {developer.email}
        </span>
      </div>

      {/* Right side: Technology badge */}
      <Badge
        variant="secondary"
        className="text-xs"
        style={{
          backgroundColor: techColor,
          color: "#fff",
        }}
      >
        {developer?.technology?.name}
      </Badge>
    </div>
  );
}